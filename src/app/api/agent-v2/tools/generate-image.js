/**
 * 图像生成工具执行器
 *
 * 使用 nano-banana-2 模型生成新图片
 */

export async function executeGenerateImage(args) {
    const apiKey = process.env.OPENAI_API_KEY;
    const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com";

    if (!apiKey) {
        throw new Error("缺少 OPENAI_API_KEY 环境变量");
    }

    const payload = {
        model: "nano-banana-2",
        prompt: args.prompt || "",
    };

    if (args.aspect_ratio) {
        payload.aspect_ratio = args.aspect_ratio;
    }
    if (args.image_size) {
        payload.image_size = args.image_size;
    }
    payload.response_format = args.response_format || "url";

    const res = await fetch(`${baseUrl}/v1/images/generations`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`图像生成失败: ${res.status} ${text}`);
    }

    const data = await res.json();

    const images = Array.isArray(data.data)
        ? data.data.map((item) => ({
            url: item.url,
            b64_json: item.b64_json,
        }))
        : [];

    // 返回 JSON 字符串（LangChain 工具要求）
    return JSON.stringify({ raw: data, images });
}
