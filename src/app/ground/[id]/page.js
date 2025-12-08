"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import styles from './page.module.css';
import { featuredItem, popularModels, recommendedWorkflows } from '../models';

export default function GroundDetailPage() {
    const params = useParams();
    const { id } = params;

    // Find the item based on ID (using useMemo to avoid effect setState warning)
    const item = useMemo(() => {
        const allItems = [featuredItem, ...popularModels, ...recommendedWorkflows];
        return allItems.find(i => i.id === id);
    }, [id]);

    // Calculate initial inputs based on item (using useMemo to avoid effect setState warning)
    const initialInputs = useMemo(() => {
        if (!item) return {};

        const inputs = {};
        if (item.configFields && item.configFields.length > 0) {
            item.configFields.forEach(field => {
                inputs[field.name] = field.defaultValue || '';
            });
        } else {
            inputs['prompt'] = 'A beautiful landscape...';
        }
        return inputs;
    }, [item]);

    const [inputs, setInputs] = useState(initialInputs);
    const [isRunning, setIsRunning] = useState(false);
    const [result, setResult] = useState(null);
    const [estimatedTime] = useState('~2s');

    // Update inputs when initialInputs changes (item changes)
    useMemo(() => {
        setInputs(initialInputs);
    }, [initialInputs]);

    const handleInputChange = (name, value) => {
        setInputs(prev => ({ ...prev, [name]: value }));
    };

    const handleRun = () => {
        setIsRunning(true);
        // Simulate API call
        setTimeout(() => {
            setIsRunning(false);
            setResult(item?.coverImage || 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800');
        }, 2000);
    };

    if (!item) return <div className={styles.container}><div style={{ padding: '2rem' }}>Loading...</div></div>;

    const statusClass = item.status === 'Operational' ? styles.statusOperational :
        item.status === 'Crowded' ? styles.statusCrowded : '';

    return (
        <div className={styles.container}>
            <div className={styles.splitLayout}>
                {/* Left Panel - Config */}
                <div className={styles.leftPanel}>
                    <Link href="/ground" className={styles.backLink}>
                        ← Back to Explore
                    </Link>

                    <div className={styles.titleSection}>
                        <div className={styles.headerRow}>
                            <h1 className={styles.modelTitle}>{item.title}</h1>
                            {item.status && (
                                <div className={`${styles.modelStatus} ${statusClass}`}>
                                    <span className={styles.statusDot}></span>
                                    {item.status}
                                </div>
                            )}
                        </div>
                        <div className={styles.modelMeta}>
                            <span>by {item.author}</span>
                            <span>•</span>
                            <span>{item.runCount} runs</span>
                            {item.price && <span className={styles.priceTag}>{item.price}</span>}
                        </div>
                        <p className={styles.modelDescription}>{item.description}</p>
                    </div>

                    <div className={styles.configForm}>
                        {/* Dynamic Form Generation */}
                        {item.configFields && item.configFields.length > 0 ? (
                            item.configFields.map(field => (
                                <div key={field.name} className={styles.formGroup}>
                                    <label className={styles.label}>
                                        {field.label}
                                        {!field.required && <span className={styles.labelOptional}>Optional</span>}
                                    </label>
                                    {field.description && <div className={styles.helperText}>{field.description}</div>}

                                    {field.type === 'textarea' ? (
                                        <textarea
                                            className={styles.textarea}
                                            value={inputs[field.name] || ''}
                                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                                            disabled={field.disabled}
                                        />
                                    ) : field.type === 'select' ? (
                                        <select
                                            className={styles.select}
                                            value={inputs[field.name] || ''}
                                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                                            disabled={field.disabled}
                                        >
                                            {field.options && field.options.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            className={styles.input}
                                            value={inputs[field.name] || ''}
                                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                                            placeholder={field.placeholder}
                                            disabled={field.disabled}
                                        />
                                    )}
                                </div>
                            ))
                        ) : (
                            // Fallback default form
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Prompt</label>
                                <textarea
                                    className={styles.textarea}
                                    value={inputs['prompt'] || ''}
                                    onChange={(e) => handleInputChange('prompt', e.target.value)}
                                />
                            </div>
                        )}

                        <button
                            className={styles.runButton}
                            onClick={handleRun}
                            disabled={isRunning}
                        >
                            {isRunning ? 'Running...' : 'Run Model'}
                        </button>
                    </div>
                </div>

                {/* Right Panel - Result & Examples */}
                <div className={styles.rightPanel}>
                    <div className={styles.previewContainer}>
                        {/* Show Reference Image if configured */}
                        {inputs['image'] && !result && (
                            <div className={styles.referencePreview}>
                                <div className={styles.referenceLabel}>Reference Image</div>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={inputs['image']} alt="Ref" className={styles.referenceImg} onError={(e) => e.target.style.display = 'none'} />
                            </div>
                        )}

                        {result ? (
                            <div className={styles.resultCanvas}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={result} alt="Result" className={styles.resultImage} />
                                {isRunning && (
                                    <div className={styles.loadingOverlay}>
                                        <div className={styles.spinner}></div>
                                        <p>Generating...</p>
                                    </div>
                                )}
                                <div className={styles.statusOverlay}>
                                    <span>✓ Complete</span>
                                    <span>0.4s</span>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.emptyState}>
                                {isRunning ? (
                                    <div className={styles.loadingOverlay}>
                                        <div className={styles.spinner}></div>
                                        <p>Generating...</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className={styles.emptyIcon}>✨</div>
                                        <h3>Ready to create</h3>
                                        <p>Configure the settings on the left and click Run.</p>
                                        <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: '#94a3b8' }}>Est. time: {estimatedTime}</p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Bottom Section: Examples */}
                    {item.examples && item.examples.length > 0 && (
                        <div className={styles.bottomSection}>
                            <h3 className={styles.sectionTitle}>Examples</h3>
                            <div className={styles.exampleGrid}>
                                {item.examples.map((ex, idx) => (
                                    <div key={idx} className={styles.exampleCard} onClick={() => setInputs(prev => ({ ...prev, prompt: ex.prompt }))}>
                                        <div
                                            className={styles.exampleImage}
                                            style={{ backgroundImage: `url(${ex.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                                        />
                                        <div className={styles.examplePrompt}>{ex.prompt}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
