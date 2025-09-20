/**
 * 自然语言输入组件
 * 支持文本输入、语音输入、智能提示等功能
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Loader2,
  Lightbulb,
  MessageSquare,
  Sparkles,
  Volume2,
  VolumeX
} from 'lucide-react';
import type { NaturalLanguageInputProps } from '../types';

const NaturalLanguageInput: React.FC<NaturalLanguageInputProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = "描述您想要创建的数字员工...",
  enableVoice = true,
  enableSuggestions = true,
  maxLength = 1000,
  loading = false,
  suggestions = [],
  examples = []
}) => {
  const [isListening, setIsListening] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(-1);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [textToSpeech, setTextToSpeech] = useState<SpeechSynthesis | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const suggestionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 默认示例
  const defaultExamples = examples.length > 0 ? examples : [
    "我需要一个客服助手，能够回答订单问题和处理客户投诉，要求友好耐心",
    "创建一个技术支持专员，专门负责故障诊断和技术文档维护，性格专业严谨",
    "销售部需要一个AI顾问，可以介绍产品、计算报价，要求热情专业",
    "人力资源部门的助手，处理员工咨询、招聘支持，性格亲和负责",
    "产品部的需求分析助手，能够收集用户反馈、分析产品数据"
  ];

  // 智能建议
  const defaultSuggestions = suggestions.length > 0 ? suggestions : [
    "指定所属部门",
    "描述主要职责",
    "设定性格特点",
    "配置所需工具",
    "添加专业技能"
  ];

  useEffect(() => {
    // 检查语音识别支持
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      setSpeechSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      if (recognitionRef.current) {
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'zh-CN';

        recognitionRef.current.onstart = () => {
          setIsListening(true);
        };

        recognitionRef.current.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');

          onChange(transcript);
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }

    // 检查语音合成支持
    if ('speechSynthesis' in window) {
      setTextToSpeech(window.speechSynthesis);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onChange]);

  // 处理键盘事件
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !loading) {
        onSubmit(value);
      }
    }

    if (enableSuggestions && showSuggestions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setCurrentSuggestionIndex(prev =>
          prev < defaultSuggestions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setCurrentSuggestionIndex(prev =>
          prev > 0 ? prev - 1 : defaultSuggestions.length - 1
        );
      } else if (e.key === 'Tab' && currentSuggestionIndex >= 0) {
        e.preventDefault();
        applySuggestion(defaultSuggestions[currentSuggestionIndex]);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
        setCurrentSuggestionIndex(-1);
      }
    }
  }, [value, loading, onSubmit, enableSuggestions, showSuggestions, currentSuggestionIndex, defaultSuggestions]);

  // 开始语音识别
  const startListening = useCallback(() => {
    if (recognitionRef.current && speechSupported) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
      }
    }
  }, [speechSupported]);

  // 停止语音识别
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  // 应用建议
  const applySuggestion = useCallback((suggestion: string) => {
    const newValue = value ? `${value}，${suggestion}` : suggestion;
    onChange(newValue);
    setShowSuggestions(false);
    setCurrentSuggestionIndex(-1);
    textareaRef.current?.focus();
  }, [value, onChange]);

  // 应用示例
  const applyExample = useCallback((example: string) => {
    onChange(example);
    setShowExamples(false);
    textareaRef.current?.focus();
  }, [onChange]);

  // 朗读文本
  const speakText = useCallback((text: string) => {
    if (textToSpeech && text) {
      textToSpeech.cancel(); // 停止当前朗读
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      textToSpeech.speak(utterance);
    }
  }, [textToSpeech]);

  // 自动调整高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [value]);

  return (
    <div className="relative">
      {/* 主输入区域 */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => enableSuggestions && setShowSuggestions(true)}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={loading}
          className={`w-full min-h-[80px] max-h-[120px] px-4 py-3 pr-20 border-2 rounded-xl resize-none
            transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${loading ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300 hover:border-gray-400'}
            ${isListening ? 'border-red-400 bg-red-50' : ''}
          `}
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            lineHeight: '1.5'
          }}
        />

        {/* 右侧按钮组 */}
        <div className="absolute right-2 top-2 flex flex-col gap-1">
          {/* 语音输入按钮 */}
          {enableVoice && speechSupported && (
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              disabled={loading}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isListening
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={isListening ? '停止语音输入' : '开始语音输入'}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
          )}

          {/* 发送按钮 */}
          <button
            type="button"
            onClick={() => value.trim() && onSubmit(value)}
            disabled={!value.trim() || loading}
            className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600
              disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            title="发送"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* 字符计数 */}
        <div className="absolute bottom-2 left-3 text-xs text-gray-400">
          {value.length}/{maxLength}
        </div>
      </div>

      {/* 工具栏 */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          {/* 建议按钮 */}
          {enableSuggestions && (
            <button
              type="button"
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600
                hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Lightbulb className="h-4 w-4" />
              智能建议
            </button>
          )}

          {/* 示例按钮 */}
          <button
            type="button"
            onClick={() => setShowExamples(!showExamples)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-green-600
              hover:bg-green-50 rounded-lg transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            参考示例
          </button>

          {/* 朗读按钮 */}
          {textToSpeech && value && (
            <button
              type="button"
              onClick={() => speakText(value)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-purple-600
                hover:bg-purple-50 rounded-lg transition-colors"
            >
              <Volume2 className="h-4 w-4" />
              朗读
            </button>
          )}
        </div>

        {/* 状态指示 */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          {isListening && (
            <div className="flex items-center gap-1 text-red-500">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              正在听取语音...
            </div>
          )}
          {loading && (
            <div className="flex items-center gap-1 text-blue-500">
              <Loader2 className="h-3 w-3 animate-spin" />
              AI思考中...
            </div>
          )}
        </div>
      </div>

      {/* 智能建议面板 */}
      {enableSuggestions && showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200
          rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
              <Sparkles className="h-4 w-4 text-blue-500" />
              智能建议
            </div>
          </div>
          <div className="p-2">
            {defaultSuggestions.map((suggestion, index) => (
              <div
                key={index}
                ref={el => suggestionRefs.current[index] = el}
                onClick={() => applySuggestion(suggestion)}
                className={`px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm
                  ${index === currentSuggestionIndex
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-gray-50 text-gray-700'
                  }`}
              >
                {suggestion}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 示例面板 */}
      {showExamples && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200
          rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
              <MessageSquare className="h-4 w-4 text-green-500" />
              参考示例
            </div>
          </div>
          <div className="p-2">
            {defaultExamples.map((example, index) => (
              <div
                key={index}
                onClick={() => applyExample(example)}
                className="px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-50
                  transition-colors text-sm text-gray-700 border-b border-gray-100 last:border-b-0"
              >
                <div className="font-medium text-xs text-gray-500 mb-1">
                  示例 {index + 1}
                </div>
                {example}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 语音状态指示 */}
      {isListening && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2
          bg-red-500 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          正在录音...
        </div>
      )}
    </div>
  );
};

export default NaturalLanguageInput;