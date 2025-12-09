/**
 * 自动保存 Hook
 * 监听数据变化并自动保存到localStorage
 */

import { useEffect, useRef } from 'react';

/**
 * 自动保存Hook
 * @param {Function} saveFn - 保存函数
 * @param {Array} dependencies - 依赖项数组
 * @param {number} delay - 防抖延迟（毫秒）
 */
export function useAutoSave(saveFn, dependencies = [], delay = 1000) {
  const timeoutRef = useRef(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // 跳过首次渲染（避免初始化时触发保存）
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // 清除之前的定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 设置新的定时器
    timeoutRef.current = setTimeout(() => {
      try {
        saveFn();
      } catch (error) {
        console.error('自动保存失败:', error);
      }
    }, delay);

    // 清理函数
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}

/**
 * 立即保存Hook（无防抖）
 * @param {Function} saveFn - 保存函数
 * @param {Array} dependencies - 依赖项数组
 */
export function useImmediateSave(saveFn, dependencies = []) {
  const isFirstRender = useRef(true);

  useEffect(() => {
    // 跳过首次渲染
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    try {
      saveFn();
    } catch (error) {
      console.error('保存失败:', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}
