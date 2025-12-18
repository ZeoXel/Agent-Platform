/**
 * 工具注册表
 *
 * 声明式工具配置，便于动态加载和扩展
 */

export const TOOL_CONFIGS = {
    generate_image: {
        name: "generate_image",
        description:
            "使用 nano-banana-2 模型根据文字描述生成新图片。" +
            "适合：插画、海报、头像、商业摄影、概念图等视觉内容。",
        parameters: {
            prompt: {
                type: "string",
                description: "中文提示词，详细描述要生成的图片内容。",
                required: true,
            },
            aspect_ratio: {
                type: "string",
                description: "图片宽高比，例如 1:1（正方形）、16:9（横向）等。",
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
                optional: true,
            },
            image_size: {
                type: "string",
                description: "图片清晰度，1K/2K/4K，数字越大越清晰。",
                enum: ["1K", "2K", "4K"],
                optional: true,
            },
            response_format: {
                type: "string",
                description: "返回格式，url（推荐）或 b64_json。",
                enum: ["url", "b64_json"],
                default: "url",
                optional: true,
            },
        },
        executor: "executeGenerateImage",
        requiresSession: false,
    },

    edit_image: {
        name: "edit_image",
        description:
            "使用 nano-banana-2 模型编辑已有图片。" +
            "会自动使用对话中最近生成的图片作为编辑源，无需用户指定URL。" +
            "适合：修改细节、调整风格、添加/删除元素等。",
        parameters: {
            prompt: {
                type: "string",
                description: "中文提示词，详细描述要如何修改图片（例如：加上蓝天白云、改成卡通风格）。",
                required: true,
            },
            image_url: {
                type: "string",
                description: "可选，要编辑的图片URL。如不提供则自动使用最近生成的图片。",
                optional: true,
            },
        },
        executor: "executeEditImage",
        requiresSession: true, // 需要会话状态（lastImages）
    },
};

// 导出工具名称常量
export const TOOL_NAMES = {
    GENERATE_IMAGE: "generate_image",
    EDIT_IMAGE: "edit_image",
};
