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

// 调用聊天模型
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

export async function POST(request) {
  try {
    const body = await request.json();
    const clientMessages = Array.isArray(body.messages) ? body.messages : [];
    const sessionId = body.sessionId || "default"; // 前端可传入会话ID
    const model = body.model || AGENT_CONFIG.model;

    // 获取会话状态
    const sessionState = getSessionState(sessionId);

    // 构建消息历史（system prompt + 用户消息）
    const messages = [
      AGENT_CONFIG.systemPrompt,
      ...clientMessages.map((m) => ({ role: m.role, content: m.content })),
    ];

    // 第一轮：让 agent 自动判断是否需要工具
    const firstResponse = await callChatCompletion({
      model,
      messages,
      tools: AGENT_CONFIG.tools,
      toolChoice: "auto", // 让模型自己决定
    });

    const toolCalls = firstResponse.tool_calls || [];

    // 如果不需要工具，直接返回自然对话
    if (!toolCalls.length) {
      return new Response(
        JSON.stringify({ reply: firstResponse.content || "" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
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

      let args = {};
      try {
        args = call.function?.arguments
          ? JSON.parse(call.function.arguments)
          : {};
      } catch (e) {
        console.error(`工具参数解析失败: ${e.message}`);
        args = {};
      }

      try {
        // 执行工具（编辑工具需要传入 lastImages）
        const result =
          toolName === TOOL_NAMES.EDIT_IMAGE
            ? await executor(args, sessionState.lastImages)
            : await executor(args);

        // 收集生成的图片
        if (Array.isArray(result.images) && result.images.length > 0) {
          collectedImages.push(...result.images);

          // 更新会话状态中的图片
          sessionState.lastImages = result.images.map((img) => img.url).filter(Boolean);
        }

        // 构建工具返回消息
        toolMessages.push({
          role: "tool",
          tool_call_id: call.id,
          name: toolName,
          content: JSON.stringify(result),
        });
      } catch (error) {
        // 工具执行失败，返回错误信息
        toolMessages.push({
          role: "tool",
          tool_call_id: call.id,
          name: toolName,
          content: JSON.stringify({ error: error.message }),
        });
      }
    }

    // 第二轮：让模型基于工具结果生成最终回复
    const finalResponse = await callChatCompletion({
      model,
      messages: [...messages, firstResponse, ...toolMessages],
      tools: AGENT_CONFIG.tools,
      toolChoice: "none", // 不再调用工具
    });

    return new Response(
      JSON.stringify({
        reply: finalResponse.content || "",
        images: collectedImages,
        sessionId, // 返回会话ID供前端使用
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
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
