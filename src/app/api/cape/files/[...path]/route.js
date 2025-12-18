/**
 * Cape 文件代理
 * 处理上传、下载、处理请求
 */

const CAPE_URL = process.env.CAPE_API_URL || 'http://localhost:8000';

export async function GET(request, { params }) {
    try {
        const path = (await params).path.join('/');

        const res = await fetch(`${CAPE_URL}/api/files/${path}`);

        if (!res.ok) {
            return new Response(
                JSON.stringify({ error: `Cape API error: ${res.status}` }),
                { status: res.status, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // 文件下载 - 转发响应体和头
        return new Response(res.body, {
            headers: {
                'Content-Type': res.headers.get('Content-Type') || 'application/octet-stream',
                'Content-Disposition': res.headers.get('Content-Disposition') || '',
                'Content-Length': res.headers.get('Content-Length') || '',
            },
        });
    } catch (error) {
        console.error('[Cape Files Proxy] GET Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request, { params }) {
    try {
        const path = (await params).path.join('/');
        const contentType = request.headers.get('Content-Type') || '';

        let fetchOptions = { method: 'POST' };

        if (contentType.includes('multipart/form-data')) {
            // 文件上传 - 转发 FormData
            const formData = await request.formData();
            fetchOptions.body = formData;
        } else {
            // JSON 请求
            fetchOptions.headers = { 'Content-Type': 'application/json' };
            fetchOptions.body = JSON.stringify(await request.json());
        }

        const res = await fetch(`${CAPE_URL}/api/files/${path}`, fetchOptions);

        if (!res.ok) {
            const text = await res.text();
            return new Response(
                JSON.stringify({ error: `Cape API error: ${res.status} ${text}` }),
                { status: res.status, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return Response.json(await res.json());
    } catch (error) {
        console.error('[Cape Files Proxy] POST Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const path = (await params).path.join('/');

        const res = await fetch(`${CAPE_URL}/api/files/${path}`, {
            method: 'DELETE',
        });

        if (!res.ok) {
            return new Response(
                JSON.stringify({ error: `Cape API error: ${res.status}` }),
                { status: res.status, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return Response.json(await res.json());
    } catch (error) {
        console.error('[Cape Files Proxy] DELETE Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
