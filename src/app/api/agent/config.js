/**
 * 图像 Agent 配置文件
 * 
 * 定义工具、系统提示等配置，便于扩展和维护
 */

// Agent 工具定义
export const IMAGE_TOOLS = {
    // 图像生成工具
    generate: {
        type: "function",
        function: {
            name: "generate_image",
            description:
                "使用 nano-banana-2 模型根据文字描述生成新图片。" +
                "适合：插画、海报、头像等视觉内容。",
            parameters: {
                type: "object",
                properties: {
                    prompt: {
                        type: "string",
                        description: "中文提示词，描述要生成的图片内容。",
                    },
                    aspect_ratio: {
                        type: "string",
                        description: "图片宽高比，例如 1:1、16:9 等。",
                        enum: [
                            "1:1",
                            "2:3",
                            "3:2",
                            "3:4",
                            "4:3",
                            "4:5",
                            "5:4",
                            "9:16",
                            "16:9",
                            "21:9",
                        ],
                    },
                    image_size: {
                        type: "string",
                        description: "图片清晰度，例如 1K/2K/4K。",
                        enum: ["1K", "2K", "4K"],
                    },
                    response_format: {
                        type: "string",
                        description: "返回 url 还是 base64，建议用 url。",
                        enum: ["url", "b64_json"],
                        default: "url",
                    },
                },
                required: ["prompt"],
            },
        },
    },

    // 图像编辑工具
    edit: {
        type: "function",
        function: {
            name: "edit_image",
            description:
                "使用 nano-banana-2 模型编辑已有图片。" +
                "会自动使用对话中最近生成的图片，或者可以指定图片URL。",
            parameters: {
                type: "object",
                properties: {
                    prompt: {
                        type: "string",
                        description: "中文提示词，描述要如何修改图片。",
                    },
                    image_url: {
                        type: "string",
                        description: "可选，要编辑的图片URL。如不提供则使用最近生成的图片。",
                    },
                },
                required: ["prompt"],
            },
        },
    },
};

// System Prompt 配置
export const SYSTEM_PROMPTS = {
    imageAgent: {
        role: "system",
        content:
            "你是图片助手，有两个工具：\n" +
            "1. generate_image - 生成新图片\n" +
            "2. edit_image - 编辑已有图片\n\n" +
            "重要规则：\n" +
            "- 如果用户说'生成/画/创建'，使用 generate_image\n" +
            "- 如果用户说'修改/改成/加上/去掉/编辑'等修改意图，使用 edit_image\n" +
            "- edit_image 会自动使用对话中最近生成的图片\n" +
            "- 工具返回 JSON，解析后用简短自然的中文告诉用户你做了什么。",
    },
};

// Agent 配置
export const AGENT_CONFIG = {
    name: "图像生成与编辑助手",
    model: "claude-haiku-4-5-20251001", // 默认模型
    tools: [IMAGE_TOOLS.generate, IMAGE_TOOLS.edit],
    systemPrompt: SYSTEM_PROMPTS.imageAgent,

    // 可扩展配置
    settings: {
        temperature: 0,
        maxTokens: 1000,
    },
};

// 导出工具名称常量
export const TOOL_NAMES = {
    GENERATE_IMAGE: "generate_image",
    EDIT_IMAGE: "edit_image",
};
