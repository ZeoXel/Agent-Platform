"use client";

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './page.module.css';

export default function AgentPage() {
    const chatEndRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
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
    }, [messages, isTyping]);

    const handleSendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setInput('');
        setIsTyping(true);
        setError(null);

        try {
            const response = await fetch('/api/agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId, // 传入会话ID
                    messages: updatedMessages.map(m => ({
                        role: m.role,
                        content: m.content
                    }))
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '请求失败');
            }

            const aiMsg = {
                role: 'assistant',
                content: data.reply || '',
                images: data.images || []
            };
            setMessages(prev => [...prev, aiMsg]);
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
                            <div className={styles.welcomeIcon}>✨</div>
                            <h1>你好！我能帮你做什么？</h1>
                            <p>我可以帮你生成图片、编辑图片、或者回答问题。</p>
                            <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                                试试说：画一只可爱的小猫
                            </p>
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
                            <div className={styles.loadingBubble}>思考中...</div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className={styles.inputContainer}>
                    <div className={styles.inputWrapper}>
                        <textarea
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
                                    <span>📎</span> 上传
                                </button>
                                <button className={styles.actionButton} title="工具">
                                    <span>🛠️</span> 工具
                                </button>
                            </div>
                            <button
                                className={styles.sendButton}
                                onClick={handleSendMessage}
                                disabled={!input.trim() || isTyping}
                            >
                                ➤
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
