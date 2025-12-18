/**
 * Cape 健康检查代理
 */

const CAPE_URL = process.env.CAPE_API_URL || 'http://localhost:8000';

export async function GET() {
    try {
        const res = await fetch(`${CAPE_URL}/api/health`, {
            // 设置较短超时
            signal: AbortSignal.timeout(5000),
        });

        if (!res.ok) {
            return Response.json(
                { status: 'error', cape: 'unhealthy', message: `Status ${res.status}` },
                { status: 503 }
            );
        }

        const data = await res.json();
        return Response.json({
            status: 'ok',
            cape: 'healthy',
            capeData: data,
        });
    } catch (error) {
        console.error('[Cape Health Proxy] Error:', error);
        return Response.json(
            { status: 'error', cape: 'unreachable', message: error.message },
            { status: 503 }
        );
    }
}
