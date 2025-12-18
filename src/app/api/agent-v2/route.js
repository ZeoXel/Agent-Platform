/**
 * Agent V2 API
 * 连接 Cape API 并转换响应格式
 *
 * Cape SSE 格式:
 *   event: session|cape_start|cape_end|content|done
 *   data: {...}
 *
 * 前端期望格式:
 *   data: {"type": "status|content|images|done|error", ...}
 */

const CAPE_URL = process.env.CAPE_API_URL || 'http://localhost:8000';

export async function POST(request) {
    try {
        const body = await request.json();
        const { sessionId, messages } = body;

        // 提取最新的用户消息
        const lastUserMessage = messages.filter(m => m.role === 'user').pop();
        if (!lastUserMessage) {
            return new Response(
                JSON.stringify({ error: '没有找到用户消息' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // 提取消息内容
        let messageContent = '';
        let fileIds = [];

        if (typeof lastUserMessage.content === 'string') {
            messageContent = lastUserMessage.content;
        } else if (Array.isArray(lastUserMessage.content)) {
            for (const part of lastUserMessage.content) {
                if (part.type === 'text') {
                    messageContent += part.text;
                }
            }
        }

        // 处理附件
        if (lastUserMessage.attachments && lastUserMessage.attachments.length > 0) {
            // TODO: 上传文件到 Cape 并获取 file_ids
        }

        console.log(`[Agent-V2] Sending to Cape: session=${sessionId}, message=${messageContent.substring(0, 50)}...`);

        const res = await fetch(`${CAPE_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: messageContent,
                session_id: sessionId,
                model: 'claude-3-5-sonnet-20241022',
                stream: true,
                file_ids: fileIds,
            }),
        });

        if (!res.ok) {
            const text = await res.text();
            console.error(`[Agent-V2] Cape API error: ${res.status} ${text}`);
            return new Response(
                JSON.stringify({ error: `Cape API error: ${res.status} ${text}` }),
                { status: res.status, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // 创建转换流 - 处理 Cape 的 event/data SSE 格式
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        let buffer = '';
        let currentEvent = '';
        let sentInitialStatus = false;

        const transformStream = new TransformStream({
            async transform(chunk, controller) {
                buffer += decoder.decode(chunk, { stream: true });

                // 按行分割处理
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // 保留最后一个不完整的行

                for (const line of lines) {
                    const trimmedLine = line.trim();

                    // 解析 event: 行
                    if (trimmedLine.startsWith('event:')) {
                        currentEvent = trimmedLine.slice(6).trim();
                        continue;
                    }

                    // 解析 data: 行
                    if (trimmedLine.startsWith('data:')) {
                        const dataStr = trimmedLine.slice(5).trim();
                        if (!dataStr) continue;

                        try {
                            const data = JSON.parse(dataStr);

                            // 根据 event 类型转换格式
                            switch (currentEvent) {
                                case 'session':
                                    // 会话开始，发送初始状态
                                    if (!sentInitialStatus) {
                                        controller.enqueue(encoder.encode(
                                            `data: ${JSON.stringify({ type: 'status', status: 'thinking' })}\n\n`
                                        ));
                                        sentInitialStatus = true;
                                    }
                                    break;

                                case 'cape_start':
                                    // 工具开始调用
                                    controller.enqueue(encoder.encode(
                                        `data: ${JSON.stringify({
                                            type: 'status',
                                            status: 'generating',
                                            cape: data.cape_name || data.cape_id
                                        })}\n\n`
                                    ));
                                    break;

                                case 'cape_end':
                                    // 工具调用结束
                                    controller.enqueue(encoder.encode(
                                        `data: ${JSON.stringify({ type: 'status', status: 'thinking' })}\n\n`
                                    ));
                                    break;

                                case 'content':
                                    // 内容输出
                                    if (data.text) {
                                        controller.enqueue(encoder.encode(
                                            `data: ${JSON.stringify({ type: 'content', content: data.text })}\n\n`
                                        ));
                                    }
                                    break;

                                case 'tool_result':
                                    // 工具结果 - 可以选择显示或隐藏
                                    if (data.result) {
                                        console.log(`[Agent-V2] Tool result:`, data.result);
                                    }
                                    break;

                                case 'error':
                                    controller.enqueue(encoder.encode(
                                        `data: ${JSON.stringify({ type: 'error', error: data.message || data.error || '未知错误' })}\n\n`
                                    ));
                                    break;

                                case 'done':
                                    controller.enqueue(encoder.encode(
                                        `data: ${JSON.stringify({ type: 'done' })}\n\n`
                                    ));
                                    break;

                                default:
                                    // 处理没有 event 标记的 data（兼容旧格式）
                                    if (data.type === 'content' || data.content || data.text) {
                                        controller.enqueue(encoder.encode(
                                            `data: ${JSON.stringify({
                                                type: 'content',
                                                content: data.content || data.text || ''
                                            })}\n\n`
                                        ));
                                    } else if (data.type === 'done' || data === '[DONE]') {
                                        controller.enqueue(encoder.encode(
                                            `data: ${JSON.stringify({ type: 'done' })}\n\n`
                                        ));
                                    }
                                    break;
                            }

                            // 重置 event
                            currentEvent = '';

                        } catch (e) {
                            // JSON 解析失败，可能是特殊数据
                            if (dataStr === '[DONE]') {
                                controller.enqueue(encoder.encode(
                                    `data: ${JSON.stringify({ type: 'done' })}\n\n`
                                ));
                            }
                        }
                    }
                }
            },
            flush(controller) {
                // 处理缓冲区中剩余的数据
                if (buffer.trim()) {
                    try {
                        if (buffer.includes('done')) {
                            controller.enqueue(encoder.encode(
                                `data: ${JSON.stringify({ type: 'done' })}\n\n`
                            ));
                        }
                    } catch (e) {
                        // 忽略
                    }
                }
                // 确保发送结束标记
                controller.enqueue(encoder.encode(
                    `data: ${JSON.stringify({ type: 'done' })}\n\n`
                ));
            }
        });

        const transformedStream = res.body.pipeThrough(transformStream);

        return new Response(transformedStream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (error) {
        console.error('[Agent-V2] Error:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
