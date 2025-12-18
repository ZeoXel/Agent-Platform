/**
 * Agent V2 API 路由
 *
 * 混合方案：保留架构优势 + 手动工具调用（避免 LangGraph 兼容性问题）
 * 已集成 Cape 文档处理能力
 */

import { getOrCreateSession } from "./session.js";
import { TOOL_CONFIGS } from "./tools/registry.js";
import { executeGenerateImage } from "./tools/generate-image.js";
import { executeEditImage } from "./tools/edit-image.js";
import { loadCapeTools, convertToToolConfigs } from "./tools/cape-loader.js";
import { executeCape, createCapeExecutors } from "./tools/cape-executor.js";

// 原生工具执行器
const NATIVE_EXECUTORS = {
    generate_image: executeGenerateImage,
    edit_image: executeEditImage,
};

// 动态工具执行器 (包含 Cape)
let TOOL_EXECUTORS = { ...NATIVE_EXECUTORS };
let ALL_TOOL_CONFIGS = { ...TOOL_CONFIGS };
let toolsInitialized = false;

// 初始化 Cape 工具
async function initCapeTools() {
    if (toolsInitialized) return;

    try {
        const capeTools = await loadCapeTools();
        if (capeTools.length > 0) {
            const capeConfigs = convertToToolConfigs(capeTools);
            ALL_TOOL_CONFIGS = { ...TOOL_CONFIGS, ...capeConfigs };

            const capeExecutors = createCapeExecutors(Object.keys(capeConfigs));
            TOOL_EXECUTORS = { ...NATIVE_EXECUTORS, ...capeExecutors };

            console.log(`[Agent V2] 已加载 ${capeTools.length} 个 Cape 工具`);
        }
    } catch (error) {
        console.warn("[Agent V2] Cape 工具加载失败:", error.message);
    }

    toolsInitialized = true;
}

// 改进的 System Prompt
const SYSTEM_PROMPT = `你是用户的智能创意助理，专注于理解用户的视觉创作需求。

你拥有以下能力：
1. generate_image - 从零生成新图片
2. edit_image - 修改已有图片（会自动使用对话中最近生成的图片）

理解用户意图的关键规则：
- 创作意图：用户说"生成"、"画"、"创建"、"做一个"、"帮我设计"、"我想要一张XXX的图" → 使用 generate_image
- 修改意图：用户说"修改"、"改成"、"加上"、"去掉"、"编辑"、"换成"、"调整"、"优化"，或使用代词如"它"、"这张图"、"上面" → 使用 edit_image
- 模糊意图：如果用户只说"我想要一张XXX的图"，默认理解为生成新图（generate_image）
- 连续创作：如果用户在之前的对话中刚生成了图片，现在又提出修改要求（即使没有明确说"编辑"），应理解为编辑意图

IMPORTANT 工具使用细节：
- 当用户使用"它"、"这个"、"加个XX"等代词或隐含指代时，ALWAYS 调用 edit_image 工具
- edit_image 工具会自动从会话状态中获取最近生成的图片URL，你无需在参数中提供 image_url
- 如果用户说"给它加个XX"、"把它改成XX"，直接调用 edit_image，不要询问用户
- 工具返回 JSON 格式结果，解析后用简洁、友好的中文告诉用户你完成了什么

交互原则：
- 让用户轻松实现创意想法
- 对于明确的编辑请求，直接执行，不要过度询问
- 只有在真正不清楚用户意图时才询问澄清
- 回复要自然、简洁
- 如果工具执行失败，用友好的方式告诉用户问题并建议解决方案

记住：你的目标是成为用户最好的创意伙伴！`;

// 将工具配置转换为 OpenAI function calling 格式
function convertToolsToFunctions() {
    return Object.values(TOOL_CONFIGS).map((config) => ({
        type: "function",
        function: {
            name: config.name,
            description: config.description,
            parameters: {
                type: "object",
                properties: Object.entries(config.parameters).reduce(
                    (acc, [key, param]) => {
                        acc[key] = {
                            type: param.type,
                            description: param.description,
                        };
                        if (param.enum) {
                            acc[key].enum = param.enum;
                        }
                        return acc;
                    },
                    {}
                ),
                required: Object.entries(config.parameters)
                    .filter(([_, param]) => param.required)
                    .map(([key]) => key),
            },
        },
    }));
}

