/**
 * 预览引擎Hook
 * 提供Prompt编译和预览相关的功能
 */

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { usePromptEngineeringStore } from '../stores/promptEngineeringStore';
import { PromptCompiler } from '../services/promptCompiler';
import type { PreviewResult, OptimizationSuggestion } from '../types';

export interface UsePreviewEngineReturn {
  // 状态
  previewResult: PreviewResult | null;
  isCompiling: boolean;
  lastCompileTime: string | null;
  compilationError: string | null;

  // 编译操作
  compilePrompt: () => Promise<PreviewResult>;
  forceCompile: () => Promise<PreviewResult>;
  clearPreview: () => void;

  // 自动编译控制
  enableAutoCompile: () => void;
  disableAutoCompile: () => void;
  isAutoCompileEnabled: boolean;

  // 优化建议
  applyOptimization: (suggestion: OptimizationSuggestion) => void;
  dismissSuggestion: (suggestionId: string) => void;

  // 性能分析
  getPerformanceInsights: () => {
    tokenEfficiency: number;
    costEfficiency: number;
    qualityScore: number;
    recommendations: string[];
  };

  // 比较工具
  compareWithPrevious: () => {
    tokenDiff: number;
    costDiff: number;
    qualityDiff: number;
    changes: string[];
  } | null;

  // 导出工具
  exportPreviewResult: () => string;
  exportForTesting: () => {
    prompt: string;
    expectedMetrics: any;
    testCases: any[];
  };
}

