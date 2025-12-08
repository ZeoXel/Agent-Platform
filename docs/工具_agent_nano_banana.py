from dotenv import load_dotenv
import os
from typing import List, Optional

import requests
from langchain_core.messages import (
    AIMessage,
    BaseMessage,
    HumanMessage,
    SystemMessage,
    ToolMessage,
)
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI


load_dotenv()


OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "https://api.openai.com")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


@tool
def nano_banana_image(
    prompt: str,
    aspect_ratio: Optional[str] = None,
    image_size: Optional[str] = None,
    response_format: str = "url",
) -> str:
    """当用户想生成或编辑图片时使用 nano-banana-2 模型。

    prompt: 中文描述要生成或编辑的图片内容。
    aspect_ratio: 可选宽高比，例如 "1:1"、"16:9"。
    image_size: 可选清晰度，"1K"、"2K" 或 "4K"。
    response_format: "url" 或 "b64_json"，默认 "url"。
    """

    if not OPENAI_API_KEY:
        return "图像工具未配置：缺少 OPENAI_API_KEY 环境变量。"

    url = f"{OPENAI_BASE_URL.rstrip('/')}/v1/images/edits"

    data: dict[str, str] = {
        "model": "nano-banana-2",
        "prompt": prompt,
        "response_format": response_format,
    }

    if aspect_ratio:
        data["aspect_ratio"] = aspect_ratio
    if image_size:
        data["image_size"] = image_size

    try:
        # 这里用 form 表单发送，兼容文档中的 multipart/form-data 要求
        resp = requests.post(
            url,
            headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
            data=data,
            timeout=60,
        )
    except Exception as e:  # 极简错误处理
        return f"调用 nano-banana-2 失败：{e}"

    if resp.status_code != 200:
        return f"nano-banana-2 返回错误 {resp.status_code}: {resp.text[:200]}"

    payload = resp.json()
    images = []
    if isinstance(payload, dict) and isinstance(payload.get("data"), list):
        for item in payload["data"]:
            images.append({
                "url": item.get("url"),
                "b64_json": item.get("b64_json"),
            })

    if not images:
        return "nano-banana-2 调用成功，但未返回图片数据。"

    # 为了简单，这里只返回第一张的 url 或一个简短描述，给大模型作为参考
    first = images[0]
    if first.get("url"):
        return f"已生成图片，URL: {first['url']}"
    if first.get("b64_json"):
        return "已生成图片（base64 格式返回）。"

    return "nano-banana-2 返回了未知格式的数据。"


tools = [nano_banana_image]
tool_map = {t.name: t for t in tools}


# 你可以在这里切换模型名，也可以用环境变量 AGENT_MODEL 控制
MODEL_NAME = os.getenv("AGENT_MODEL", "claude-haiku-4-5-20251001")

llm = ChatOpenAI(
    model=MODEL_NAME,
    temperature=0.0,
).bind_tools(tools)


system = SystemMessage(
    content=(
        "你是一个中文助理。"
        "当用户需要生成或编辑图片时，请优先调用 nano_banana_image 工具，"
        "不要自己编造图片链接。拿到工具结果后，用简短自然的中文告诉用户你做了什么。"
    )
)


def main() -> None:
    # 完全沿用 docs/上下文对话.py 的极简对话结构
    messages: List[BaseMessage] = [system]

    print(f"已启动工具 Agent，当前模型: {MODEL_NAME}")
    print("输入 '退出' / 'exit' / 'quit' / 'q' 可结束。\n")

    while True:
        u = input("你：").strip()
        if u in ("退出", "exit", "quit", "q"):
            break
        if not u:
            continue

        messages.append(HumanMessage(content=u))

        # 第一次调用：判断是否需要工具
        ai = llm.invoke(messages)
        messages.append(ai)

        # 如果模型没有要求调用工具，直接返回内容
        if not ai.tool_calls:
            print("AI：", ai.content)
            continue

        # 有工具调用时，在本地执行这些工具
        for call in ai.tool_calls:
            name = call["name"]
            args = call["args"] or {}
            tool = tool_map[name]
            result = tool.invoke(args)

            messages.append(
                ToolMessage(
                    content=str(result),
                    name=name,
                    tool_call_id=call["id"],
                )
            )

        # 基于工具结果，让模型给出最终自然语言回复
        final: AIMessage = llm.invoke(messages)
        messages.append(final)
        print("AI：", final.content)


if __name__ == "__main__":
    main()

