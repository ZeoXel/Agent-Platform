/**
 * Cape 工具执行器
 *
 * 调用 Cape API 执行工具并返回结果
 */

const CAPE_API_URL = process.env.CAPE_API_URL || "http://localhost:8000";

/**
 * 执行 Cape 工具
 *
 * @param {string} toolName - 工具名称 (如 cape_xlsx)
 * @param {object} args - 工具参数
 * @param {object} sessionState - 会话状态
 * @returns {Promise<string>} JSON 字符串结果
 */
export async function executeCape(toolName, args, sessionState) {
    console.log(`[Cape Executor] 执行工具: ${toolName}`, args);

    try {
        const res = await fetch(`${CAPE_API_URL}/api/tools/execute/${toolName}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                arguments: args,
                session_id: sessionState?.sessionId,
            }),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Cape 执行失败: ${res.status} ${text}`);
        }

        const result = await res.json();
        console.log(`[Cape Executor] 执行完成:`, result.success ? "成功" : "失败");

        // 返回格式化结果
        return JSON.stringify({
            success: result.success,
            result: result.result,
            error: result.error,
            execution_time_ms: result.execution_time_ms,
            files: result.output_files || [],
        });
    } catch (error) {
        console.error(`[Cape Executor] 错误:`, error);
        return JSON.stringify({
            success: false,
            error: error.message,
        });
    }
}

/**
 * 创建 Cape 执行器映射
 *
 * 为每个 Cape 工具创建一个执行器函数
 *
 * @param {string[]} toolNames - 工具名称列表
 * @returns {object} 执行器映射 { tool_name: executorFn }
 */
export function createCapeExecutors(toolNames) {
    const executors = {};

    for (const name of toolNames) {
        if (!name.startsWith("cape_")) continue;

        executors[name] = async (args, sessionState) => {
            return executeCape(name, args, sessionState);
        };
    }

    return executors;
}

/**
 * 检查 Cape API 是否可用
 */
export async function checkCapeHealth() {
    try {
        const res = await fetch(`${CAPE_API_URL}/api/health`, {
            signal: AbortSignal.timeout(2000),
        });
        return res.ok;
    } catch {
        return false;
    }
}
