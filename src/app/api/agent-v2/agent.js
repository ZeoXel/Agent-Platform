/**
 * Agent 初始化和配置
 *
 * 使用 LangGraph 的 createReactAgent 创建智能助理
 */

import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { createToolsFromRegistry } from "./tools/index.js";

/**
 * 改进的 System Prompt
 *
 * 提供更详细的意图识别规则和交互原则
 */
const SYSTEM_PROMPT = `你是用户的智能创意助理，专注于理解用户的视觉创作需求。

你拥有以下能力：
1. generate_image - 从零生成新图片
2. edit_image - 修改已有图片

理解用户意图的关键规则：
- 创作意图：用户说"生成"、"画"、"创建"、"做一个"、"帮我设计"、"我想要一张XXX的图" → 使用 generate_image
- 修改意图：用户说"修改"、"改成"、"加上"、"去掉"、"编辑"、"换成"、"调整"、"优化" → 使用 edit_image
- 模糊意图：如果用户只说"我想要一张XXX的图"，默认理解为生成新图（generate_image）
- 连续创作：如果用户在生成图片后继续提出修改，理解为编辑意图（edit_image）

工具使用细节：
- edit_image 会自动使用对话中最近生成的图片，用户无需指定URL
- 如果用户同时提到多个需求（例如："生成一张猫的图片，然后加上帽子"），分两步执行：先 generate_image，再 edit_image
- 工具返回 JSON 格式结果，解析后用简洁、友好的中文告诉用户你完成了什么

交互原则：
- 让用户轻松实现创意想法，而不是让他们学习工具参数
- 如果用户意图不清晰，主动询问澄清
- 回复要自然、简洁，避免暴露技术细节
- 如果工具执行失败，用友好的方式告诉用户问题并建议解决方案

记住：你的目标是成为用户最好的创意伙伴！`;

/**
 * 创建图像 Agent
 *
 * @param {Object} sessionState - 会话状态（用于工具访问 lastImages）
 * @returns {Object} LangGraph Agent
 */
export function createImageAgent(sessionState) {
    // 调试：打印环境变量
    console.log("[Agent] 环境变量:", {
        hasAPIKey: !!process.env.OPENAI_API_KEY,
        apiKeyPrefix: process.env.OPENAI_API_KEY?.slice(0, 7),
        baseURL: process.env.OPENAI_BASE_URL,
        apiBase: process.env.OPENAI_API_BASE,
    });

    // 初始化 ChatOpenAI（显式配置）
    const config = {
        modelName: process.env.MODEL_NAME || "claude-haiku-4-5-20251001",
        temperature: 0,
        maxTokens: 1000,
        streaming: true,
        openAIApiKey: process.env.OPENAI_API_KEY,
    };

    // 如果有自定义 baseURL，添加配置
    if (process.env.OPENAI_BASE_URL) {
        config.configuration = {
            basePath: process.env.OPENAI_BASE_URL + "/v1",
        };
    }

    console.log("[Agent] ChatOpenAI 配置:", {
        model: config.modelName,
        hasKey: !!config.openAIApiKey,
        basePath: config.configuration?.basePath,
    });

    const llm = new ChatOpenAI(config);

    // 动态加载工具（传入会话状态以支持 edit_image）
    const tools = createToolsFromRegistry(sessionState);

    console.log(`[Agent] 创建 Agent，已加载 ${tools.length} 个工具`);

    // 创建 React Agent
    const agent = createReactAgent({
        llm,
        tools,
        messageModifier: SYSTEM_PROMPT, // 注入 System Prompt
    });

    return agent;
}
