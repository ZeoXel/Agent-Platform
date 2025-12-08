from dotenv import load_dotenv
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


# 1. 定义平台工具（此处用打印字符串代替真实调用）
@tool
def create_image(prompt: str) -> str:
    """当用户想生成图片、插画、海报时使用。"""

    return f"[已根据提示生成图片: {prompt}]"


@tool
def create_video(prompt: str, duration: int = 5) -> str:
    """当用户想生成视频、短片时使用。"""

    return f"[已生成时长约 {duration} 秒的视频: {prompt}]"


tools = [create_image, create_video]
tool_map = {t.name: t for t in tools}


# 2. 带工具能力的模型
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.0).bind_tools(tools)


system = SystemMessage(
    content=(
        "你是一个中文助理。"
        "当用户需要生成图片或视频时，优先调用提供的工具。"
        "拿到工具结果后，用自然中文简短回复。"
    )
)


def main() -> None:
    # 与 docs/上下文对话.py 相同的极简循环结构
    messages: list[BaseMessage] = [system]

    while True:
        u = input("你：").strip()
        if u in ("退出", "exit", "quit", "q"):
            break
        if not u:
            continue

        messages.append(HumanMessage(content=u))

        # 第一次调用：让模型判断是否需要工具
        ai = llm.invoke(messages)
        messages.append(ai)

        # 如果没有工具调用，直接输出
        if not ai.tool_calls:
            print("AI：", ai.content)
            continue

        # 如果有工具调用，在本地执行工具
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

        # 基于工具结果，给用户自然语言回复
        final: AIMessage = llm.invoke(messages)
        messages.append(final)
        print("AI：", final.content)


if __name__ == "__main__":
    main()

