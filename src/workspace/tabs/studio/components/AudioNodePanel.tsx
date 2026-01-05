"use client";

/**
 * 音频节点底部面板组件
 *
 * 支持两种模式：
 * - 音乐模式 (Suno V2 灵感模式): 描述想要的音乐，AI 自动创作
 * - 语音模式 (MiniMax): 音色、语速、情感、音效
 */

import React from 'react';
import { Music, Mic2, ChevronDown, Wand2, Loader2, Gauge } from 'lucide-react';
import { AppNode, AudioGenerationMode } from '../types';
import { VOICE_PRESETS, EMOTION_PRESETS, SOUND_EFFECT_PRESETS } from '../services/minimaxService';

interface AudioNodePanelProps {
    node: AppNode;
    isOpen: boolean;
    isWorking: boolean;
    localPrompt: string;
    setLocalPrompt: (value: string) => void;
    inputHeight: number;
    onUpdate: (id: string, data: Partial<AppNode['data']>) => void;
    onAction: () => void;
    onInputFocus: () => void;
    onInputBlur: () => void;
    onInputResizeStart: (e: React.MouseEvent) => void;
    onCmdEnter: (e: React.KeyboardEvent) => void;
}

const GLASS_PANEL = "bg-[#ffffff]/95 backdrop-blur-2xl border border-slate-300 shadow-2xl";