// 调用 ChatCompletion API（非流式）
async function callChatCompletion({ messages, tools, toolChoice }) {
    const apiKey = process.env.OPENAI_API_KEY;
    const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com";
    const model = process.env.MODEL_NAME || "claude-haiku-4-5-20251001";

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
        throw new Error(`LLM 调用失败: ${res.status} ${text}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message;
}

// 调用 ChatCompletion API（流式）
async function callChatCompletionStream({ messages, tools, toolChoice }) {
    const apiKey = process.env.OPENAI_API_KEY;
    const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com";
    const model = process.env.MODEL_NAME || "claude-haiku-4-5-20251001";

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
        throw new Error(`LLM 流式调用失败: ${res.status} ${text}`);
    }

    return res.body;
}

export async function POST(request) {
    const encoder = new TextEncoder();

    try {
        const body = await request.json();
        const clientMessages = Array.isArray(body.messages) ? body.messages : [];
        const sessionId = body.sessionId || "default";

        console.log(`[Agent V2] 收到请求，会话ID: ${sessionId}，消息数: ${clientMessages.length}`);

        // 获取会话状态
        const sessionState = getOrCreateSession(sessionId);

        // 收集用户上传的图片
        const latestUserMessage = [...clientMessages].reverse().find((m) => m.role === "user");
        if (latestUserMessage?.attachments?.length) {
            const uploadedUrls = latestUserMessage.attachments
                .map((file) => file.url)
                .filter(Boolean);
            if (uploadedUrls.length) {
                sessionState.updateLastImages(uploadedUrls);
                console.log(`[Agent V2] 用户上传了 ${uploadedUrls.length} 张图片`);
            }
        }

        // 构建消息历史
        const messages = [
            { role: "system", content: SYSTEM_PROMPT },
        ];

        // 如果会话中有最近生成的图片，添加上下文信息
        if (sessionState.lastImages && sessionState.lastImages.length > 0) {
            messages.push({
                role: "system",
                content: `[系统消息] 当前会话中最近生成的图片: ${sessionState.lastImages.join(", ")}。如果用户提到"它"、"这个"、"这张图"等代词，指的就是这些图片。`,
            });
        }

        messages.push(...clientMessages.map((m) => ({ role: m.role, content: m.content })));

        console.log(`[Agent V2] 发送给 LLM 的消息:`, JSON.stringify(messages, null, 2));

        // 获取工具配置
        const tools = convertToolsToFunctions();

        // 创建流式响应
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    // 发送状态：思考中
                    controller.enqueue(
                        encoder.encode(
                            `data: ${JSON.stringify({ type: "status", status: "thinking" })}\n\n`
                        )
                    );

                    // 第一轮：判断是否需要工具
                    console.log("[Agent V2] 第一轮调用：判断工具需求");
                    const firstResponse = await callChatCompletion({
                        messages,
                        tools,
                        toolChoice: "auto",
                    });

                    const toolCalls = firstResponse.tool_calls || [];

                    if (toolCalls.length === 0) {
                        // 不需要工具，直接返回文本
                        console.log("[Agent V2] 无需工具，直接返回");
                        controller.enqueue(
                            encoder.encode(
                                `data: ${JSON.stringify({ type: "content", content: firstResponse.content })}\n\n`
                            )
                        );
                        controller.enqueue(
                            encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
                        );
                        controller.close();
                        return;
                    }

                    // 执行工具调用
                    console.log(`[Agent V2] 执行 ${toolCalls.length} 个工具调用`);
                    const toolResults = [];

                    for (const toolCall of toolCalls) {
                        const toolName = toolCall.function.name;
                        const toolArgs = JSON.parse(toolCall.function.arguments);

                        // 发送工具执行状态
                        let status = "processing";
                        if (toolName === "generate_image") {
                            status = "generating";
                        } else if (toolName === "edit_image") {
                            status = "editing";
                        }

                        controller.enqueue(
                            encoder.encode(
                                `data: ${JSON.stringify({ type: "status", status })}\n\n`
                            )
                        );

                        console.log(`[Agent V2] 执行工具: ${toolName}`, toolArgs);

                        try {
                            const executor = TOOL_EXECUTORS[toolName];
                            if (!executor) {
                                throw new Error(`未找到工具执行器: ${toolName}`);
                            }

                            // 执行工具（传入会话状态）
                            const resultStr =
                                toolName === "edit_image"
                                    ? await executor(toolArgs, sessionState)
                                    : await executor(toolArgs);

                            const result = JSON.parse(resultStr);

                            // 更新会话状态中的图片
                            if (result.images && result.images.length > 0) {
                                const imageUrls = result.images.map((img) => img.url).filter(Boolean);
                                sessionState.updateLastImages(imageUrls);

                                // 发送图片给前端
                                controller.enqueue(
                                    encoder.encode(
                                        `data: ${JSON.stringify({ type: "images", images: result.images })}\n\n`
                                    )
                                );
                            }

                            toolResults.push({
                                tool_call_id: toolCall.id,
                                role: "tool",
                                name: toolName,
                                content: resultStr,
                            });
                        } catch (error) {
                            console.error(`[Agent V2] 工具执行失败:`, error);
                            toolResults.push({
                                tool_call_id: toolCall.id,
                                role: "tool",
                                name: toolName,
                                content: JSON.stringify({ error: error.message }),
                            });
                        }
                    }

                    // 第二轮：基于工具结果生成回复
                    console.log("[Agent V2] 第二轮调用：生成最终回复");
                    const secondMessages = [
                        ...messages,
                        firstResponse,
                        ...toolResults,
                    ];

                    const streamBody = await callChatCompletionStream({
                        messages: secondMessages,
                        tools,
                        toolChoice: "none",
                    });

                    // 解析流式响应
                    const reader = streamBody.getReader();
                    const decoder = new TextDecoder();

                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        const chunk = decoder.decode(value, { stream: true });
                        const lines = chunk.split("\n");

                        for (const line of lines) {
                            if (line.startsWith("data: ")) {
                                const data = line.slice(6).trim();
                                if (data === "[DONE]") continue;

                                try {
                                    const parsed = JSON.parse(data);
                                    const delta = parsed.choices?.[0]?.delta;

                                    if (delta?.content) {
                                        controller.enqueue(
                                            encoder.encode(
                                                `data: ${JSON.stringify({ type: "content", content: delta.content })}\n\n`
                                            )
                                        );
                                    }
                                } catch (e) {
                                    // 忽略解析错误
                                }
                            }
                        }
                    }

                    // 发送完成信号
                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
                    );
                    console.log("[Agent V2] 流式响应完成");
                    controller.close();
                } catch (error) {
                    console.error("[Agent V2] 错误:", error);
                    controller.enqueue(
                        encoder.encode(
                            `data: ${JSON.stringify({ type: "error", error: error.message })}\n\n`
                        )
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
    } catch (error) {
        console.error("[Agent V2] 错误:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}
