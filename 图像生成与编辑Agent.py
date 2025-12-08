"""图像生成与编辑 Agent（可复用版本）

功能：
- 生成图片
- 编辑图片（自动使用对话中生成的图片）

环境变量：
- OPENAI_BASE_URL: API 基础地址
- OPENAI_API_KEY: API 密钥

使用方式：
1. 直接运行：python 图像生成与编辑Agent.py
2. 作为模块导入：from 图像生成与编辑Agent import create_image_agent
"""

from __future__ import annotations

import json
import os
import tempfile
from pathlib import Path

import requests
from dotenv import load_dotenv
from langchain.agents import create_agent
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI

# 全局状态：记录最近生成的图片URL
_last_images = []


@tool
def generate_image(prompt: str) -> str:
    """生成图片"""
    global _last_images

    if not prompt.strip():
        return json.dumps({"error": "prompt 不能为空"}, ensure_ascii=False)

    base_url = os.getenv("OPENAI_BASE_URL")
    api_key = os.getenv("OPENAI_API_KEY")

    if not base_url or not api_key:
        return json.dumps({"error": "未设置环境变量"}, ensure_ascii=False)

    print(f"\n正在生成... ({prompt[:40]}...)")

    try:
        response = requests.post(
            f"{base_url.rstrip('/')}/images/generations",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={"prompt": prompt, "model": "nano-banana-2"},
            timeout=30,
        )
        response.raise_for_status()

        # 记录图片URL
        try:
            data = response.json()
            if "data" in data and data["data"]:
                urls = [item["url"] for item in data["data"] if "url" in item]
                _last_images.clear()
                _last_images.extend(urls)
                print("生成完成！")
        except Exception:
            pass

        return response.text
    except Exception as e:
        print(f"生成失败: {e}")
        return json.dumps({"error": str(e)}, ensure_ascii=False)


@tool
def edit_image(prompt: str, image_url: str | None = None) -> str:
    """编辑图片（自动使用最近生成的图片）"""
    global _last_images

    if not prompt.strip():
        return json.dumps({"error": "prompt 不能为空"}, ensure_ascii=False)

    if not image_url:
        if not _last_images:
            return json.dumps({"error": "没有可编辑的图片"}, ensure_ascii=False)
        image_url = _last_images[0]

    base_url = os.getenv("OPENAI_BASE_URL")
    api_key = os.getenv("OPENAI_API_KEY")

    if not base_url or not api_key:
        return json.dumps({"error": "未设置环境变量"}, ensure_ascii=False)

    print(f"\n正在编辑... ({prompt[:40]}...)")

    temp_path = None
    try:
        # 下载图片
        img_resp = requests.get(image_url, timeout=10)
        img_resp.raise_for_status()

        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".png")
        temp_file.write(img_resp.content)
        temp_file.close()
        temp_path = temp_file.name

        # 编辑请求
        with open(temp_path, "rb") as f:
            response = requests.post(
                f"{base_url.rstrip('/')}/images/edits",
                headers={"Authorization": f"Bearer {api_key}"},
                data={"prompt": prompt, "model": "nano-banana-2"},
                files=[("image", (Path(temp_path).name, f, "image/png"))],
                timeout=60,
            )
            response.raise_for_status()

            # 更新图片URL
            try:
                data = response.json()
                if "data" in data and data["data"]:
                    urls = [item["url"] for item in data["data"] if "url" in item]
                    _last_images.clear()
                    _last_images.extend(urls)
                    print("编辑完成！")
            except Exception:
                pass

            return response.text
    except Exception as e:
        print(f"编辑失败: {e}")
        return json.dumps({"error": str(e)}, ensure_ascii=False)
    finally:
        if temp_path:
            try:
                Path(temp_path).unlink()
            except Exception:
                pass


def create_image_agent(model_name: str = "gpt-4o-mini", temperature: float = 0):
    """创建图像 Agent（供其他项目导入使用）"""
    return create_agent(
        model=ChatOpenAI(model=model_name, temperature=temperature),
        tools=[generate_image, edit_image],
        system_prompt=(
            "你是图片助手，有两个工具：\n"
            "1. generate_image - 生成新图片\n"
            "2. edit_image - 编辑已有图片\n\n"
            "重要规则：\n"
            "- 如果用户说'生成/画/创建'，使用 generate_image\n"
            "- 如果用户说'修改/改成/加上/去掉/编辑'等修改意图，使用 edit_image\n"
            "- edit_image 会自动使用对话中最近生成的图片\n"
            "工具返回 JSON，解析后用中文友好回复。"
        ),
    )


def main():
    """命令行交互模式"""
    load_dotenv()

    agent = create_image_agent()

    print("=" * 60)
    print("图像生成与编辑 Agent")
    print("=" * 60)

    while True:
        try:
            user_input = input("你：").strip()
        except (EOFError, KeyboardInterrupt):
            print("\n再见！")
            break

        if user_input.lower() in {"exit", "quit", "退出"}:
            print("再见！")
            break

        if not user_input:
            continue

        try:
            result = agent.invoke(
                {"messages": [{"role": "user", "content": user_input}]}
            )
            print(f"\nAgent：{result['messages'][-1].content}\n")
            print("-" * 60)
        except Exception as e:
            print(f"\n错误：{e}\n")


if __name__ == "__main__":
    main()