export const AudioNodePanel: React.FC<AudioNodePanelProps> = ({
    node,
    isOpen,
    isWorking,
    localPrompt,
    setLocalPrompt,
    inputHeight,
    onUpdate,
    onAction,
    onInputFocus,
    onInputBlur,
    onInputResizeStart,
    onCmdEnter,
}) => {
    const audioMode = node.data.audioMode || 'music';
    const musicConfig = node.data.musicConfig || {};
    const voiceConfig = node.data.voiceConfig || {};

    // 更新音乐配置
    const updateMusicConfig = (updates: Partial<typeof musicConfig>) => {
        onUpdate(node.id, {
            musicConfig: { ...musicConfig, ...updates }
        });
    };

    // 更新音频模式 - 同时更新对应的默认模型
    const handleModeChange = (mode: AudioGenerationMode) => {
        const defaultModel = mode === 'music' ? 'suno-v4' : 'speech-2.6-hd';
        onUpdate(node.id, { audioMode: mode, model: defaultModel });
    };

    // 更新语音配置
    const updateVoiceConfig = (updates: Partial<typeof voiceConfig>) => {
        onUpdate(node.id, {
            voiceConfig: { ...voiceConfig, ...updates }
        });
    };

    // 获取当前模型显示名称
    const getCurrentModelLabel = () => {
        if (audioMode === 'music') {
            return 'Suno';  // V2 灵感模式
        } else {
            const model = node.data.model || 'speech-2.6-hd';
            if (model === 'speech-2.6-turbo') return 'MiniMax Turbo';
            return 'MiniMax HD';
        }
    };

    // 渲染模式切换标签
    const renderModeTabs = () => (
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5 mb-2">
            <button
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${
                    audioMode === 'music'
                        ? 'bg-white text-pink-500 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                }`}
                onClick={() => handleModeChange('music')}
            >
                <Music size={12} />
                <span>音乐</span>
            </button>
            <button
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${
                    audioMode === 'voice'
                        ? 'bg-white text-blue-500 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                }`}
                onClick={() => handleModeChange('voice')}
            >
                <Mic2 size={12} />
                <span>语音</span>
            </button>
        </div>
    );

    // 渲染音乐模式配置（灵感模式）
    const renderMusicConfig = () => (
        <div className="space-y-2">
            {/* 模式说明 */}
            <div className="flex items-center gap-2 px-2 py-1.5 bg-pink-50/50 rounded-lg">
                <Music size={14} className="text-pink-400" />
                <span className="text-[10px] text-pink-600">灵感模式：描述你想要的音乐，AI 自动创作</span>
            </div>
            {/* 纯音乐选项 */}
            <label className="flex items-center gap-2 cursor-pointer px-1">
                <input
                    type="checkbox"
                    className="w-3.5 h-3.5 rounded border-slate-300 text-pink-500 focus:ring-pink-500"
                    checked={musicConfig.instrumental || false}
                    onChange={(e) => updateMusicConfig({ instrumental: e.target.checked })}
                />
                <span className="text-[10px] text-slate-600">纯音乐（无人声）</span>
            </label>
        </div>
    );

    // 渲染语音模式配置
    const renderVoiceConfig = () => (
        <div className="space-y-2">
            {/* 音色选择 */}
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 w-12 shrink-0">音色</span>
                <div className="relative group/voice flex-1">
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 cursor-pointer hover:border-blue-300">
                        <span className="text-xs text-slate-700">
                            {VOICE_PRESETS.find(v => v.id === voiceConfig.voiceId)?.label || '选择音色'}
                        </span>
                        <ChevronDown size={12} className="text-slate-400" />
                    </div>
                    <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto opacity-0 translate-y-2 pointer-events-none group-hover/voice:opacity-100 group-hover/voice:translate-y-0 group-hover/voice:pointer-events-auto transition-all z-50">
                        {VOICE_PRESETS.map((voice) => (
                            <div
                                key={voice.id}
                                className={`px-3 py-2 cursor-pointer hover:bg-slate-50 ${
                                    voiceConfig.voiceId === voice.id ? 'bg-blue-50 text-blue-600' : 'text-slate-600'
                                }`}
                                onClick={() => updateVoiceConfig({ voiceId: voice.id })}
                            >
                                <div className="text-[10px] font-bold">{voice.label}</div>
                                <div className="text-[9px] text-slate-400">{voice.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 情感选择 */}
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 w-12 shrink-0">情感</span>
                <div className="flex flex-wrap gap-1 flex-1">
                    {EMOTION_PRESETS.map((emotion) => (
                        <button
                            key={emotion.value}
                            className={`px-2 py-0.5 text-[9px] rounded-full border transition-all ${
                                voiceConfig.emotion === emotion.value
                                    ? 'bg-blue-50 border-blue-300 text-blue-600'
                                    : 'bg-white border-slate-200 text-slate-500 hover:border-blue-200'
                            }`}
                            onClick={() => updateVoiceConfig({ emotion: emotion.value })}
                            title={emotion.desc}
                        >
                            {emotion.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 语速控制 */}
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 w-12 shrink-0">语速</span>
                <div className="flex items-center gap-2 flex-1">
                    <Gauge size={12} className="text-slate-400" />
                    <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={voiceConfig.speed || 1}
                        onChange={(e) => updateVoiceConfig({ speed: parseFloat(e.target.value) })}
                        className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <span className="text-[10px] text-slate-600 w-8 text-right">{voiceConfig.speed || 1}x</span>
                </div>
            </div>

            {/* 音效选择 */}
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 w-12 shrink-0">音效</span>
                <div className="flex flex-wrap gap-1 flex-1">
                    {SOUND_EFFECT_PRESETS.map((effect) => (
                        <button
                            key={effect.value}
                            className={`px-2 py-0.5 text-[9px] rounded-full border transition-all ${
                                (voiceConfig.voiceModify?.soundEffect || '') === effect.value
                                    ? 'bg-blue-50 border-blue-300 text-blue-600'
                                    : 'bg-white border-slate-200 text-slate-500 hover:border-blue-200'
                            }`}
                            onClick={() => updateVoiceConfig({
                                voiceModify: { ...voiceConfig.voiceModify, soundEffect: effect.value as any }
                            })}
                            title={effect.desc}
                        >
                            {effect.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className={`absolute top-full left-1/2 -translate-x-1/2 w-[98%] pt-2 z-50 flex flex-col items-center justify-start transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-[-10px] scale-95 pointer-events-none'}`}>
            <div className={`w-full rounded-[20px] p-3 flex flex-col gap-2 ${GLASS_PANEL} relative z-[100]`} onMouseDown={e => e.stopPropagation()} onWheel={(e) => e.stopPropagation()}>

                {/* 模式切换 */}
                {renderModeTabs()}

                {/* 模式特定配置 */}
                {audioMode === 'music' ? renderMusicConfig() : renderVoiceConfig()}

                {/* 文本输入区 */}
                <div className="relative group/input bg-white rounded-[12px] border border-slate-200 mt-2">
                    <textarea
                        className="w-full bg-transparent text-xs text-slate-700 placeholder-slate-500/60 p-3 focus:outline-none resize-none custom-scrollbar font-medium leading-relaxed"
                        style={{ height: `${Math.min(inputHeight, 150)}px` }}
                        placeholder={audioMode === 'music' ? "输入歌词或描述想要的音乐风格..." : "输入要转换为语音的文本内容..."}
                        value={localPrompt}
                        onChange={(e) => setLocalPrompt(e.target.value)}
                        onBlur={onInputBlur}
                        onKeyDown={onCmdEnter}
                        onFocus={onInputFocus}
                        onMouseDown={e => e.stopPropagation()}
                        readOnly={isWorking}
                    />
                    <div className="absolute bottom-0 left-0 w-full h-3 cursor-row-resize flex items-center justify-center opacity-0 group-hover/input:opacity-100 transition-opacity" onMouseDown={onInputResizeStart}>
                        <div className="w-8 h-1 rounded-full bg-slate-100 group-hover/input:bg-slate-200" />
                    </div>
                </div>

                {/* 底部操作栏 */}
                <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                        {/* 模型选择 */}
                        <div className="relative group/model">
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors text-[10px] font-bold text-slate-600 hover:text-blue-400">
                                <span>{getCurrentModelLabel()}</span>
                                <ChevronDown size={10} />
                            </div>
                            <div className="absolute bottom-full left-0 pb-2 w-40 opacity-0 translate-y-2 pointer-events-none group-hover/model:opacity-100 group-hover/model:translate-y-0 group-hover/model:pointer-events-auto transition-all duration-200 z-[200]">
                                <div className="bg-white border border-slate-300 rounded-xl shadow-xl overflow-hidden">
                                    {audioMode === 'music' ? (
                                        <>
                                            <div className="px-3 py-2 text-[10px] font-bold text-pink-500 bg-pink-50">Suno 灵感模式</div>
                                            <div className="px-3 py-1.5 text-[9px] text-slate-400 border-t border-slate-100">AI 自动创作歌词与旋律</div>
                                        </>
                                    ) : (
                                        <>
                                            <div onClick={() => onUpdate(node.id, { model: 'speech-2.6-hd' })} className={`px-3 py-2 text-[10px] font-bold cursor-pointer hover:bg-slate-100 ${node.data.model === 'speech-2.6-hd' || !node.data.model ? 'text-blue-500 bg-blue-50' : 'text-slate-600'}`}>MiniMax HD (推荐)</div>
                                            <div onClick={() => onUpdate(node.id, { model: 'speech-2.6-turbo' })} className={`px-3 py-2 text-[10px] font-bold cursor-pointer hover:bg-slate-100 ${node.data.model === 'speech-2.6-turbo' ? 'text-blue-500 bg-blue-50' : 'text-slate-600'}`}>MiniMax Turbo</div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 生成按钮 */}
                    <button
                        onClick={onAction}
                        disabled={isWorking}
                        className={`relative flex items-center gap-2 px-4 py-1.5 rounded-[12px] font-bold text-[10px] tracking-wide transition-all duration-300 ${
                            isWorking
                                ? 'bg-slate-50 text-slate-500 cursor-not-allowed'
                                : audioMode === 'music'
                                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:shadow-lg hover:shadow-pink-500/20 hover:scale-105 active:scale-95'
                                    : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-105 active:scale-95'
                        }`}
                    >
                        {isWorking ? <Loader2 className="animate-spin" size={12} /> : <Wand2 size={12} />}
                        <span>{isWorking ? '生成中...' : '生成'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
