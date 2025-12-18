/**
 * 直接搜索 API - 绕过 Agent，直接返回搜索结果
 */

const CAPE_URL = process.env.CAPE_API_URL || 'http://localhost:8000';

export async function POST(request) {
    try {
        const { query } = await request.json();

        if (!query) {
            return Response.json({ error: '缺少搜索关键词' }, { status: 400 });
        }

        // 直接调用 Cape 的搜索工具执行接口
        const res = await fetch(`${CAPE_URL}/api/capes/web-search/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query }),
        });

        if (!res.ok) {
            // 如果直接执行接口不存在，回退到 chat 但用简单提示
            const chatRes = await fetch(`${CAPE_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `搜索: ${query}\n\n要求：直接列出所有搜索结果，不要筛选，不要添加额外解释。`,
                    session_id: `search-${Date.now()}`,
                    model: 'claude-3-5-sonnet-20241022',
                    stream: false,
                }),
            });

            const data = await chatRes.json();
            return Response.json({
                query,
                content: data.message?.content || '搜索失败',
                source: 'chat-fallback'
            });
        }

        const data = await res.json();
        return Response.json({
            query,
            results: data.results || [],
            summary: data.summary || '',
            source: 'direct'
        });

    } catch (error) {
        console.error('[Search API] Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