export const usePreviewEngine = (): UsePreviewEngineReturn => {
  const store = usePromptEngineeringStore();
  const compiler = useMemo(() => new PromptCompiler(), []);

  // 编译历史记录（用于比较）
  const compilationHistory = useRef<PreviewResult[]>([]);

  // 自动编译控制
  const autoCompileEnabled = useRef(true);
  const autoCompileTimer = useRef<number | null>(null);

  const {
    selectedTemplate,
    slotValues,
    injectionStrategy,
    compressionStrategy,
    previewResult,
    isCompiling,
    lastCompileTime,
    errors,
    compilePrompt: storeCompilePrompt,
    updatePreviewResult,
    clearPreviewResult,
    setCompilationError
  } = store;

  // 编译Prompt
  const compilePrompt = useCallback(async (): Promise<PreviewResult> => {
    if (!selectedTemplate) {
      throw new Error('请先选择一个模板');
    }

    try {
      const result = await storeCompilePrompt();

      // 保存到历史记录
      compilationHistory.current.push(result);
      if (compilationHistory.current.length > 10) {
        compilationHistory.current.shift(); // 保持最近10次记录
      }

      return result;
    } catch (error) {
      console.error('编译失败:', error);
      throw error;
    }
  }, [selectedTemplate, storeCompilePrompt]);

  // 强制编译（忽略缓存）
  const forceCompile = useCallback(async (): Promise<PreviewResult> => {
    if (!selectedTemplate) {
      throw new Error('请先选择一个模板');
    }

    try {
      // 清除编译缓存
      compiler.clearCache();

      const result = await compiler.compile(
        selectedTemplate,
        slotValues,
        injectionStrategy,
        compressionStrategy,
        {
          strictMode: true,
          validateSlots: true,
          optimizeOutput: false, // 强制编译时不使用缓存
          includeDebugInfo: true
        }
      );

      updatePreviewResult(result);

      // 保存到历史记录
      compilationHistory.current.push(result);
      if (compilationHistory.current.length > 10) {
        compilationHistory.current.shift();
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '编译失败';
      setCompilationError(errorMessage);
      throw error;
    }
  }, [
    selectedTemplate,
    slotValues,
    injectionStrategy,
    compressionStrategy,
    compiler,
    updatePreviewResult,
    setCompilationError
  ]);

  // 清除预览
  const clearPreview = useCallback(() => {
    clearPreviewResult();
    setCompilationError(null);
  }, [clearPreviewResult, setCompilationError]);

  // 启用自动编译
  const enableAutoCompile = useCallback(() => {
    autoCompileEnabled.current = true;
  }, []);

  // 禁用自动编译
  const disableAutoCompile = useCallback(() => {
    autoCompileEnabled.current = false;
    if (autoCompileTimer.current) {
      clearTimeout(autoCompileTimer.current);
      autoCompileTimer.current = null;
    }
  }, []);

  // 应用优化建议
  const applyOptimization = useCallback((suggestion: OptimizationSuggestion) => {
    switch (suggestion.type) {
      case 'cost':
        if (suggestion.action.type === 'auto' && suggestion.id === 'token-optimization') {
          // 启用压缩
          store.updateCompressionStrategy({
            config: {
              ...compressionStrategy.config,
              maxTokens: Math.floor(compressionStrategy.config.maxTokens * 0.8)
            }
          });
        }
        break;

      case 'performance':
        if (suggestion.id === 'performance-optimization') {
          // 启用缓存
          enableAutoCompile();
        }
        break;

      case 'quality':
        // 质量优化通常需要手动处理
        console.log('质量优化建议:', suggestion.action.instruction);
        break;

      default:
        console.log('应用优化建议:', suggestion);
    }

    // 重新编译以查看效果
    if (autoCompileEnabled.current) {
      compilePrompt();
    }
  }, [compressionStrategy, store, compilePrompt]);

  // 忽略建议
  const dismissSuggestion = useCallback((suggestionId: string) => {
    if (previewResult) {
      const updatedResult = {
        ...previewResult,
        suggestions: previewResult.suggestions.filter(s => s.id !== suggestionId)
      };
      updatePreviewResult(updatedResult);
    }
  }, [previewResult, updatePreviewResult]);

  // 获取性能洞察
  const getPerformanceInsights = useCallback(() => {
    if (!previewResult) {
      return {
        tokenEfficiency: 0,
        costEfficiency: 0,
        qualityScore: 0,
        recommendations: ['请先编译Prompt以获取性能数据']
      };
    }

    const { metrics } = previewResult;
    const recommendations: string[] = [];

    // Token效率分析
    const tokenEfficiency = Math.max(0, 100 - metrics.tokenUsage.percentage);
    if (metrics.tokenUsage.percentage > 80) {
      recommendations.push('Token使用率过高，建议启用压缩');
    }

    // 成本效率分析
    const baselineCost = 0.01; // 基准成本
    const costEfficiency = Math.max(0, 100 - (metrics.cost.total / baselineCost) * 100);
    if (metrics.cost.total > baselineCost) {
      recommendations.push('成本较高，考虑优化Prompt长度');
    }

    // 质量分析
    const qualityScore = metrics.quality.overall * 100;
    if (qualityScore < 70) {
      recommendations.push('内容质量有待提升，建议添加更多具体指导');
    }

    // 时间效率分析
    if (metrics.time.total > 2000) {
      recommendations.push('编译时间较长，建议启用缓存或简化Slot配置');
    }

    return {
      tokenEfficiency,
      costEfficiency,
      qualityScore,
      recommendations
    };
  }, [previewResult]);

  // 与上一次结果比较
  const compareWithPrevious = useCallback(() => {
    if (!previewResult || compilationHistory.current.length < 2) {
      return null;
    }

    const current = previewResult;
    const previous = compilationHistory.current[compilationHistory.current.length - 2];

    const tokenDiff = current.tokenCount - previous.tokenCount;
    const costDiff = current.estimatedCost - previous.estimatedCost;
    const qualityDiff = current.qualityScore - previous.qualityScore;

    const changes: string[] = [];

    if (Math.abs(tokenDiff) > 5) {
      changes.push(`Token数量${tokenDiff > 0 ? '增加' : '减少'}了${Math.abs(tokenDiff)}个`);
    }

    if (Math.abs(costDiff) > 0.001) {
      changes.push(`成本${costDiff > 0 ? '增加' : '减少'}了$${Math.abs(costDiff).toFixed(4)}`);
    }

    if (Math.abs(qualityDiff) > 0.05) {
      changes.push(`质量评分${qualityDiff > 0 ? '提升' : '下降'}了${(Math.abs(qualityDiff) * 100).toFixed(1)}%`);
    }

    return {
      tokenDiff,
      costDiff,
      qualityDiff,
      changes
    };
  }, [previewResult]);

  // 导出预览结果
  const exportPreviewResult = useCallback(() => {
    if (!previewResult) {
      throw new Error('没有可导出的预览结果');
    }

    const exportData = {
      ...previewResult,
      exportedAt: new Date().toISOString(),
      template: selectedTemplate?.name,
      slotValues,
      configuration: {
        injectionStrategy,
        compressionStrategy
      }
    };

    return JSON.stringify(exportData, null, 2);
  }, [previewResult, selectedTemplate, slotValues, injectionStrategy, compressionStrategy]);

  // 导出用于测试
  const exportForTesting = useCallback(() => {
    if (!previewResult || !selectedTemplate) {
      throw new Error('没有可导出的测试数据');
    }

    const testCases = selectedTemplate.metadata.examples.map(example => ({
      description: example.title,
      input: example.inputValues,
      expectedOutput: example.expectedOutput,
      expectedMetrics: example.metrics
    }));

    return {
      prompt: previewResult.compiledPrompt,
      expectedMetrics: {
        maxTokens: previewResult.tokenCount + 100, // 允许一定误差
        maxCost: previewResult.estimatedCost * 1.2,
        minQuality: previewResult.qualityScore * 0.9
      },
      testCases
    };
  }, [previewResult, selectedTemplate]);

  // 自动编译逻辑
  const scheduleAutoCompile = useCallback(() => {
    if (!autoCompileEnabled.current || !selectedTemplate) return;

    if (autoCompileTimer.current) {
      clearTimeout(autoCompileTimer.current);
    }

    autoCompileTimer.current = setTimeout(() => {
      compilePrompt().catch(error => {
        console.error('自动编译失败:', error);
      });
    }, 1000); // 1秒延迟
  }, [selectedTemplate, compilePrompt]);

  // 监听变化并触发自动编译
  useEffect(() => {
    if (autoCompileEnabled.current) {
      scheduleAutoCompile();
    }

    return () => {
      if (autoCompileTimer.current) {
        clearTimeout(autoCompileTimer.current);
      }
    };
  }, [slotValues, injectionStrategy, compressionStrategy, scheduleAutoCompile]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (autoCompileTimer.current) {
        clearTimeout(autoCompileTimer.current);
      }
    };
  }, []);

  // 计算衍生状态
  const derivedState = useMemo(() => {
    const hasResult = previewResult !== null;
    const hasErrors = errors.compilation !== null;
    const isReady = selectedTemplate !== null && Object.keys(store.slotErrors).length === 0;

    return {
      hasResult,
      hasErrors,
      isReady,
      canCompile: isReady && !isCompiling,
      hasOptimizations: previewResult?.suggestions.length || 0 > 0,
      hasHistory: compilationHistory.current.length > 1
    };
  }, [previewResult, errors.compilation, selectedTemplate, store.slotErrors, isCompiling]);

  return {
    // 状态
    previewResult,
    isCompiling,
    lastCompileTime,
    compilationError: errors.compilation,

    // 编译操作
    compilePrompt,
    forceCompile,
    clearPreview,

    // 自动编译控制
    enableAutoCompile,
    disableAutoCompile,
    isAutoCompileEnabled: autoCompileEnabled.current,

    // 优化建议
    applyOptimization,
    dismissSuggestion,

    // 性能分析
    getPerformanceInsights,

    // 比较工具
    compareWithPrevious,

    // 导出工具
    exportPreviewResult,
    exportForTesting,

    // 衍生状态
    ...derivedState
  };
};

