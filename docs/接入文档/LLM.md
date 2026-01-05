# 所有对话模型均兼容 OpenAI 格式

## 所有对话模型均兼容 OpenAI 格式，一键对接
仅需替换 model ，即可使用 OpenAI、Claude、Gemini、DeepSeek、Grok、Qwen 等大语言模型
```
curl --location -g --request POST '{{BASE_URL}}/v1/chat/completions' \
--header 'Accept: application/json' \
--header 'Authorization: Bearer sk-Uk' \
--header 'User-Agent: Apifox/1.0.0 (https://apifox.com)' \
--header 'Content-Type: application/json' \
--data-raw '{
    "model": "{{model}}",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful assistant."
      },
      {
        "role": "user",
        "content": "Hello!"
      }
    ]
  }'
  ```