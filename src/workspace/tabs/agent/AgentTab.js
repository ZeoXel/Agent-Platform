"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { HiPaperClip, HiWrench, HiTrash } from 'react-icons/hi2';
import { IoSend } from 'react-icons/io5';
import { useSessionManager } from '@/hooks/useSessionManager';
import { CapeConfigModal } from '@/components/cape';

export default function AgentPage() {
    const chatEndRef = useRef(null);
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isStreamingContent, setIsStreamingContent] = useState(false);
    const [currentStatus, setCurrentStatus] = useState('');
    const [error, setError] = useState(null);
    const [attachments, setAttachments] = useState([]);
    const [showCapeConfig, setShowCapeConfig] = useState(false);
    const [enabledCapes, setEnabledCapes] = useState(null);

    const {
        sessions,
        activeSessionId,
        activeSession,
        isLoading,
        createSession,
        updateSessionMessages,
        removeSession,
        switchSession
    } = useSessionManager();
    const hydratedSessionRef = useRef(null);

    useEffect(() => {
        if (isLoading) return;
        if (!activeSessionId) {
            if (!sessions.length) createSession();
            else setMessages([]);
            hydratedSessionRef.current = null;
            return;
        }
        if (!activeSession) return;
        if (hydratedSessionRef.current === activeSession.id) return;
        setMessages(activeSession.messages || []);
        setAttachments([]);
        hydratedSessionRef.current = activeSession.id;
    }, [isLoading, activeSessionId, activeSession, sessions.length, createSession]);

    const prevMessagesRef = useRef([]);
    useEffect(() => {
        if (activeSessionId && messages.length > 0 && !isTyping) {
            const messagesChanged = JSON.stringify(prevMessagesRef.current) !== JSON.stringify(messages);
            if (messagesChanged) {
                updateSessionMessages(activeSessionId, messages);
                prevMessagesRef.current = messages;
            }
        }
    }, [messages, activeSessionId, isTyping, updateSessionMessages]);

    const prevMessageCountRef = useRef(0);
    const prevIsStreamingRef = useRef(false);
    useEffect(() => {
        const messageCountChanged = messages.length !== prevMessageCountRef.current;
        const statusAppeared = isTyping && currentStatus;
        const streamJustFinished = prevIsStreamingRef.current && !isStreamingContent;
        if (messageCountChanged || statusAppeared || streamJustFinished) {
            setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
            prevMessageCountRef.current = messages.length;
        }
        prevIsStreamingRef.current = isStreamingContent;
    }, [messages.length, isTyping, currentStatus, isStreamingContent]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [input]);

    const handleSelectAttachment = async (event) => {
        const files = Array.from(event.target.files || []);
        if (!files.length) return;
        const readFile = (file) => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve({
                id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
                name: file.name, size: file.size, type: file.type, url: reader.result,
            });
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
        try {
            const fileEntries = await Promise.all(files.map(readFile));
            setAttachments(prev => [...prev, ...fileEntries]);
        } catch (err) { console.error('读取素材失败', err); }
        event.target.value = '';
    };

    const handleRemoveAttachment = (id) => setAttachments(prev => prev.filter(f => f.id !== id));

    const formatMessageForApi = (message) => {
        const formatted = { role: message.role, content: message.content };
        if (!Array.isArray(message.attachments) || !message.attachments.length) return formatted;
        const parts = [];
        if (typeof message.content === 'string' && message.content.trim()) {
            parts.push({ type: 'text', text: message.content.trim() });
        }
        message.attachments.forEach((file) => {
            if (file.url) parts.push({ type: 'image_url', image_url: { url: file.url } });
        });
        formatted.content = parts;
        formatted.attachments = message.attachments.map(({ url, name, type }) => ({ url, name, type }));
        return formatted;
    };

    const handleSendMessage = async () => {
        const trimmedInput = input.trim();
        if (!trimmedInput && attachments.length === 0) return;
        if (!activeSessionId) return;

        const userMsg = {
            role: 'user', content: trimmedInput, timestamp: Date.now(), attachments,
            images: attachments.map(f => ({ url: f.url, name: f.name, isLocal: true }))
        };
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setInput(''); setAttachments([]); setIsTyping(true); setCurrentStatus('thinking'); setError(null);

        try {
            const response = await fetch('/api/agent-v2', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId: activeSessionId, messages: updatedMessages.map(formatMessageForApi) })
            });
            if (!response.ok) throw new Error('请求失败');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let assistantContent = '', assistantImages = [], buffer = '', hasHiddenStatus = false;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const parsed = JSON.parse(line.slice(6));
                            if (parsed.type === 'status') setCurrentStatus(parsed.status);
                            else if (parsed.type === 'content') {
                                assistantContent += parsed.content;
                                if (!hasHiddenStatus) {
                                    hasHiddenStatus = true;
                                    setIsTyping(false); setCurrentStatus(''); setIsStreamingContent(true);
                                }
                                setMessages(prev => {
                                    const newMsgs = [...prev];
                                    const last = newMsgs[newMsgs.length - 1];
                                    if (last?.role === 'assistant') {
                                        newMsgs[newMsgs.length - 1] = { ...last, content: assistantContent, isStreaming: true };
                                    } else {
                                        newMsgs.push({ role: 'assistant', content: assistantContent, images: assistantImages, isStreaming: true });
                                    }
                                    return newMsgs;
                                });
                            } else if (parsed.type === 'images') {
                                assistantImages = parsed.images;
                                setMessages(prev => {
                                    const newMsgs = [...prev];
                                    const last = newMsgs[newMsgs.length - 1];
                                    if (last?.role === 'assistant') newMsgs[newMsgs.length - 1] = { ...last, images: assistantImages };
                                    else newMsgs.push({ role: 'assistant', content: assistantContent, images: assistantImages });
                                    return newMsgs;
                                });
                            } else if (parsed.type === 'done') {
                                setMessages(prev => {
                                    const newMsgs = [...prev];
                                    const last = newMsgs[newMsgs.length - 1];
                                    if (last?.role === 'assistant') newMsgs[newMsgs.length - 1] = { ...last, isStreaming: false };
                                    return newMsgs;
                                });
                                setTimeout(() => setIsStreamingContent(false), 0);
                                break;
                            } else if (parsed.type === 'error') throw new Error(parsed.error);
                        } catch (e) { console.error('解析SSE数据失败:', e); }
                    }
                }
            }
            setMessages(prev => {
                const last = prev[prev.length - 1];
                if (!last || last.role !== 'assistant') return [...prev, { role: 'assistant', content: assistantContent, images: assistantImages }];
                return prev;
            });
        } catch (err) {
            setError(err.message || '发生未知错误');
            setMessages(prev => [...prev, { role: 'assistant', content: `抱歉，发生了错误：${err.message}`, images: [] }]);
        } finally {
            setIsTyping(false); setCurrentStatus(''); setIsStreamingContent(false);
        }
    };

    const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } };
    const handleNewChat = () => { setMessages([]); setError(null); setAttachments([]); createSession(); };
    const handleSwitchSession = (sessionId) => {
        switchSession(sessionId);
        const session = sessions.find(s => s.id === sessionId);
        if (session) setMessages(session.messages);
        setAttachments([]); setError(null);
    };
    const handleDeleteSession = (sessionId, e) => {
        e.stopPropagation();
        if (confirm('确定要删除这个会话吗？')) {
            removeSession(sessionId);
            if (sessionId === activeSessionId) { setMessages([]); setAttachments([]); }
        }
    };
    const handleCapeConfigSave = useCallback((newEnabledCapes) => setEnabledCapes(newEnabledCapes), []);

    const getStatusText = () => {
        switch (currentStatus) {
            case 'thinking': return '思考中';
            case 'generating': return '生成中';
            case 'editing': return '编辑中';
            default: return '处理中';
        }
    };

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden">
            {/* Sidebar */}
            <aside className="w-[280px] flex-shrink-0 flex flex-col h-full
                backdrop-blur-2xl bg-gradient-to-b from-white/35 to-white/15
                border-r border-white/25">
                <div className="p-4 flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-600">历史记录</span>
                    <button onClick={handleNewChat}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-semibold
                            backdrop-blur-xl bg-gradient-to-br from-white/30 to-white/10
                            border border-white/30 hover:from-blue-500/25 hover:to-blue-500/10
                            transition-all hover:-rotate-6">
                        +
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto px-2 space-y-1">
                    {isLoading ? (
                        <p className="text-center text-sm text-gray-500 py-4">加载中...</p>
                    ) : sessions.length === 0 ? (
                        <p className="text-center text-sm text-gray-500 py-4">暂无历史记录</p>
                    ) : (
                        sessions.map(session => (
                            <div key={session.id}
                                onClick={() => handleSwitchSession(session.id)}
                                className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all
                                    ${session.id === activeSessionId
                                        ? 'bg-gradient-to-br from-blue-500/15 to-blue-500/5 text-blue-600 font-medium'
                                        : 'hover:bg-gradient-to-br hover:from-white/30 hover:to-white/10'}`}>
                                <span className="truncate text-sm">{session.title}</span>
                                <button onClick={(e) => handleDeleteSession(session.id, e)}
                                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/10 hover:text-red-500 transition-all">
                                    <HiTrash size={14} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </aside>

            {/* Chat Area */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
                <div className="flex-1 overflow-y-auto p-8 pb-32 space-y-6">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <h1 className="text-2xl font-semibold flex items-center gap-3">
                                <img src="/logo.svg" alt="Logo" className="w-12 h-12 drop-shadow-lg" />
                                你好！我能帮你做点什么？
                            </h1>
                        </div>
                    ) : (
                        messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] px-4 py-3 rounded-xl
                                    backdrop-blur-xl shadow-lg
                                    ${msg.role === 'user'
                                        ? 'bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-white/25 rounded-tr-sm'
                                        : 'bg-gradient-to-br from-white/40 to-white/15 border border-white/30 rounded-tl-sm'}
                                    ${msg.isStreaming ? 'animate-pulse' : ''}`}>
                                    {msg.role === 'assistant' ? (
                                        <div className="prose prose-sm max-w-none">
                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        </div>
                                    ) : (
                                        <p>{msg.content}</p>
                                    )}
                                    {msg.images?.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {msg.images.map((img, i) => (
                                                <a key={i} href={img.url} target="_blank" rel="noopener noreferrer"
                                                    className="block rounded-lg overflow-hidden hover:scale-105 transition-transform">
                                                    <img src={img.url} alt="" className="max-h-80 rounded-lg" />
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="px-4 py-2 rounded-full
                                backdrop-blur-xl bg-gradient-to-br from-white/35 to-white/15
                                border border-white/25 shadow-lg">
                                <span className="text-sm text-gray-600 animate-pulse">{getStatusText()}...</span>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-center pointer-events-none">
                    <div className="w-full max-w-3xl pointer-events-auto
                        backdrop-blur-2xl bg-gradient-to-br from-white/40 to-white/20
                        border border-white/30 rounded-2xl p-3 shadow-xl
                        transition-all hover:shadow-2xl focus-within:shadow-2xl
                        focus-within:from-white/50 focus-within:to-white/30">
                        {attachments.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                                {attachments.map(file => (
                                    <div key={file.id} className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/50 border border-dashed border-gray-300">
                                        {file.type?.startsWith('image/') && (
                                            <img src={file.url} alt="" className="w-9 h-9 rounded object-cover" />
                                        )}
                                        <div className="text-xs">
                                            <p className="font-medium truncate max-w-[100px]">{file.name}</p>
                                            <p className="text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                        <button onClick={() => handleRemoveAttachment(file.id)}
                                            className="p-1 rounded hover:bg-gray-200 text-gray-500">
                                            <HiTrash size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <textarea ref={textareaRef} value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="输入消息... 例如：画一只可爱的小猫"
                            rows={1}
                            className="w-full bg-transparent border-none outline-none resize-none text-base px-2 py-1"
                        />
                        <div className="flex justify-between items-center px-2 mt-2">
                            <div className="flex gap-2">
                                <input ref={fileInputRef} type="file" multiple accept="image/*"
                                    onChange={handleSelectAttachment} className="hidden" />
                                <button onClick={() => fileInputRef.current?.click()}
                                    className="p-2 rounded-lg text-gray-500 hover:bg-white/50 hover:text-gray-700 transition-all">
                                    <HiPaperClip size={18} />
                                </button>
                                <button onClick={() => setShowCapeConfig(true)}
                                    className="p-2 rounded-lg text-gray-500 hover:bg-white/50 hover:text-gray-700 transition-all">
                                    <HiWrench size={18} />
                                </button>
                            </div>
                            <button onClick={handleSendMessage}
                                disabled={(!input.trim() && !attachments.length) || isTyping}
                                className="p-2 rounded-lg text-blue-500 hover:bg-blue-500/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                                <IoSend size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <CapeConfigModal isOpen={showCapeConfig} onClose={() => setShowCapeConfig(false)}
                enabledCapes={enabledCapes} onSave={handleCapeConfigSave} />
        </div>
    );
}
