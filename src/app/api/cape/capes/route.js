/**
 * Cape 能力列表代理
 */

const CAPE_URL = process.env.CAPE_API_URL || 'http://localhost:8000';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.toString();

        const res = await fetch(`${CAPE_URL}/api/capes${query ? `?${query}` : ''}`);

        if (!res.ok) {
            return new Response(
                JSON.stringify({ error: `Cape API error: ${res.status}` }),
                { status: res.status, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const data = await res.json();
        return Response.json(data);
    } catch (error) {
        console.error('[Cape Capes Proxy] Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();

        // 匹配能力
        const res = await fetch(`${CAPE_URL}/api/capes/match`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            return new Response(
                JSON.stringify({ error: `Cape API error: ${res.status}` }),
                { status: res.status, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return Response.json(await res.json());
    } catch (error) {
        console.error('[Cape Capes Proxy] Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
