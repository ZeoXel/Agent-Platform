# 生成歌曲 (v1 版本)

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /suno/generate:
    post:
      summary: 生成歌曲 (v1 版本)
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
      x-run-in-apifox: https://app.apifox.com/web/project/3868318/apis/api-294772799-run
components:
  schemas: {}
  securitySchemes: {}
servers: []
security: []

```
# 查询歌曲 (v1 版本)

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ''
  description: ''
  version: 1.0.0
paths:
  /suno/feed/{songid1},{songid2}:
    get:
      summary: 查询歌曲 (v1 版本)
      deprecated: false
      description: ''
      tags:
        - 音频接口/Suno文生歌
      parameters:
        - name: songid1
          in: path
          description: ''
          required: true
          schema:
            type: string
        - name: songid2
          in: path
          description: ''
          required: true
          schema:
            type: string
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
      responses:
        '200':
          description: ''
          content:
            application/json:
              schema:
                type: object
                properties: {}
          headers: {}
          x-apifox-name: 成功
      security: []
      x-apifox-folder: 音频接口/Suno文生歌
      x-apifox-status: released
      x-run-in-apifox: https://app.apifox.com/web/project/3868318/apis/api-290935683-run
components:
  schemas: {}
  securitySchemes: {}
servers: []
security: []

```