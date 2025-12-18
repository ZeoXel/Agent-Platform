// 测试 LLM 配置（标准 OpenAI API）
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";

export async function GET() {
    try {
        // 使用最简单的配置测试
        const llm = new ChatOpenAI({
            model: "gpt-3.5-turbo",
            temperature: 0,
            maxTokens: 50,
            openAIApiKey: "test-key", // 故意使用假 key，只是测试配置
        });

        console.log("[测试] LLM 创建成功");

        return new Response(
            JSON.stringify({
                success: true,
                message: "LLM 对象创建成功（未调用 API）",
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
