/**
 * Cape Chat 代理
 * 直接转发 SSE 流到前端
 */

const CAPE_URL = process.env.CAPE_API_URL || 'http://localhost:8000';

export async function POST(request) {
    try {
        const body = await request.json();

        const res = await fetch(`${CAPE_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: body.message,
                session_id: body.sessionId,
                model: body.model || 'claude-3-5-sonnet-20241022',
                stream: true,
                file_ids: body.fileIds || [],
            }),
        });

        if (!res.ok) {
            const text = await res.text();
            return new Response(
                JSON.stringify({ error: `Cape API error: ${res.status} ${text}` }),
                { status: res.status, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // 直接转发 SSE 流
        return new Response(res.body, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (error) {
        console.error('[Cape Chat Proxy] Error:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
