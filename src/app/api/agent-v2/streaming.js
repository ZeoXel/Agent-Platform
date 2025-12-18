/**
 * 流式响应转换器
 *
 * 将 LangGraph 的流转换为 SSE 格式，保持与前端的兼容性
 */

/**
 * 创建 SSE 流
 *
 * @param {AsyncIterable} agentStream - LangGraph agent.stream() 返回的流
 * @param {Object} sessionState - 会话状态（用于更新 lastImages）
 * @returns {ReadableStream} SSE 格式的 ReadableStream
 */
export function createSSEStream(agentStream, sessionState) {
    const encoder = new TextEncoder();

    return new ReadableStream({
        async start(controller) {
            try {
                // 发送初始状态：思考中
                controller.enqueue(
                    encoder.encode(
                        `data: ${JSON.stringify({ type: "status", status: "thinking" })}\n\n`
                    )
                );

                let currentToolCall = null;
                let accumulatedContent = "";
                let lastMessageId = null;

                for await (const chunk of agentStream) {
                    // LangGraph streamMode: "values" 返回完整状态
                    const messages = chunk.messages || [];

                    if (messages.length === 0) continue;

                    const lastMessage = messages[messages.length - 1];

                    if (!lastMessage) continue;

                    // 避免重复处理同一条消息
                    if (lastMessage.id === lastMessageId) continue;
                    lastMessageId = lastMessage.id;

                    // 调试日志
                    console.log(`[流式响应] 消息类型: ${lastMessage.constructor?.name}, role: ${lastMessage._getType?.()}`)

                    // === 处理工具调用 ===
                    if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
                        const toolCall = lastMessage.tool_calls[0];

                        if (toolCall.name !== currentToolCall) {
                            currentToolCall = toolCall.name;

                            // 发送工具执行状态
                            let status = "processing";
                            if (toolCall.name === "generate_image") {
                                status = "generating";
                            } else if (toolCall.name === "edit_image") {
                                status = "editing";
                            }

                            controller.enqueue(
                                encoder.encode(
                                    `data: ${JSON.stringify({ type: "status", status })}\n\n`
                                )
                            );

                            console.log(`[流式响应] 工具调用: ${toolCall.name}`);
                        }
                    }

                    // === 处理工具返回结果 ===
                    if (lastMessage.name && typeof lastMessage.content === "string") {
                        try {
                            const result = JSON.parse(lastMessage.content);

                            // 如果包含图片，发送图片
                            if (result.images && Array.isArray(result.images) && result.images.length > 0) {
                                // 更新会话状态
                                const imageUrls = result.images
                                    .map((img) => img.url)
                                    .filter(Boolean);
                                if (imageUrls.length > 0) {
                                    sessionState.updateLastImages(imageUrls);
                                }

                                // 发送图片给前端
                                controller.enqueue(
                                    encoder.encode(
                                        `data: ${JSON.stringify({ type: "images", images: result.images })}\n\n`
                                    )
                                );

                                console.log(`[流式响应] 返回 ${result.images.length} 张图片`);
                            }

                            // 如果包含错误，记录日志
                            if (result.error) {
                                console.error(`[流式响应] 工具执行错误: ${result.error}`);
                            }
                        } catch (e) {
                            // 不是 JSON 格式，可能是纯文本工具响应，忽略
                            console.warn("[流式响应] 工具结果不是 JSON:", lastMessage.content.slice(0, 100));
                        }
                    }

                    // === 处理 AI 回复内容（流式文本）===
                    if (
                        lastMessage._getType &&
                        lastMessage._getType() === "ai" &&
                        typeof lastMessage.content === "string"
                    ) {
                        const newContent = lastMessage.content.slice(accumulatedContent.length);

                        if (newContent.length > 0) {
                            controller.enqueue(
                                encoder.encode(
                                    `data: ${JSON.stringify({ type: "content", content: newContent })}\n\n`
                                )
                            );
                            accumulatedContent = lastMessage.content;
                        }
                    }
                }

                // 发送完成信号
                controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
                );
                console.log("[流式响应] 流结束");
                controller.close();
            } catch (error) {
                console.error("[流式响应] 错误:", error);

                // 发送错误信号
                const errorMessage = error?.message || String(error) || "未知错误";
                controller.enqueue(
                    encoder.encode(
                        `data: ${JSON.stringify({ type: "error", error: errorMessage })}\n\n`
                    )
                );
                controller.close();
            }
        },
    });
}
