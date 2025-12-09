/**
 * 对话会话数据结构
 * @typedef {Object} Session
 * @property {string} id - 会话唯一标识
 * @property {string} title - 会话标题（从第一条消息生成）
 * @property {Message[]} messages - 消息列表
 * @property {number} createdAt - 创建时间戳
 * @property {number} updatedAt - 最后更新时间戳
 * @property {SessionMetadata} metadata - 会话元数据
 */

/**
 * 消息数据结构
 * @typedef {Object} Message
 * @property {string} role - 角色：'user' | 'assistant'
 * @property {string} content - 消息内容
 * @property {Image[]} [images] - 生成的图片列表（仅assistant消息）
 * @property {number} timestamp - 消息时间戳
 */

/**
 * 图片数据结构
 * @typedef {Object} Image
 * @property {string} url - 图片URL
 * @property {string} [prompt] - 生成提示词
 * @property {Object} [metadata] - 图片元数据
 */

/**
 * 会话元数据
 * @typedef {Object} SessionMetadata
 * @property {number} messageCount - 消息总数
 * @property {number} imageCount - 生成图片总数
 * @property {string[]} tags - 标签列表
 */

/**
 * 生成记录（用于Library模块）
 * @typedef {Object} GenerationRecord
 * @property {string} id - 记录唯一标识
 * @property {string} sessionId - 所属会话ID
 * @property {Source} source - 来源信息
 * @property {Input} input - 输入参数
 * @property {Output} output - 输出结果
 * @property {number} createdAt - 创建时间戳
 */

/**
 * 来源信息
 * @typedef {Object} Source
 * @property {'agent' | 'tool' | 'workflow'} type - 来源类型
 * @property {string} [id] - 工具或工作流ID
 * @property {string} entryPoint - 触发页面
 */

/**
 * 输入参数
 * @typedef {Object} Input
 * @property {string} [prompt] - 提示词
 * @property {string[]} [files] - 文件列表
 * @property {Object} params - 其他参数
 */

/**
 * 输出结果
 * @typedef {Object} Output
 * @property {'image' | 'video' | 'audio' | 'text'} mediaType - 媒体类型
 * @property {string} fileUrl - 文件URL
 * @property {string} [thumbnailUrl] - 缩略图URL
 * @property {Object} metadata - 元数据
 */

export {};
