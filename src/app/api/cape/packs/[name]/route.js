/**
 * Cape Pack 详情代理
 * GET: 获取特定 pack 详情
 */

const CAPE_URL = process.env.CAPE_API_URL || 'http://localhost:8000';

export async function GET(request, { params }) {
    try {
        const { name } = await params;
        const targetUrl = `${CAPE_URL}/api/packs/${name}`;

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
        console.error('Pack detail proxy error:', error);
        return Response.json(
            { error: 'Failed to fetch pack detail', details: error.message },
            { status: 500 }
        );
    }
}
