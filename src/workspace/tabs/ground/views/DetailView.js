"use client";

import { useEffect, useMemo, useState } from 'react';
import styles from './DetailView.module.css';

function buildInitialInputs(item) {
  if (!item) return {};
  if (item.configFields && item.configFields.length > 0) {
    return item.configFields.reduce((acc, field) => {
      acc[field.name] = field.defaultValue || '';
      return acc;
    }, {});
  }
  return { prompt: 'A beautiful landscape...' };
}

export default function DetailView({ item, savedState, onStateChange, onBack }) {
  const initialInputs = useMemo(() => buildInitialInputs(item), [item]);
  const [inputs, setInputs] = useState(() => savedState?.inputs || initialInputs);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState(() => savedState?.result || null);
  const [estimatedTime] = useState('~2s');

  useEffect(() => {
    if (!onStateChange || !item) return;
    onStateChange({ inputs, result });
  }, [inputs, result, item, onStateChange]);

  const handleInputChange = (name, value) => {
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setResult(item?.coverImage || 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800');
    }, 2000);
  };

  if (!item) {
    return (
      <div className={styles.container}>
        <div style={{ padding: '2rem' }}>Loading...</div>
      </div>
    );
  }

  const statusClass =
    item.status === 'Operational'
      ? styles.statusOperational
      : item.status === 'Crowded'
        ? styles.statusCrowded
        : '';

  return (
    <div className={styles.container}>
      <div className={styles.splitLayout}>
        <div className={styles.leftPanel}>
          <button type="button" className={styles.backLink} onClick={onBack}>
            ← Back to Explore
          </button>

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
            {item.configFields && item.configFields.length > 0 ? (
              item.configFields.map((field) => (
                <div key={field.name} className={styles.formGroup}>
                  <label className={styles.label}>
                    {field.label}
                    {!field.required && (
                      <span className={styles.labelOptional}>Optional</span>
                    )}
                  </label>
                  {field.description && (
                    <div className={styles.helperText}>{field.description}</div>
                  )}

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
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
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
              type="button"
              className={styles.runButton}
              onClick={handleRun}
              disabled={isRunning}
            >
              {isRunning ? 'Running...' : 'Run Model'}
            </button>
          </div>
        </div>

        <div className={styles.rightPanel}>
          <div className={styles.previewContainer}>
            {inputs['image'] && !result && (
              <div className={styles.referencePreview}>
                <div className={styles.referenceLabel}>Reference Image</div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={inputs['image']}
                  alt="Ref"
                  className={styles.referenceImg}
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                  }}
                />
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
                    <p className={styles.estimate}>Est. time: {estimatedTime}</p>
                  </>
                )}
              </div>
            )}
          </div>

          {item.examples?.length > 0 && (
            <div className={styles.bottomSection}>
              <h3 className={styles.sectionTitle}>Examples</h3>
              <div className={styles.exampleGrid}>
                {item.examples.map((example, index) => (
                  <button
                    type="button"
                    key={index}
                    className={styles.exampleCard}
                    onClick={() =>
                      setInputs((prev) => ({ ...prev, prompt: example.prompt }))
                    }
                  >
                    <div
                      className={styles.exampleImage}
                      style={{
                        backgroundImage: `url(${example.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                    <div className={styles.examplePrompt}>{example.prompt}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
