// 极简 Agent API：大模型 + nano-banana-2 图像工具

const SYSTEM_MESSAGE = {
  role: "system",
  content:
    "你是一个中文助理。当用户需要生成或编辑图片时，" +
    "请优先使用提供的 nano-banana-2 图像工具，而不是自己编造结果。" +
    "拿到工具结果后，用简短自然的中文解释你为用户做了什么。",
};

// OpenAI tools 规范中的函数工具描述
const NANO_BANANA_TOOL = {
  type: "function",
  function: {
    name: "nano_banana_image",
    description:
      "使用 nano-banana-2 模型根据用户的文字描述生成或编辑图片。" +
      "适合：插画、海报、头像等视觉内容。",
    parameters: {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description: "中文提示词，描述要生成或编辑的图片内容。",
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
          description: "图片清晰度，仅 nano-banana-2 支持，例如 1K/2K/4K。",
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
};

async function callChatCompletion({ messages, model, tools, toolChoice }) {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com";

  if (!apiKey) {
    throw new Error("缺少 OPENAI_API_KEY 环境变量");
  }

  const res = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      tools,
      tool_choice: toolChoice,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`聊天模型请求失败: ${res.status} ${text}`);
  }

  const data = await res.json();
  const choice = data.choices?.[0];
  if (!choice) {
    throw new Error("未从模型获得响应");
  }
  return choice.message;
}

// 调用 nano-banana-2 图像接口
async function callNanoBananaImage(args) {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com";

  if (!apiKey) {
    throw new Error("缺少 OPENAI_API_KEY 环境变量");
  }

  const form = new FormData();
  form.append("model", "nano-banana-2");
  form.append("prompt", args.prompt || "");

  if (args.aspect_ratio) {
    form.append("aspect_ratio", args.aspect_ratio);
  }
  if (args.image_size) {
    form.append("image_size", args.image_size);
  }
  form.append("response_format", args.response_format || "url");

  const res = await fetch(`${baseUrl}/v1/images/edits`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`nano-banana-2 调用失败: ${res.status} ${text}`);
  }

  const data = await res.json();

  // 兼容 DALL·E 风格返回结构
  const images = Array.isArray(data.data)
    ? data.data.map((item) => ({
        url: item.url,
        b64_json: item.b64_json,
      }))
    : [];

  return { raw: data, images };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const clientMessages = Array.isArray(body.messages) ? body.messages : [];
    const model =
      body.model === "gpt-5" || body.model === "claude-haiku-4-5-20251001"
        ? body.model
        : "claude-haiku-4-5-20251001";

    // 将前端传来的 messages 转为 OpenAI 格式，并加上 system 提示
    const baseMessages = [
      SYSTEM_MESSAGE,
      ...clientMessages.map((m) => ({ role: m.role, content: m.content })),
    ];

    // 第一次调用：让模型决定是否使用工具
    const firstMessage = await callChatCompletion({
      model,
      messages: baseMessages,
      tools: [NANO_BANANA_TOOL],
      toolChoice: "auto",
    });

    const toolCalls = firstMessage.tool_calls || [];

    // 如果没有工具调用，直接把自然语言回复给前端
    if (!toolCalls.length) {
      return new Response(
        JSON.stringify({ reply: firstMessage.content || "" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const toolMessages = [];
    const collectedImages = [];

    // 执行工具调用（这里只实现 nano_banana_image）
    for (const call of toolCalls) {
      const name = call?.function?.name;
      if (name !== "nano_banana_image") continue;

      let args = {};
      try {
        args = call.function?.arguments
          ? JSON.parse(call.function.arguments)
          : {};
      } catch {
        args = {};
      }

      const result = await callNanoBananaImage(args);
      if (Array.isArray(result.images)) {
        collectedImages.push(...result.images);
      }

      toolMessages.push({
        role: "tool",
        tool_call_id: call.id,
        name,
        content: JSON.stringify(result),
      });
    }

    // 第二次调用：让模型基于工具结果给出最终回复
    const finalMessage = await callChatCompletion({
      model,
      messages: [...baseMessages, firstMessage, ...toolMessages],
      tools: [NANO_BANANA_TOOL],
      toolChoice: "none",
    });

    return new Response(
      JSON.stringify({
        reply: finalMessage.content || "",
        images: collectedImages,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "未知错误",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

