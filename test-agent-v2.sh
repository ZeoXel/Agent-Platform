#!/bin/bash

# Agent V2 API 测试脚本

echo "=== 测试 1: 图像生成 ==="
curl -X POST http://localhost:3000/api/agent-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "画一只可爱的小猫"
      }
    ],
    "sessionId": "test-session-1"
  }' \
  --no-buffer

echo -e "\n\n=== 测试 2: 图像编辑 ==="
curl -X POST http://localhost:3000/api/agent-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "画一只可爱的小猫"
      },
      {
        "role": "assistant",
        "content": "我为你生成了一只可爱的小猫。"
      },
      {
        "role": "user",
        "content": "给它加个帽子"
      }
    ],
    "sessionId": "test-session-2"
  }' \
  --no-buffer
