from dotenv import load_dotenv
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

load_dotenv()
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)

# 显式声明为包含 BaseMessage 的列表
messages: list[BaseMessage] = [
    SystemMessage(content="你是一个中文助理，请用简洁自然的中文回答。")
]

while True:
    u = input("你：").strip()
    if u in ("退出", "exit", "quit", "q"):
        break
    if not u:
        continue

    messages.append(HumanMessage(content=u))
    ai = llm.invoke(messages)
    print("AI：", ai.content)
    messages.append(AIMessage(content=ai.content))
