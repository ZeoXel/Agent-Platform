"use client";

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { HiPaperClip, HiWrench } from 'react-icons/hi2';
import { IoSend } from 'react-icons/io5';
import styles from './page.module.css';

export default function AgentPage() {
    const chatEndRef = useRef(null);
    const textareaRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [currentStatus, setCurrentStatus] = useState(''); // 当前状态：thinking, generating, editing, responding
    const [error, setError] = useState(null);
    const [sessionId, setSessionId] = useState(() => `session_${Date.now()}`); // 会话ID
    const [historyList, setHistoryList] = useState([
        { id: 1, title: '图像生成会话', active: false },
        { id: 2, title: '写作助手', active: false },
        { id: 3, title: '项目规划', active: false }
    ]);

    // Auto-scroll to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping, currentStatus]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [input]);

    const handleSendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
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
                    sessionId,
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
                                // 实时更新消息
                                setMessages(prev => {
                                    const newMessages = [...prev];
                                    const lastMsg = newMessages[newMessages.length - 1];
                                    if (lastMsg && lastMsg.role === 'assistant') {
                                        // 创建新对象而不是修改原对象
                                        newMessages[newMessages.length - 1] = {
                                            ...lastMsg,
                                            content: assistantContent
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
                                // 完成
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
        setSessionId(`session_${Date.now()}`); // 重置会话ID
        setError(null);
    };

    return (
        <div className={styles.container}>
            {/* Left Sidebar: History */}
            <div className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <span>历史记录</span>
                    <button className={styles.newChatBtn} onClick={handleNewChat}>+ 新对话</button>
                </div>
                <div className={styles.historyList}>
                    {historyList.map(item => (
                        <div key={item.id} className={`${styles.historyItem} ${item.active ? styles.active : ''}`}>
                            {item.title}
                        </div>
                    ))}
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
                                <div className={styles.messageContent}>
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
