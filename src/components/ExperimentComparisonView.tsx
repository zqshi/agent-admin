import React, { useState } from 'react';
import {
  ArrowRight, AlertTriangle, CheckCircle, Info,
  TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp
} from 'lucide-react';
import { StrategyComparison } from '../types/productionStrategy';

interface ExperimentComparisonViewProps {
  comparison: StrategyComparison;
  className?: string;
}

const ExperimentComparisonView: React.FC<ExperimentComparisonViewProps> = ({
  comparison,
  className = ''
}) => {
  const [showAllDifferences, setShowAllDifferences] = useState(false);

  const getImpactColor = (impact: 'low' | 'medium' | 'high') => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getImpactIcon = (impact: 'low' | 'medium' | 'high') => {
    switch (impact) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Info className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getValueChangeIcon = (baselineValue: any, proposedValue: any) => {
    if (typeof baselineValue === 'number' && typeof proposedValue === 'number') {
      if (proposedValue > baselineValue) return <TrendingUp className="h-4 w-4 text-blue-600" />;
      if (proposedValue < baselineValue) return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const displayedDifferences = showAllDifferences
    ? comparison.differences
    : comparison.differences.slice(0, 3);

  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-6 ${className}`}>
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">实验配置对比</h3>
          <p className="text-sm text-gray-600">对照组 vs 实验组的关键差异</p>
        </div>

        {comparison.differences.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              发现 {comparison.differences.length} 项差异
            </span>
            {comparison.differences.length > 3 && (
              <button
                onClick={() => setShowAllDifferences(!showAllDifferences)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {showAllDifferences ? '收起' : '查看全部'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* 对比概览 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* 对照组（当前线上） */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="font-medium text-gray-900">对照组 (A组)</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">当前线上</span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">模型:</span>
              <span className="font-medium">{comparison.baseline.config.model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">温度:</span>
              <span className="font-medium">{comparison.baseline.config.temperature}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Token数:</span>
              <span className="font-medium">{comparison.baseline.config.maxTokens}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">工具:</span>
              <span className="font-medium">{comparison.baseline.config.tools.length}个</span>
            </div>
          </div>
        </div>

        {/* 实验组（新配置） */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="font-medium text-gray-900">实验组 (B组)</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">新配置</span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">模型:</span>
              <span className="font-medium">{comparison.proposed.model || comparison.baseline.config.model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">温度:</span>
              <span className="font-medium">{comparison.proposed.temperature || comparison.baseline.config.temperature}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Token数:</span>
              <span className="font-medium">{comparison.proposed.maxTokens || comparison.baseline.config.maxTokens}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">工具:</span>
              <span className="font-medium">{comparison.proposed.tools?.length || comparison.baseline.config.tools.length}个</span>
            </div>
          </div>
        </div>
      </div>

      {/* 差异详情 */}
      {comparison.differences.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900">关键差异分析</h4>
          </div>

          <div className="space-y-3">
            {displayedDifferences.map((diff, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getImpactColor(diff.impact)}`}
              >
                <div className="flex items-start gap-3">
                  {getImpactIcon(diff.impact)}

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{diff.field}</span>
                      {getValueChangeIcon(diff.baselineValue, diff.proposedValue)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 text-sm">
                      <div>
                        <span className="text-gray-600">当前值:</span>
                        <div className="font-medium mt-1 p-2 bg-white rounded border">
                          {typeof diff.baselineValue === 'object'
                            ? JSON.stringify(diff.baselineValue)
                            : String(diff.baselineValue)}
                        </div>
                      </div>

                      <div className="flex items-center justify-center">
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>

                      <div>
                        <span className="text-gray-600">新值:</span>
                        <div className="font-medium mt-1 p-2 bg-white rounded border">
                          {typeof diff.proposedValue === 'object'
                            ? JSON.stringify(diff.proposedValue)
                            : String(diff.proposedValue)}
                        </div>
                      </div>
                    </div>

                    <div className="text-sm">
                      <span className="font-medium">影响评估:</span> {diff.description}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 展开/收起更多差异 */}
          {comparison.differences.length > 3 && (
            <button
              onClick={() => setShowAllDifferences(!showAllDifferences)}
              className="w-full py-2 px-4 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {showAllDifferences ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  收起差异详情
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  查看剩余 {comparison.differences.length - 3} 项差异
                </>
              )}
            </button>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
          <h4 className="font-medium text-gray-900 mb-2">配置相同</h4>
          <p className="text-gray-600">实验配置与当前线上策略完全一致</p>
        </div>
      )}

      {/* 实验建议 */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <div className="font-medium mb-1">实验建议</div>
            <div>
              {comparison.differences.length > 0 ? (
                `检测到 ${comparison.differences.length} 项配置差异，建议仔细评估每项变更的潜在影响。
                ${comparison.differences.filter(d => d.impact === 'high').length > 0
                  ? '存在高影响变更，建议谨慎进行实验。'
                  : '配置变更影响较小，可以安全进行实验。'}`
              ) : (
                '配置与当前线上策略一致，此实验可能无法产生显著差异。建议调整配置参数以获得有意义的对比结果。'
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperimentComparisonView;