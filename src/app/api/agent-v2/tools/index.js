/**
 * 动态工具加载器
 *
 * 从配置创建 LangChain 工具
 */

import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { TOOL_CONFIGS } from "./registry.js";
import { executeGenerateImage } from "./generate-image.js";
import { executeEditImage } from "./edit-image.js";

// 执行器映射
const EXECUTORS = {
    executeGenerateImage,
    executeEditImage,
};

/**
 * 将配置转换为 Zod Schema
 */
function createZodSchema(parameters) {
    const shape = {};

    for (const [key, config] of Object.entries(parameters)) {
        let field;

        // 根据类型创建基础 schema
        if (config.type === "string") {
            field = z.string();
        } else if (config.type === "number") {
            field = z.number();
        } else if (config.type === "boolean") {
            field = z.boolean();
        } else {
            field = z.string(); // 默认 string
        }

        // 处理枚举
        if (config.enum && config.enum.length > 0) {
            field = z.enum(config.enum);
        }

        // 处理可选参数
        if (config.optional || !config.required) {
            field = field.optional();
        }

        // 添加描述
        if (config.description) {
            field = field.describe(config.description);
        }

        shape[key] = field;
    }

    return z.object(shape);
}

/**
 * 从配置动态创建工具
 *
 * @param {Object} sessionState - 会话状态（用于工具访问 lastImages）
 * @returns {Array} LangChain Tool 数组
 */
export function createToolsFromRegistry(sessionState = null) {
    const tools = [];

    for (const [toolName, config] of Object.entries(TOOL_CONFIGS)) {
        const executor = EXECUTORS[config.executor];

        if (!executor) {
            console.warn(`未找到执行器: ${config.executor}，跳过工具 ${toolName}`);
            continue;
        }

        // 创建 Zod Schema
        const schema = createZodSchema(config.parameters);

        // 使用 LangChain 的 tool() 辅助函数创建工具
        const langchainTool = tool(
            async (input) => {
                try {
                    // 如果工具需要会话状态，传入
                    if (config.requiresSession && sessionState) {
                        return await executor(input, sessionState);
                    }
                    return await executor(input);
                } catch (error) {
                    console.error(`工具 ${toolName} 执行失败:`, error);
                    // 返回错误信息（LangChain 会将其作为工具响应）
                    return JSON.stringify({
                        error: error.message,
                        success: false,
                    });
                }
            },
            {
                name: config.name,
                description: config.description,
                schema: schema,
            }
        );

        tools.push(langchainTool);
    }

    return tools;
}

/**
 * 动态注册新工具（扩展点）
 *
 * @param {string} toolName - 工具名称
 * @param {Object} config - 工具配置
 */
export function registerTool(toolName, config) {
    if (TOOL_CONFIGS[toolName]) {
        console.warn(`工具 ${toolName} 已存在，将被覆盖`);
    }
    TOOL_CONFIGS[toolName] = config;
}
