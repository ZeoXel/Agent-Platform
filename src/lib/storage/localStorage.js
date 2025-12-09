/**
 * localStorage 工具函数
 * 提供类型安全的localStorage操作
 */

const STORAGE_KEYS = {
  SESSIONS: 'agent_sessions',
  ACTIVE_SESSION: 'agent_active_session',
  GENERATION_RECORDS: 'generation_records',
  USER_PREFERENCES: 'user_preferences'
};

const MAX_SESSIONS = 50; // 最多保存50个会话
const MAX_RECORDS = 200; // 最多保存200条生成记录

/**
 * 安全地从localStorage读取数据
 * @param {string} key - 存储键名
 * @param {*} defaultValue - 默认值
 * @returns {*} 解析后的数据或默认值
 */
export function getStorageItem(key, defaultValue = null) {
  if (typeof window === 'undefined') {
    return defaultValue;
  }

  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`读取localStorage失败 [${key}]:`, error);
    return defaultValue;
  }
}

/**
 * 安全地写入localStorage
 * @param {string} key - 存储键名
 * @param {*} value - 要存储的值
 * @returns {boolean} 是否成功
 */
export function setStorageItem(key, value) {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`写入localStorage失败 [${key}]:`, error);
    // 如果存储已满，尝试清理旧数据
    if (error.name === 'QuotaExceededError') {
      console.warn('localStorage空间不足，尝试清理旧数据...');
      cleanupOldData();
      // 再次尝试
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (retryError) {
        console.error('重试写入失败:', retryError);
        return false;
      }
    }
    return false;
  }
}

/**
 * 删除localStorage项
 * @param {string} key - 存储键名
 */
export function removeStorageItem(key) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`删除localStorage失败 [${key}]:`, error);
  }
}

/**
 * 清理旧数据（保留最近的记录）
 */
function cleanupOldData() {
  // 清理旧会话
  const sessions = getStorageItem(STORAGE_KEYS.SESSIONS, []);
  if (sessions.length > MAX_SESSIONS) {
    const sortedSessions = sessions
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, MAX_SESSIONS);
    setStorageItem(STORAGE_KEYS.SESSIONS, sortedSessions);
  }

  // 清理旧生成记录
  const records = getStorageItem(STORAGE_KEYS.GENERATION_RECORDS, []);
  if (records.length > MAX_RECORDS) {
    const sortedRecords = records
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, MAX_RECORDS);
    setStorageItem(STORAGE_KEYS.GENERATION_RECORDS, sortedRecords);
  }
}

/**
 * 获取所有会话
 * @returns {Array} 会话列表
 */
export function getSessions() {
  return getStorageItem(STORAGE_KEYS.SESSIONS, []);
}

/**
 * 保存会话列表
 * @param {Array} sessions - 会话列表
 */
export function setSessions(sessions) {
  setStorageItem(STORAGE_KEYS.SESSIONS, sessions);
}

/**
 * 获取单个会话
 * @param {string} sessionId - 会话ID
 * @returns {Object|null} 会话对象或null
 */
export function getSession(sessionId) {
  const sessions = getSessions();
  return sessions.find(s => s.id === sessionId) || null;
}

/**
 * 保存或更新会话
 * @param {Object} session - 会话对象
 */
export function saveSession(session) {
  const sessions = getSessions();
  const index = sessions.findIndex(s => s.id === session.id);

  if (index >= 0) {
    // 更新现有会话
    sessions[index] = session;
  } else {
    // 添加新会话
    sessions.unshift(session);

    // 限制会话数量
    if (sessions.length > MAX_SESSIONS) {
      sessions.pop();
    }
  }

  setSessions(sessions);
}

/**
 * 删除会话
 * @param {string} sessionId - 会话ID
 */
export function deleteSession(sessionId) {
  const sessions = getSessions();
  const filtered = sessions.filter(s => s.id !== sessionId);
  setSessions(filtered);

  // 如果删除的是当前活跃会话，清除活跃状态
  const activeId = getStorageItem(STORAGE_KEYS.ACTIVE_SESSION);
  if (activeId === sessionId) {
    removeStorageItem(STORAGE_KEYS.ACTIVE_SESSION);
  }
}

/**
 * 获取当前活跃会话ID
 * @returns {string|null} 会话ID或null
 */
export function getActiveSessionId() {
  return getStorageItem(STORAGE_KEYS.ACTIVE_SESSION, null);
}

/**
 * 设置当前活跃会话ID
 * @param {string} sessionId - 会话ID
 */
export function setActiveSessionId(sessionId) {
  setStorageItem(STORAGE_KEYS.ACTIVE_SESSION, sessionId);
}

/**
 * 保存生成记录
 * @param {Object} record - 生成记录
 */
export function saveGenerationRecord(record) {
  const records = getStorageItem(STORAGE_KEYS.GENERATION_RECORDS, []);
  records.unshift(record);

  // 限制记录数量
  if (records.length > MAX_RECORDS) {
    records.pop();
  }

  setStorageItem(STORAGE_KEYS.GENERATION_RECORDS, records);
}

/**
 * 获取生成记录
 * @param {Object} filter - 过滤条件
 * @returns {Array} 记录列表
 */
export function getGenerationRecords(filter = {}) {
  const records = getStorageItem(STORAGE_KEYS.GENERATION_RECORDS, []);

  if (!filter || Object.keys(filter).length === 0) {
    return records;
  }

  return records.filter(record => {
    if (filter.type && record.source.type !== filter.type) {
      return false;
    }
    if (filter.mediaType && record.output.mediaType !== filter.mediaType) {
      return false;
    }
    if (filter.sessionId && record.sessionId !== filter.sessionId) {
      return false;
    }
    return true;
  });
}

/**
 * 导出所有数据（用于备份）
 * @returns {Object} 所有存储的数据
 */
export function exportAllData() {
  return {
    sessions: getSessions(),
    activeSessionId: getActiveSessionId(),
    generationRecords: getStorageItem(STORAGE_KEYS.GENERATION_RECORDS, []),
    preferences: getStorageItem(STORAGE_KEYS.USER_PREFERENCES, {}),
    exportedAt: Date.now()
  };
}

/**
 * 导入数据（用于恢复）
 * @param {Object} data - 要导入的数据
 */
export function importAllData(data) {
  if (data.sessions) setSessions(data.sessions);
  if (data.activeSessionId) setActiveSessionId(data.activeSessionId);
  if (data.generationRecords) {
    setStorageItem(STORAGE_KEYS.GENERATION_RECORDS, data.generationRecords);
  }
  if (data.preferences) {
    setStorageItem(STORAGE_KEYS.USER_PREFERENCES, data.preferences);
  }
}

/**
 * 清空所有数据
 */
export function clearAllData() {
  Object.values(STORAGE_KEYS).forEach(key => {
    removeStorageItem(key);
  });
}

export { STORAGE_KEYS };
