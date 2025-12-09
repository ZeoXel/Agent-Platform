"use client";

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { HiPaperClip, HiWrench, HiTrash } from 'react-icons/hi2';
import { IoSend } from 'react-icons/io5';
import styles from './page.module.css';
import { useSessionManager } from '@/hooks/useSessionManager';

export default function AgentPage() {
    const chatEndRef = useRef(null);
    const textareaRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isStreamingContent, setIsStreamingContent] = useState(false); // 是否正在流式输出内容
    const [currentStatus, setCurrentStatus] = useState(''); // 当前状态：thinking, generating, editing, responding
    const [error, setError] = useState(null);

    // 使用会话管理hook
    const {
        sessions,
        activeSessionId,
        isLoading,
        createSession,
        updateSessionMessages,
        removeSession,
        switchSession,
        getActiveSession
    } = useSessionManager();

    // 初始化：加载活跃会话或创建新会话
    useEffect(() => {
        if (isLoading) return;

        if (!activeSessionId) {
            // 如果没有活跃会话，创建新会话
            createSession();
        } else {
            // 加载活跃会话的消息
            const activeSession = getActiveSession();
            if (activeSession) {
                setMessages(activeSession.messages);
            }
        }
    }, [isLoading, activeSessionId, createSession, getActiveSession]);

    // 保存消息变化到localStorage
    // 使用 ref 来跟踪上次保存的消息，避免重复保存
    const prevMessagesRef = useRef([]);
    useEffect(() => {
        if (activeSessionId && messages.length > 0 && !isTyping) {
            // 只在消息实际变化时保存
            const messagesChanged = JSON.stringify(prevMessagesRef.current) !== JSON.stringify(messages);
            if (messagesChanged) {
                updateSessionMessages(activeSessionId, messages);
                prevMessagesRef.current = messages;
            }
        }
    }, [messages, activeSessionId, isTyping, updateSessionMessages]);

    // Auto-scroll to bottom
    // 滚动策略：
    // 1. 新消息添加时滚动（用户发送消息、AI回复开始）
    // 2. 状态提示出现时滚动
    // 3. 流式输出完成时滚动一次
    // 4. 流式输出过程中不滚动
    const prevMessageCountRef = useRef(0);
    const prevIsStreamingRef = useRef(false);

    useEffect(() => {
        const messageCountChanged = messages.length !== prevMessageCountRef.current;
        const statusAppeared = isTyping && currentStatus;
        const streamJustFinished = prevIsStreamingRef.current && !isStreamingContent;

        const shouldScroll = messageCountChanged || statusAppeared || streamJustFinished;

        if (shouldScroll) {
            // 使用 setTimeout 确保 DOM 已更新
            setTimeout(() => {
                chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 0);
            prevMessageCountRef.current = messages.length;
        }

        prevIsStreamingRef.current = isStreamingContent;
    }, [messages.length, isTyping, currentStatus, isStreamingContent]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [input]);

    const handleSendMessage = async () => {
        if (!input.trim() || !activeSessionId) return;

        const userMsg = { role: 'user', content: input, timestamp: Date.now() };
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setInput('');
        setIsTyping(true);
        setCurrentStatus('thinking');
        setError(null);

        try {
            const response = await fetch('/api/agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: activeSessionId,
                    messages: updatedMessages.map(m => ({
                        role: m.role,
                        content: m.content
                    }))
                })
            });

            if (!response.ok) {
                throw new Error('请求失败');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            let assistantContent = '';
            let assistantImages = [];
            let buffer = '';
            let hasHiddenStatus = false; // 追踪是否已隐藏状态

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        try {
                            const parsed = JSON.parse(data);

                            if (parsed.type === 'status') {
                                setCurrentStatus(parsed.status);
                            } else if (parsed.type === 'content') {
                                assistantContent += parsed.content;
                                // 收到第一个内容时，隐藏状态提示并标记开始流式输出
                                if (!hasHiddenStatus) {
                                    hasHiddenStatus = true;
                                    setIsTyping(false);
                                    setCurrentStatus('');
                                    setIsStreamingContent(true);
                                }
                                // 实时更新消息
                                setMessages(prev => {
                                    const newMessages = [...prev];
                                    const lastMsg = newMessages[newMessages.length - 1];
                                    if (lastMsg && lastMsg.role === 'assistant') {
                                        // 创建新对象而不是修改原对象
                                        newMessages[newMessages.length - 1] = {
                                            ...lastMsg,
                                            content: assistantContent,
                                            isStreaming: true
                                        };
                                    } else {
                                        newMessages.push({
                                            role: 'assistant',
                                            content: assistantContent,
                                            images: assistantImages,
                                            isStreaming: true
                                        });
                                    }
                                    return newMessages;
                                });
                            } else if (parsed.type === 'images') {
                                assistantImages = parsed.images;
                                setMessages(prev => {
                                    const newMessages = [...prev];
                                    const lastMsg = newMessages[newMessages.length - 1];
                                    if (lastMsg && lastMsg.role === 'assistant') {
                                        // 创建新对象而不是修改原对象
                                        newMessages[newMessages.length - 1] = {
                                            ...lastMsg,
                                            images: assistantImages
                                        };
                                    } else {
                                        newMessages.push({
                                            role: 'assistant',
                                            content: assistantContent,
                                            images: assistantImages
                                        });
                                    }
                                    return newMessages;
                                });
                            } else if (parsed.type === 'done') {
                                // 完成，标记流式结束并更新消息
                                setMessages(prev => {
                                    const newMessages = [...prev];
                                    const lastMsg = newMessages[newMessages.length - 1];
                                    if (lastMsg && lastMsg.role === 'assistant') {
                                        newMessages[newMessages.length - 1] = {
                                            ...lastMsg,
                                            isStreaming: false
                                        };
                                    }
                                    return newMessages;
                                });
                                // 使用 setTimeout 确保在下一个事件循环中更新状态
                                // 这样可以确保 prevIsStreamingRef 已经是 true
                                setTimeout(() => {
                                    setIsStreamingContent(false);
                                }, 0);
                                break;
                            } else if (parsed.type === 'error') {
                                throw new Error(parsed.error);
                            }
                        } catch (e) {
                            console.error('解析SSE数据失败:', e);
                        }
                    }
                }
            }

            // 如果没有添加助手消息，添加一个
            setMessages(prev => {
                const lastMsg = prev[prev.length - 1];
                if (!lastMsg || lastMsg.role !== 'assistant') {
                    return [...prev, {
                        role: 'assistant',
                        content: assistantContent,
                        images: assistantImages
                    }];
                }
                return prev;
            });

        } catch (err) {
            setError(err.message || '发生未知错误');
            const errorMsg = {
                role: 'assistant',
                content: `抱歉，发生了错误：${err.message}`,
                images: []
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
            setCurrentStatus('');
            setIsStreamingContent(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleNewChat = () => {
        setMessages([]);
        setError(null);
        createSession();
    };

    const handleSwitchSession = (sessionId) => {
        switchSession(sessionId);
        const session = sessions.find(s => s.id === sessionId);
        if (session) {
            setMessages(session.messages);
        }
        setError(null);
    };

    const handleDeleteSession = (sessionId, e) => {
        e.stopPropagation();
        if (confirm('确定要删除这个会话吗？')) {
            removeSession(sessionId);
            // 如果删除的是当前会话，清空消息
            if (sessionId === activeSessionId) {
                setMessages([]);
            }
        }
    };

    return (
        <div className={styles.container}>
            {/* Left Sidebar: History */}
            <div className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <span>历史记录</span>
                    <button className={styles.newChatBtn} onClick={handleNewChat}>+</button>
                </div>
                <div className={styles.historyList}>
                    {isLoading ? (
                        <div className={styles.loadingText}>加载中...</div>
                    ) : sessions.length === 0 ? (
                        <div className={styles.emptyText}>暂无历史记录</div>
                    ) : (
                        sessions.map(session => (
                            <div
                                key={session.id}
                                className={`${styles.historyItem} ${session.id === activeSessionId ? styles.active : ''}`}
                                onClick={() => handleSwitchSession(session.id)}
                            >
                                <span className={styles.historyTitle}>{session.title}</span>
                                <button
                                    className={styles.deleteBtn}
                                    onClick={(e) => handleDeleteSession(session.id, e)}
                                    title="删除会话"
                                >
                                    <HiTrash size={14} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Center: Chat Area */}
            <div className={styles.chatArea}>
                <div className={styles.chatScrollArea}>
                    {messages.length === 0 ? (
                        <div className={styles.welcomeMessage}>
                            <div className={styles.cosmicRing}>
                                <div className={styles.ring}></div>
                                <div className={styles.ring}></div>
                                <div className={styles.ring}></div>
                            </div>
                            <h1 className={styles.welcomeTitle}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src="/logo.svg" alt="Agent Platform Logo" className={styles.welcomeLogo} />
                                你好！我能帮你做点什么？
                            </h1>
                            <p className={styles.welcomeSubtitle}></p>
                        </div>
                    ) : (
                        messages.map((msg, idx) => (
                            <div key={idx} className={`${styles.messageRow} ${msg.role === 'user' ? styles.userRow : ''}`}>
                                <div className={`${styles.messageContent} ${msg.isStreaming ? styles.streaming : ''}`}>
                                    {msg.role === 'assistant' ? (
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    ) : (
                                        msg.content
                                    )}
                                    {/* Render images if present */}
                                    {msg.images && msg.images.length > 0 && (
                                        <div className={styles.imageGrid}>
                                            {msg.images.map((img, imgIdx) => (
                                                <a
                                                    key={imgIdx}
                                                    href={img.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={styles.imageLink}
                                                >
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={img.url}
                                                        alt={`生成的图片 ${imgIdx + 1}`}
                                                        className={styles.generatedImage}
                                                    />
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                    {isTyping && (
                        <div className={styles.messageRow}>
                            <div className={styles.loadingBubble}>
                                <span className={styles.statusText}>
                                    {currentStatus === 'thinking' && '思考中'}
                                    {currentStatus === 'generating' && '生成中'}
                                    {currentStatus === 'editing' && '编辑中'}
                                    {!currentStatus && '处理中'}
                                    <span className={styles.shimmer}>...</span>
                                </span>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className={styles.inputContainer}>
                    <div className={styles.inputWrapper}>
                        <textarea
                            ref={textareaRef}
                            className={styles.chatInput}
                            placeholder="输入消息... 例如：画一只可爱的小猫"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={1}
                        />
                        <div className={styles.inputActions}>
                            <div className={styles.leftActions}>
                                {/* Asset Upload Button */}
                                <button className={styles.actionButton} title="上传素材">
                                    <HiPaperClip size={18} />
                                </button>
                                <button className={styles.actionButton} title="工具">
                                    <HiWrench size={18} />
                                </button>
                            </div>
                            <button
                                className={styles.sendButton}
                                onClick={handleSendMessage}
                                disabled={!input.trim() || isTyping}
                            >
                                <IoSend size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
