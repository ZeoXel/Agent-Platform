/**
 * Suno 音乐生成 API
 *
 * POST /api/audio/suno - 生成音乐
 *   - mode: 'inspiration' | 'custom'
 *   - 灵感模式: gpt_description_prompt
 *   - 自定义模式: title, tags, prompt, mv 等
 * GET /api/audio/suno?ids=xxx,yyy - 查询状态
 */

import { NextRequest, NextResponse } from 'next/server';

const getApiConfig = () => {
    const baseUrl = process.env.OPENAI_BASE_URL || process.env.OPENAI_API_BASE || 'https://api.bltcy.ai';
    const apiKey = process.env.OPENAI_API_KEY;
    return { baseUrl, apiKey };
};

/**
 * POST - 生成音乐
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { mode = 'inspiration' } = body;

        const { baseUrl, apiKey } = getApiConfig();

        if (!apiKey) {
            return NextResponse.json({ code: -1, message: 'API Key 未配置' }, { status: 500 });
        }

        let requestBody: Record<string, unknown>;

        if (mode === 'custom') {
            // 自定义创作模式
            const { title, tags, negative_tags, prompt, mv, make_instrumental, generation_type } = body;

            if (!prompt && !tags) {
                return NextResponse.json({ code: -1, message: '请提供歌词或风格标签' }, { status: 400 });
            }

            requestBody = {
                title: title || '',
                tags: tags || '',
                negative_tags: negative_tags || '',
                prompt: prompt || '',
                mv: mv || 'chirp-v4',
                generation_type: generation_type || 'TEXT',
            };

            // 纯音乐模式
            if (make_instrumental) {
                requestBody.make_instrumental = true;
            }
        } else {
            // 灵感模式 (V2)
            const { prompt, make_instrumental } = body;

            if (!prompt) {
                return NextResponse.json({ code: -1, message: 'prompt is required' }, { status: 400 });
            }

            requestBody = {
                gpt_description_prompt: prompt,
            };

            // 纯音乐模式
            if (make_instrumental) {
                requestBody.make_instrumental = true;
                requestBody.mv = 'chirp-v3-5';
                requestBody.prompt = '';
            }
        }

        console.log('[Suno] Request:', JSON.stringify(requestBody));

        const response = await fetch(`${baseUrl}/suno/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'Accept': '*/*',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Suno Error]', response.status, errorText);
            return NextResponse.json(
                { code: -1, message: `Suno API error: ${response.status} - ${errorText}` },
                { status: response.status }
            );
        }

        const result = await response.json();
        console.log('[Suno] Response:', JSON.stringify(result).slice(0, 500));

        // 提取 clips IDs
        let songIds: string[] = [];

        if (result.clips && Array.isArray(result.clips)) {
            songIds = result.clips.map((c: any) => c.id).filter(Boolean);
        } else if (result.data?.clips && Array.isArray(result.data.clips)) {
            songIds = result.data.clips.map((c: any) => c.id).filter(Boolean);
        } else if (Array.isArray(result)) {
            songIds = result.map((c: any) => c.id).filter(Boolean);
        }

        if (songIds.length === 0) {
            console.error('[Suno] No song IDs found');
            return NextResponse.json({ code: -1, message: '未获取到歌曲 ID' }, { status: 500 });
        }

        return NextResponse.json({
            code: 0,
            data: {
                song_id: songIds[0],
                song_id_2: songIds[1],
            },
        });

    } catch (error: any) {
        console.error('[Suno Error]', error);
        return NextResponse.json(
            { code: -1, message: error.message || '生成失败' },
            { status: 500 }
        );
    }
}

/**
 * GET - 查询歌曲状态
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const ids = searchParams.get('ids');

        if (!ids) {
            return NextResponse.json({ code: -1, message: 'ids is required' }, { status: 400 });
        }

        const { baseUrl, apiKey } = getApiConfig();

        if (!apiKey) {
            return NextResponse.json({ code: -1, message: 'API Key 未配置' }, { status: 500 });
        }

        const response = await fetch(`${baseUrl}/suno/feed/${ids}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'Accept': '*/*',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Suno Feed Error]', response.status, errorText);
            return NextResponse.json(
                { code: -1, message: `Suno API error: ${response.status}` },
                { status: response.status }
            );
        }

        const result = await response.json();

        // 标准化响应格式
        const songs = Array.isArray(result) ? result : (result.data || []);

        const normalizedSongs = songs.map((song: any) => ({
            id: song.id,
            title: song.title || song.metadata?.prompt?.slice(0, 30) || 'Untitled',
            status: normalizeSunoStatus(song.status),
            audio_url: song.audio_url,
            image_url: song.image_url || song.image_large_url,
            duration: song.duration,
            error_message: song.error_message,
            metadata: {
                tags: song.metadata?.tags || song.tags,
                prompt: song.metadata?.prompt || song.prompt,
            },
        }));

        return NextResponse.json({
            code: 0,
            data: normalizedSongs,
        });

    } catch (error: any) {
        console.error('[Suno Feed Error]', error);
        return NextResponse.json(
            { code: -1, message: error.message || '查询失败' },
            { status: 500 }
        );
    }
}

// 标准化 Suno 状态
function normalizeSunoStatus(status: string): 'pending' | 'processing' | 'complete' | 'error' {
    const statusLower = (status || '').toLowerCase();
    if (statusLower === 'complete' || statusLower === 'completed') return 'complete';
    if (statusLower === 'error' || statusLower === 'failed') return 'error';
    if (statusLower === 'processing' || statusLower === 'running' || statusLower === 'streaming') return 'processing';
    if (statusLower === 'submitted' || statusLower === 'queued') return 'pending';
    return 'pending';
}
