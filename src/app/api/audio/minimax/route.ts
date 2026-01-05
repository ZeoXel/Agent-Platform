/**
 * MiniMax 语音合成 API
 *
 * POST /api/audio/minimax - 同步语音合成
 * POST /api/audio/minimax?mode=async - 异步语音合成
 * GET /api/audio/minimax?task_id=xxx - 查询异步任务状态
 */

import { NextRequest, NextResponse } from 'next/server';

const getApiConfig = () => {
    const baseUrl = process.env.OPENAI_BASE_URL || process.env.OPENAI_API_BASE || 'https://api.bltcy.ai';
    const apiKey = process.env.OPENAI_API_KEY;
    return { baseUrl, apiKey };
};

/**
 * POST - 语音合成（同步/异步）
 */
export async function POST(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const mode = searchParams.get('mode'); // 'async' for async mode

        const body = await request.json();
        const { model, text, voice_setting, voice_modify, audio_setting, output_format } = body;

        if (!text) {
            return NextResponse.json(
                { base_resp: { status_code: 2013, status_msg: 'text is required' } },
                { status: 400 }
            );
        }

        if (!voice_setting?.voice_id) {
            return NextResponse.json(
                { base_resp: { status_code: 2013, status_msg: 'voice_id is required' } },
                { status: 400 }
            );
        }

        const { baseUrl, apiKey } = getApiConfig();

        if (!apiKey) {
            return NextResponse.json(
                { base_resp: { status_code: 1004, status_msg: 'API Key 未配置' } },
                { status: 500 }
            );
        }

        // 选择 API 端点
        const endpoint = mode === 'async'
            ? `${baseUrl}/minimax/v1/t2a_async_v2`
            : `${baseUrl}/minimax/v1/t2a_v2`;

        // 构建请求体
        const requestBody: any = {
            model: model || 'speech-2.6-hd',
            text,
            stream: false,
            voice_setting: {
                voice_id: voice_setting.voice_id,
                speed: voice_setting.speed ?? 1.0,
                vol: voice_setting.vol ?? 1.0,
                pitch: voice_setting.pitch ?? 0,
                emotion: voice_setting.emotion,
            },
        };

        // 异步模式使用不同的参数名
        if (mode === 'async') {
            if (audio_setting) {
                requestBody.audio_setting = {
                    audio_sample_rate: audio_setting.sample_rate || 32000,
                    bitrate: audio_setting.bitrate || 128000,
                    format: audio_setting.format || 'mp3',
                    channel: audio_setting.channel || 1,
                };
            }
        } else {
            // 同步模式
            requestBody.output_format = output_format || 'url';
            if (audio_setting) {
                requestBody.audio_setting = {
                    sample_rate: audio_setting.sample_rate || 32000,
                    bitrate: audio_setting.bitrate || 128000,
                    format: audio_setting.format || 'mp3',
                    channel: audio_setting.channel || 1,
                };
            }
        }

        // 添加声音效果器（如果有）
        if (voice_modify) {
            const vm: any = {};
            if (voice_modify.pitch !== undefined) vm.pitch = voice_modify.pitch;
            if (voice_modify.intensity !== undefined) vm.intensity = voice_modify.intensity;
            if (voice_modify.timbre !== undefined) vm.timbre = voice_modify.timbre;
            if (voice_modify.sound_effects) vm.sound_effects = voice_modify.sound_effects;
            if (Object.keys(vm).length > 0) {
                requestBody.voice_modify = vm;
            }
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[MiniMax TTS Error]', response.status, errorText);
            return NextResponse.json(
                { base_resp: { status_code: 1000, status_msg: `MiniMax API error: ${response.status}` } },
                { status: response.status }
            );
        }

        const result = await response.json();
        return NextResponse.json(result);

    } catch (error: any) {
        console.error('[MiniMax TTS Error]', error);
        return NextResponse.json(
            { base_resp: { status_code: 1000, status_msg: error.message || '合成失败' } },
            { status: 500 }
        );
    }
}

/**
 * GET - 查询异步任务状态
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const taskId = searchParams.get('task_id');

        if (!taskId) {
            return NextResponse.json(
                { base_resp: { status_code: 2013, status_msg: 'task_id is required' } },
                { status: 400 }
            );
        }

        const { baseUrl, apiKey } = getApiConfig();

        if (!apiKey) {
            return NextResponse.json(
                { base_resp: { status_code: 1004, status_msg: 'API Key 未配置' } },
                { status: 500 }
            );
        }

        const response = await fetch(
            `${baseUrl}/minimax/v1/query/t2a_async_query_v2?task_id=${taskId}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                },
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[MiniMax Query Error]', response.status, errorText);
            return NextResponse.json(
                { base_resp: { status_code: 1000, status_msg: `Query error: ${response.status}` } },
                { status: response.status }
            );
        }

        const result = await response.json();
        return NextResponse.json(result);

    } catch (error: any) {
        console.error('[MiniMax Query Error]', error);
        return NextResponse.json(
            { base_resp: { status_code: 1000, status_msg: error.message || '查询失败' } },
            { status: 500 }
        );
    }
}
