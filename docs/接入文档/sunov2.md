# 生成歌曲(灵感模式)

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /suno/submit/music:
    post:
      summary: 生成歌曲(灵感模式)
      deprecated: false
      description: ''
      tags:
        - 音频接口/Suno文生歌
      parameters:
        - name: accept
          in: header
          description: ''
          required: false
          example: '*/*'
          schema:
            type: string
        - name: content-type
          in: header
          description: ''
          required: true
          example: application/json
          schema:
            type: string
        - name: Authorization
          in: header
          description: ''
          required: false
          example: Bearer {{YOUR_API_KEY}}
          schema:
            type: string
            default: Bearer {{YOUR_API_KEY}}
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                prompt:
                  type: string
                mv:
                  type: string
                title:
                  type: string
                tags:
                  type: string
                continue_at:
                  type: integer
                continue_clip_id:
                  type: string
                task:
                  type: string
                make_instrumental:
                  type: boolean
              required:
                - prompt
                - mv
                - title
                - tags
                - continue_at
                - continue_clip_id
                - task
                - make_instrumental
              x-apifox-orders:
                - prompt
                - mv
                - title
                - tags
                - continue_at
                - continue_clip_id
                - task
                - make_instrumental
            examples: {}
      responses:
        '200':
          description: ''
          content:
            application/json:
              schema:
                type: object
                properties: {}
                x-apifox-orders: []
          headers: {}
          x-apifox-name: 成功
      security: []
      x-apifox-folder: 音频接口/Suno文生歌
      x-apifox-status: released
      x-run-in-apifox: https://app.apifox.com/web/project/3868318/apis/api-290934291-run
components:
  schemas: {}
  securitySchemes: {}
servers: []
security: []

```
# 场景一: 灵感模式

提交都是 post 到 {{BASE_URL}}/suno/generate
获取结果 都是 get {{BASE_URL}}/suno/feed/clipsId1,clipsId2
通过下面 请求体能产生不同的效果

```
curl --request POST \
  --url {{BASE_URL}}/suno/generate \
  --header 'Authorization: Bearer your-key' \
  --header 'Content-Type: application/json' \
  --data '{
  "gpt_description_prompt": "乡愁"
}'
```