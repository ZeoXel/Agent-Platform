"use client";

import { useState, useRef, useEffect } from 'react';
import styles from './page.module.css';

export default function AgentPage() {
    const chatEndRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [historyList, setHistoryList] = useState([
        { id: 1, title: 'Previous Session: Image Gen', active: false },
        { id: 2, title: 'Writing Assistant', active: false },
        { id: 3, title: 'Project Planning', active: false }
    ]);

    // Auto-scroll to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSendMessage = () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Simulate AI Response
        setTimeout(() => {
            const aiMsg = {
                role: 'assistant',
                content: "I'm your AI Agent. I can help you generate images, write text, or plan your projects. What would you like to do next?"
            };
            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
        }, 1500);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className={styles.container}>
            {/* Left Sidebar: History */}
            <div className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <span>HISTORY</span>
                    <button className={styles.newChatBtn} onClick={() => setMessages([])}>+ New Chat</button>
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
                            <h1>How can I help you today?</h1>
                            <p>I can assist with writing, analysis, and creative tasks.</p>
                        </div>
                    ) : (
                        messages.map((msg, idx) => (
                            <div key={idx} className={`${styles.messageRow} ${msg.role === 'user' ? styles.userRow : ''}`}>
                                <div className={`${styles.avatar} ${msg.role === 'user' ? styles.userAvatar : styles.botAvatar}`}>
                                    {msg.role === 'user' ? 'U' : 'AI'}
                                </div>
                                <div className={styles.messageContent}>
                                    {msg.content}
                                </div>
                            </div>
                        ))
                    )}
                    {isTyping && (
                        <div className={styles.messageRow}>
                            <div className={`${styles.avatar} ${styles.botAvatar}`}>AI</div>
                            <div className={styles.loadingBubble}>Thinking...</div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className={styles.inputContainer}>
                    <div className={styles.inputWrapper}>
                        <textarea
                            className={styles.chatInput}
                            placeholder="Message Agent..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={1}
                        />
                        <div className={styles.inputActions}>
                            <div className={styles.leftActions}>
                                {/* Asset Upload Button */}
                                <button className={styles.actionButton} title="Upload Asset">
                                    <span>📎</span> Upload
                                </button>
                                <button className={styles.actionButton} title="Tools">
                                    <span>🛠️</span> Tools
                                </button>
                            </div>
                            <button
                                className={styles.sendButton}
                                onClick={handleSendMessage}
                                disabled={!input.trim() && !isTyping}
                            >
                                ➤
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel: Agent Details */}
            <div className={styles.rightPanel}>
                <div className={styles.modelHeader}>
                    <h2 className={styles.modelTitle}>AI Agent</h2>
                    <div className={styles.modelMeta}>
                        Powered by Gemini 1.5 Pro
                    </div>
                </div>

                <div className={styles.configSection}>
                    <div className={styles.sectionTitle}>Capabilities</div>
                    <div className={styles.capabilityItem}>
                        <span className={styles.capabilityIcon}></span>
                        <span>Image Generation</span>
                    </div>
                    <div className={styles.capabilityItem}>
                        <span className={styles.capabilityIcon}></span>
                        <span>Content Writing</span>
                    </div>
                    <div className={styles.capabilityItem}>
                        <span className={styles.capabilityIcon}></span>
                        <span>Data Analysis</span>
                    </div>
                    <div className={styles.capabilityItem}>
                        <span className={styles.capabilityIcon}></span>
                        <span>Code Assistance</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
