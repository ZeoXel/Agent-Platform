// 图像 Agent API - 参照 Python 版本重写
// 支持图像生成和编辑，agent 自动判断使用哪个工具

import { AGENT_CONFIG, TOOL_NAMES } from "./config.js";
import { getToolExecutor } from "./tools.js";

// 会话状态存储（简单实现，生产环境建议用 Redis 等）
const sessionStates = new Map();

// 获取或创建会话状态
function getSessionState(sessionId) {
  if (!sessionStates.has(sessionId)) {
    sessionStates.set(sessionId, {
      lastImages: [], // 追踪最近生成的图片URL
      createdAt: Date.now(),
    });
  }
  return sessionStates.get(sessionId);
}

// 清理过期会话（超过1小时）
function cleanupSessions() {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  for (const [sessionId, state] of sessionStates.entries()) {
    if (now - state.createdAt > oneHour) {
      sessionStates.delete(sessionId);
    }
  }
}

// 定期清理（每10分钟）
setInterval(cleanupSessions, 10 * 60 * 1000);

// 调用聊天模型（非流式）
async function callChatCompletion({ messages, model, tools, toolChoice }) {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com";

  if (!apiKey) {
    throw new Error("缺少 OPENAI_API_KEY 环境变量");
  }

  const res = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      tools,
      tool_choice: toolChoice,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`聊天模型请求失败: ${res.status} ${text}`);
  }

  const data = await res.json();
  const choice = data.choices?.[0];
  if (!choice) {
    throw new Error("未从模型获得响应");
  }
  return choice.message;
}

// 调用聊天模型（流式）
async function callChatCompletionStream({ messages, model, tools, toolChoice }) {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com";

  if (!apiKey) {
    throw new Error("缺少 OPENAI_API_KEY 环境变量");
  }

  const res = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      tools,
      tool_choice: toolChoice,
      stream: true,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`聊天模型请求失败: ${res.status} ${text}`);
  }

  return res.body;
}

export async function POST(request) {
  const encoder = new TextEncoder();

  try {
    const body = await request.json();
    const clientMessages = Array.isArray(body.messages) ? body.messages : [];
    const sessionId = body.sessionId || "default";
    const model = body.model || AGENT_CONFIG.model;

    // 获取会话状态
    const sessionState = getSessionState(sessionId);

    // 构建消息历史
    const messages = [
      AGENT_CONFIG.systemPrompt,
      ...clientMessages.map((m) => ({ role: m.role, content: m.content })),
    ];

    // 创建流式响应
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 发送状态：思考中
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "status", status: "thinking" })}\n\n`)
          );

          // 第一轮：判断是否需要工具
          const firstResponse = await callChatCompletion({
            model,
            messages,
            tools: AGENT_CONFIG.tools,
            toolChoice: "auto",
          });

          const toolCalls = firstResponse.tool_calls || [];

          // 如果不需要工具，流式返回文本
          if (!toolCalls.length) {
            // 直接开始流式输出，不需要额外的"回复中"状态
            const responseStream = await callChatCompletionStream({
              model,
              messages,
              tools: AGENT_CONFIG.tools,
              toolChoice: "none",
            });

            const reader = responseStream.getReader();
            const decoder = new TextDecoder();

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split("\n").filter((line) => line.trim() !== "");

              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  const data = line.slice(6);
                  if (data === "[DONE]") continue;

                  try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices?.[0]?.delta?.content;
                    if (content) {
                      controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ type: "content", content })}\n\n`)
                      );
                    }
                  } catch (e) {
                    // 忽略解析错误
                  }
                }
              }
            }

            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
            controller.close();
            return;
          }

          // 执行工具调用
          const toolMessages = [];
          const collectedImages = [];

          for (const call of toolCalls) {
            const toolName = call?.function?.name;
            const executor = getToolExecutor(toolName);

            if (!executor) {
              console.warn(`未知工具: ${toolName}`);
              continue;
            }

            // 发送工具执行状态
            let statusMessage = "处理中...";
            if (toolName === TOOL_NAMES.GENERATE_IMAGE) {
              statusMessage = "generating";
            } else if (toolName === TOOL_NAMES.EDIT_IMAGE) {
              statusMessage = "editing";
            }

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "status", status: statusMessage })}\n\n`)
            );

            let args = {};
            try {
              args = call.function?.arguments ? JSON.parse(call.function.arguments) : {};
            } catch (e) {
              args = {};
            }

            try {
              const result =
                toolName === TOOL_NAMES.EDIT_IMAGE
                  ? await executor(args, sessionState.lastImages)
                  : await executor(args);

              if (Array.isArray(result.images) && result.images.length > 0) {
                collectedImages.push(...result.images);
                sessionState.lastImages = result.images.map((img) => img.url).filter(Boolean);
              }

              toolMessages.push({
                role: "tool",
                tool_call_id: call.id,
                name: toolName,
                content: JSON.stringify(result),
              });
            } catch (error) {
              toolMessages.push({
                role: "tool",
                tool_call_id: call.id,
                name: toolName,
                content: JSON.stringify({ error: error.message }),
              });
            }
          }

          // 发送图片
          if (collectedImages.length > 0) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "images", images: collectedImages })}\n\n`)
            );
          }

          // 第二轮：流式输出最终回复（直接开始，不需要"回复中"状态）
          const finalStream = await callChatCompletionStream({
            model,
            messages: [...messages, firstResponse, ...toolMessages],
            tools: AGENT_CONFIG.tools,
            toolChoice: "none",
          });

          const reader = finalStream.getReader();
          const decoder = new TextDecoder();

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n").filter((line) => line.trim() !== "");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") continue;

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ type: "content", content })}\n\n`)
                    );
                  }
                } catch (e) {
                  // 忽略解析错误
                }
              }
            }
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
          controller.close();
        } catch (error) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "error", error: error.message })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("Agent error:", err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "未知错误",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
