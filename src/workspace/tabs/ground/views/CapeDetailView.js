"use client";

import { useEffect, useRef, useState } from 'react';
import { capeService } from '@/services/capeService';
import styles from './CapeDetailView.module.css';

const executionTypeLabels = {
    tool: 'Tool',
    llm: 'LLM',
    hybrid: 'Hybrid',
    code: 'Code',
    workflow: 'Workflow',
};

export default function CapeDetailView({ item, savedState, onStateChange, onBack }) {
    const fileInputRef = useRef(null);
    const outputRef = useRef(null);

    const [input, setInput] = useState(() => savedState?.input || '');
    const [files, setFiles] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [output, setOutput] = useState(() => savedState?.output || '');
    const [dragOver, setDragOver] = useState(false);

    // 同步状态到父组件
    useEffect(() => {
        if (!onStateChange || !item) return;
        onStateChange({ input, output });
    }, [input, output, item, onStateChange]);

    // 自动滚动到输出底部
    useEffect(() => {
        if (outputRef.current && isRunning) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [output, isRunning]);

    // 文件选择处理
    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files || []);
        if (selectedFiles.length > 0) {
            setFiles(prev => [...prev, ...selectedFiles]);
        }
        e.target.value = '';
    };

    // 拖放处理
    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const droppedFiles = Array.from(e.dataTransfer.files || []);
        if (droppedFiles.length > 0) {
            setFiles(prev => [...prev, ...droppedFiles]);
        }
    };

    // 移除文件
    const handleRemoveFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    // 执行 Cape
    const handleRun = async () => {
        if (!input.trim() && files.length === 0) return;

        setIsRunning(true);
        setOutput('');

        try {
            // 如果有文件，先上传
            let uploadedFiles = [];
            if (files.length > 0) {
                try {
                    const uploadResult = await capeService.uploadFiles(files);
                    uploadedFiles = uploadResult.files || [];
                } catch (uploadErr) {
                    setOutput(`文件上传失败: ${uploadErr.message}\n`);
                }
            }

            // 构建消息
            const message = {
                role: 'user',
                content: input,
                ...(uploadedFiles.length > 0 && { files: uploadedFiles }),
            };

            // 调用 Cape Chat API (SSE)
            const response = await fetch('/api/cape/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [message],
                    cape_id: item.capeId, // 指定使用的 cape
                }),
            });

            if (!response.ok) {
                throw new Error(`请求失败: ${response.status}`);
            }

            // 解析 SSE 流
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
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

                            if (parsed.type === 'cape_start') {
                                setOutput(prev => prev + `[${parsed.cape_name}] 开始执行...\n`);
                            } else if (parsed.type === 'content') {
                                setOutput(prev => prev + parsed.content);
                            } else if (parsed.type === 'cape_end') {
                                setOutput(prev => prev + `\n[完成] 耗时 ${parsed.duration_ms}ms\n`);
                            } else if (parsed.type === 'error') {
                                setOutput(prev => prev + `\n[错误] ${parsed.message}\n`);
                            } else if (parsed.type === 'done') {
                                // 完成
                            }
                        } catch (e) {
                            console.error('解析 SSE 数据失败:', e);
                        }
                    }
                }
            }
        } catch (err) {
            setOutput(prev => prev + `\n执行失败: ${err.message}\n`);
        } finally {
            setIsRunning(false);
        }
    };

    // 使用示例
    const handleUseExample = (prompt) => {
        setInput(prompt);
    };

    if (!item) {
        return (
            <div className={styles.container}>
                <div style={{ padding: '2rem' }}>Loading...</div>
            </div>
        );
    }

    const badgeClass = styles[`badge${item.executionType?.charAt(0).toUpperCase()}${item.executionType?.slice(1)}`] || styles.badgeTool;

    return (
        <div className={styles.container}>
            <div className={styles.splitLayout}>
                {/* Left Panel: Configuration */}
                <div className={styles.leftPanel}>
                    <button type="button" className={styles.backLink} onClick={onBack}>
                        ← Back to Explore
                    </button>

                    <div className={styles.titleSection}>
                        <div className={styles.headerRow}>
                            <h1 className={styles.capeTitle}>{item.title}</h1>
                            <span className={`${styles.capeBadge} ${badgeClass}`}>
                                {executionTypeLabels[item.executionType] || item.executionType}
                            </span>
                        </div>
                        <div className={styles.capeMeta}>
                            <span>by {item.author}</span>
                            <span>•</span>
                            <span>{item.price}</span>
                            {item.riskLevel && (
                                <>
                                    <span>•</span>
                                    <span>Risk: {item.riskLevel}</span>
                                </>
                            )}
                        </div>
                        <p className={styles.capeDescription}>{item.description}</p>
                    </div>

                    <div className={styles.configForm}>
                        {/* Input */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>输入内容</label>
                            <div className={styles.helperText}>描述你想要完成的任务</div>
                            <textarea
                                className={styles.textarea}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="例如：将这份文档转换为 PDF..."
                            />
                        </div>

                        {/* File Upload */}
                        <div className={styles.formGroup}>
                            <label className={styles.label}>上传文件 (可选)</label>
                            <div
                                className={`${styles.fileUpload} ${dragOver ? styles.dragOver : ''}`}
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    onChange={handleFileSelect}
                                    style={{ display: 'none' }}
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                                />
                                <div className={styles.uploadIcon}>📁</div>
                                <div className={styles.uploadText}>点击或拖放文件到此处</div>
                                <div className={styles.uploadHint}>支持 PDF, Word, Excel, PPT, TXT, CSV</div>
                            </div>

                            {files.length > 0 && (
                                <div className={styles.fileList}>
                                    {files.map((file, index) => (
                                        <div key={index} className={styles.fileItem}>
                                            <span className={styles.fileName}>
                                                📄 {file.name}
                                                <span className={styles.fileSize}>
                                                    ({(file.size / 1024).toFixed(1)} KB)
                                                </span>
                                            </span>
                                            <button
                                                type="button"
                                                className={styles.removeFile}
                                                onClick={() => handleRemoveFile(index)}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            className={styles.runButton}
                            onClick={handleRun}
                            disabled={isRunning || (!input.trim() && files.length === 0)}
                        >
                            {isRunning ? '执行中...' : '执行能力'}
                        </button>
                    </div>

                    {/* Examples */}
                    {item.intentPatterns?.length > 0 && (
                        <div className={styles.examplesSection}>
                            <div className={styles.examplesTitle}>示例提示词</div>
                            <div className={styles.examplesList}>
                                {item.intentPatterns.slice(0, 5).map((pattern, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        className={styles.exampleChip}
                                        onClick={() => handleUseExample(pattern)}
                                    >
                                        {pattern}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel: Output */}
                <div className={styles.rightPanel}>
                    <div className={styles.outputContainer}>
                        <div className={styles.outputHeader}>
                            <div className={styles.outputTitle}>执行结果</div>
                            <div className={styles.outputStatus}>
                                <span className={`${styles.statusDot} ${isRunning ? styles.running : ''}`}></span>
                                {isRunning ? '执行中' : output ? '已完成' : '待执行'}
                            </div>
                        </div>
                        <div
                            ref={outputRef}
                            className={`${styles.outputContent} ${isRunning ? styles.streaming : ''}`}
                        >
                            {output ? (
                                output
                            ) : (
                                <div className={styles.emptyOutput}>
                                    <div className={styles.emptyIcon}>⚡</div>
                                    <h3>准备就绪</h3>
                                    <p>输入任务描述并点击执行</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
