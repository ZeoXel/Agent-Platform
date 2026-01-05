/**
 * Suno V2 API 服务 - AI 音乐生成（灵感模式）
 *
 * 接口文档: ./docs/接入文档/sunov2.md
 *
 * 特性:
 * - 灵感模式：只需提供描述，AI 自动生成歌词和风格
 * - 异步生成，需要轮询查询结果
 */

export interface SunoGenerateParams {
    prompt: string;              // 音乐描述/灵感
    make_instrumental?: boolean; // 纯音乐（无人声）
}

export interface SunoGenerateResponse {
    code: number;
    data?: {
        song_id: string;
        song_id_2?: string;  // Suno 通常会生成两首
    };
    message?: string;
}

export interface SunoSongInfo {
    id: string;
    title: string;
    status: 'pending' | 'processing' | 'complete' | 'error';
    audio_url?: string;
    image_url?: string;  // 封面图
    duration?: number;
    error_message?: string;
    metadata?: {
        tags?: string;
        prompt?: string;
    };
}

export interface SunoFeedResponse {
    code: number;
    data?: SunoSongInfo[];
    message?: string;
}

/**
 * 提交音乐生成任务（灵感模式）
 */
export const generateMusic = async (params: SunoGenerateParams): Promise<{ songIds: string[] }> => {
    const response = await fetch('/api/audio/suno', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            prompt: params.prompt,
            make_instrumental: params.make_instrumental || false,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Suno API 错误: ${error}`);
    }

    const result: SunoGenerateResponse = await response.json();

    if (result.code !== 0 || !result.data) {
        throw new Error(result.message || '生成失败');
    }

    const songIds = [result.data.song_id];
    if (result.data.song_id_2) {
        songIds.push(result.data.song_id_2);
    }

    return { songIds };
};

/**
 * 查询歌曲生成状态
 */
export const querySongStatus = async (songIds: string[]): Promise<SunoSongInfo[]> => {
    const idsParam = songIds.join(',');
    const response = await fetch(`/api/audio/suno?ids=${encodeURIComponent(idsParam)}`);

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`查询失败: ${error}`);
    }

    const result: SunoFeedResponse = await response.json();

    if (result.code !== 0 || !result.data) {
        throw new Error(result.message || '查询失败');
    }

    return result.data;
};

/**
 * 轮询等待音乐生成完成
 */
export const waitForMusicGeneration = async (
    songIds: string[],
    onProgress?: (progress: string, songs?: SunoSongInfo[]) => void,
    maxAttempts: number = 120,  // 最多 6 分钟
    interval: number = 3000     // 每 3 秒查询
): Promise<SunoSongInfo[]> => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const songs = await querySongStatus(songIds);

        // 检查所有歌曲状态
        const allComplete = songs.every(s => s.status === 'complete');
        const anyError = songs.find(s => s.status === 'error');

        if (anyError) {
            throw new Error(anyError.error_message || '音乐生成失败');
        }

        if (allComplete) {
            onProgress?.('生成完成!', songs);
            return songs;
        }

        // 报告进度
        const progressPercent = Math.min(95, Math.round((attempt / maxAttempts) * 100));
        const statusText = songs[0]?.status === 'processing' ? '创作中' : '排队中';
        onProgress?.(`${statusText}... ${progressPercent}%`, songs);

        // 等待下一次轮询
        await new Promise(resolve => setTimeout(resolve, interval));
    }

    throw new Error('生成超时，请稍后重试');
};

/**
 * 一站式音乐生成（提交 + 轮询）
 */
export const createMusic = async (
    params: SunoGenerateParams,
    onProgress?: (progress: string, songs?: SunoSongInfo[]) => void
): Promise<SunoSongInfo[]> => {
    onProgress?.('提交生成任务...');

    const { songIds } = await generateMusic(params);

    onProgress?.('任务已提交，等待生成...');

    return await waitForMusicGeneration(songIds, onProgress);
};

// 预设的音乐风格标签
export const MUSIC_STYLE_PRESETS = [
    { label: '流行', value: 'pop, catchy, modern' },
    { label: '摇滚', value: 'rock, guitar, energetic' },
    { label: '电子', value: 'electronic, synth, dance' },
    { label: '古典', value: 'classical, orchestral, piano' },
    { label: '爵士', value: 'jazz, smooth, saxophone' },
    { label: 'R&B', value: 'rnb, soulful, groove' },
    { label: '民谣', value: 'folk, acoustic, gentle' },
    { label: '嘻哈', value: 'hiphop, rap, beat' },
    { label: '中国风', value: 'chinese, traditional, erhu' },
    { label: '轻音乐', value: 'ambient, relaxing, peaceful' },
];