/**
 * 编译性能监控Hook
 */
export const useCompilationPerformance = () => {
  const performanceData = useRef<{
    compilationTimes: number[];
    tokenCounts: number[];
    memoryCosts: number[];
  }>({
    compilationTimes: [],
    tokenCounts: [],
    memoryCosts: []
  });

  const recordPerformance = useCallback((result: PreviewResult) => {
    const data = performanceData.current;

    data.compilationTimes.push(result.metrics.time.total);
    data.tokenCounts.push(result.tokenCount);
    data.memoryCosts.push(result.estimatedCost);

    // 保持最近50次记录
    if (data.compilationTimes.length > 50) {
      data.compilationTimes.shift();
      data.tokenCounts.shift();
      data.memoryCosts.shift();
    }
  }, []);

  const getPerformanceStats = useCallback(() => {
    const data = performanceData.current;

    if (data.compilationTimes.length === 0) {
      return null;
    }

    const avgCompilationTime = data.compilationTimes.reduce((a, b) => a + b, 0) / data.compilationTimes.length;
    const avgTokenCount = data.tokenCounts.reduce((a, b) => a + b, 0) / data.tokenCounts.length;
    const avgCost = data.memoryCosts.reduce((a, b) => a + b, 0) / data.memoryCosts.length;

    return {
      avgCompilationTime: Math.round(avgCompilationTime),
      avgTokenCount: Math.round(avgTokenCount),
      avgCost: parseFloat(avgCost.toFixed(4)),
      totalCompilations: data.compilationTimes.length,
      trend: {
        compilationTime: data.compilationTimes.length > 1
          ? data.compilationTimes[data.compilationTimes.length - 1] - data.compilationTimes[0]
          : 0,
        tokenCount: data.tokenCounts.length > 1
          ? data.tokenCounts[data.tokenCounts.length - 1] - data.tokenCounts[0]
          : 0
      }
    };
  }, []);

  const clearPerformanceData = useCallback(() => {
    performanceData.current = {
      compilationTimes: [],
      tokenCounts: [],
      memoryCosts: []
    };
  }, []);

  return {
    recordPerformance,
    getPerformanceStats,
    clearPerformanceData
  };
};