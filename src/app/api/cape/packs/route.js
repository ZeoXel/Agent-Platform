/**
 * Cape Packs 代理
 * GET: 获取 packs 列表
 */

const CAPE_URL = process.env.CAPE_API_URL || 'http://localhost:8000';

export async function GET(request) {
    try {
        const url = new URL(request.url);
        const params = url.searchParams.toString();
        const targetUrl = `${CAPE_URL}/api/packs${params ? `?${params}` : ''}`;

        const response = await fetch(targetUrl);

        if (!response.ok) {
            return Response.json(
                { error: `Cape API error: ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return Response.json(data);
    } catch (error) {
        console.error('Packs proxy error:', error);
        return Response.json(
            { error: 'Failed to fetch packs', details: error.message },
            { status: 500 }
        );
    }
}
