/**
 * Cape 工具加载器
 *
 * 从 Cape API 动态加载工具配置，转换为 Agent Platform 格式
 */

const CAPE_API_URL = process.env.CAPE_API_URL || "http://localhost:8000";

// 缓存已加载的工具
let cachedTools = null;
let cacheTime = 0;
const CACHE_TTL = 60000; // 1 分钟缓存

/**
 * 从 Cape API 加载 OpenAI 格式的工具列表
 */
export async function loadCapeTools() {
    // 检查缓存
    if (cachedTools && Date.now() - cacheTime < CACHE_TTL) {
        return cachedTools;
    }

    try {
        console.log(`[Cape Loader] 从 ${CAPE_API_URL}/api/tools/openai 加载工具...`);

        const res = await fetch(`${CAPE_API_URL}/api/tools/openai`, {
            headers: {
                "Content-Type": "application/json",
            },
            // 设置超时
            signal: AbortSignal.timeout(5000),
        });

        if (!res.ok) {
            throw new Error(`加载失败: ${res.status}`);
        }

        const tools = await res.json();
        console.log(`[Cape Loader] 加载了 ${tools.length} 个 Cape 工具`);

        // 更新缓存
        cachedTools = tools;
        cacheTime = Date.now();

        return tools;
    } catch (error) {
        console.error("[Cape Loader] 加载 Cape 工具失败:", error.message);

        // 返回缓存（如果有）或空数组
        return cachedTools || [];
    }
}

/**
 * 将 Cape 工具转换为 Agent Platform 的 TOOL_CONFIGS 格式
 */
export function convertToToolConfigs(capeTools) {
    const configs = {};

    for (const tool of capeTools) {
        if (tool.type !== "function" || !tool.function) continue;

        const fn = tool.function;
        const name = fn.name;

        configs[name] = {
            name: name,
            description: fn.description,
            parameters: convertParameters(fn.parameters),
            executor: `executeCape`,
            requiresSession: true,
            isCape: true, // 标记为 Cape 工具
        };
    }

    return configs;
}

/**
 * 转换参数格式
 */
function convertParameters(openaiParams) {
    if (!openaiParams || !openaiParams.properties) {
        return {};
    }

    const params = {};
    const required = openaiParams.required || [];

    for (const [key, prop] of Object.entries(openaiParams.properties)) {
        params[key] = {
            type: prop.type || "string",
            description: prop.description || "",
            required: required.includes(key),
        };

        if (prop.enum) {
            params[key].enum = prop.enum;
        }
    }

    return params;
}

/**
 * 获取所有工具 (原生 + Cape)
 */
export async function getAllTools(nativeTools) {
    const capeOpenaiTools = await loadCapeTools();
    const capeConfigs = convertToToolConfigs(capeOpenaiTools);

    return {
        ...nativeTools,
        ...capeConfigs,
    };
}

/**
 * 获取 OpenAI 格式的所有工具
 */
export async function getAllOpenAITools(nativeOpenaiTools = []) {
    const capeTools = await loadCapeTools();
    return [...nativeOpenaiTools, ...capeTools];
}
