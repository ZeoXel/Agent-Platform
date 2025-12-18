// 测试 LLM 配置
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";

export async function GET() {
    try {
        const config = {
            model: process.env.MODEL_NAME || "claude-haiku-4-5-20251001",
            temperature: 0,
            maxTokens: 100,
            openAIApiKey: process.env.OPENAI_API_KEY,
        };

        // 自定义 baseURL（第三方 API）
        if (process.env.OPENAI_BASE_URL) {
            config.configuration = {
                basePath: process.env.OPENAI_BASE_URL + "/v1",
            };
        }

        console.log("[测试] ChatOpenAI 配置:", {
            model: config.model,
            hasApiKey: !!config.openAIApiKey,
            baseURL: config.configuration?.baseURL,
        });

        const llm = new ChatOpenAI(config);

        // 使用 LangChain 消息对象
        const response = await llm.invoke([
            new HumanMessage("你好，请回复'测试成功'"),
        ]);

        return new Response(
            JSON.stringify({
                success: true,
                response: response.content,
                config: {
                    model: config.model,
                    baseURL: config.configuration?.baseURL,
                },
            }),
            {
                headers: { "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.error("[测试] 错误:", error);
        return new Response(
            JSON.stringify({
                success: false,
                error: error.message,
                stack: error.stack,
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}
