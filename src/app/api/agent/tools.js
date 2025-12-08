/**
 * Agent 工具执行器
 * 
 * 实现各个工具的具体执行逻辑
 */

// 图像生成工具执行器
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

    return { raw: data, images };
}

// 图像编辑工具执行器
export async function executeEditImage(args, lastImages) {
    const apiKey = process.env.OPENAI_API_KEY;
    const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com";

    if (!apiKey) {
        throw new Error("缺少 OPENAI_API_KEY 环境变量");
    }

    // 确定要编辑的图片URL
    const imageUrl = args.image_url || (lastImages && lastImages[0]);

    if (!imageUrl) {
        throw new Error("没有可编辑的图片，请先生成一张图片或提供图片URL");
    }

    // 下载图片
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) {
        throw new Error(`图片下载失败: ${imgRes.status}`);
    }
    const blob = await imgRes.blob();

    // 构建 FormData
    const formData = new FormData();
    formData.append("model", "nano-banana-2");
    formData.append("prompt", args.prompt);
    formData.append("image", blob, "image.png");

    if (args.response_format) {
        formData.append("response_format", args.response_format);
    }

    const res = await fetch(`${baseUrl}/v1/images/edits`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`图像编辑失败: ${res.status} ${text}`);
    }

    const data = await res.json();

    const images = Array.isArray(data.data)
        ? data.data.map((item) => ({
            url: item.url,
            b64_json: item.b64_json,
        }))
        : [];

    return { raw: data, images };
}

// 工具执行器映射
export const TOOL_EXECUTORS = {
    generate_image: executeGenerateImage,
    edit_image: executeEditImage,
};

// 获取工具执行器
export function getToolExecutor(toolName) {
    return TOOL_EXECUTORS[toolName];
}
