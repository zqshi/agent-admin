/**
 * 记忆系统统一仪表板
 * 提供五层记忆的统一管理、监控和分析界面
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Brain,
  Activity,
  TrendingUp,
  Database,
  Settings,
  Search,
  Filter,
  RefreshCw,
  Download,
  BarChart3,
  Layers,
  Zap
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { WorkingMemory, EpisodicMemory, SemanticMemory, ProceduralMemory, EmotionalMemory } from '../layers';
import { MemoryFlow } from '../visualization/MemoryFlow';
import { useMemorySystem } from '../../hooks/useMemorySystem';
import { MemoryLayerType, EnhancedMemoryEntry, MemorySystemState } from '../../types';

interface MemoryDashboardProps {
  employeeId: string;
  onMemorySelect?: (memory: EnhancedMemoryEntry) => void;
  onMemoryTransfer?: (memoryId: string, targetLayer: MemoryLayerType) => void;
  onSkillExecute?: (skillId: string) => void;
  onConceptExplore?: (conceptId: string) => void;
  onEmotionalInsightView?: (insightId: string) => void;
}

export const MemoryDashboard: React.FC<MemoryDashboardProps> = ({
  employeeId,
  onMemorySelect,
  onMemoryTransfer,
  onSkillExecute,
  onConceptExplore,
  onEmotionalInsightView
}) => {
  const [activeLayer, setActiveLayer] = useState<MemoryLayerType>('working');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'analysis' | 'flow'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // 使用记忆系统Hook
  const {
    memorySystem,
    layerStates,
    systemState,
    isLoading,
    error,
    refreshMemories,
    searchMemories,
    transferMemory,
    optimizeSystem
  } = useMemorySystem(employeeId);

  // 工具函数 - 移到前面以避免初始化问题
  const getLayerDisplayName = (layer: MemoryLayerType): string => {
    const names = {
      working: '工作记忆',
      episodic: '情景记忆',
      semantic: '语义记忆',
      procedural: '程序记忆',
      emotional: '情感记忆'
    };
    return names[layer];
  };

  const getLayerIcon = (layer: MemoryLayerType) => {
    const icons = {
      working: Brain,
      episodic: Activity,
      semantic: Database,
      procedural: Settings,
      emotional: TrendingUp
    };
    return icons[layer];
  };

  const getLayerColor = (layer: MemoryLayerType) => {
    const colors = {
      working: 'text-blue-500',
      episodic: 'text-purple-500',
      semantic: 'text-green-500',
      procedural: 'text-orange-500',
      emotional: 'text-pink-500'
    };
    return colors[layer];
  };

  const getHealthColor = (score: number) => {
    if (score > 0.8) return 'text-green-600 bg-green-50';
    if (score > 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  // 自动刷新
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshMemories();
    }, 10000); // 10秒刷新一次

    return () => clearInterval(interval);
  }, [autoRefresh, refreshMemories]);

  // 计算系统概览统计
  const systemOverview = useMemo(() => {
    if (!systemState) return null;

    const totalMemories = systemState.totalMemories;
    const healthScore = (
      systemState.systemCoherence * 0.3 +
      systemState.retrievalEfficiency * 0.3 +
      systemState.averageMemoryQuality * 0.4
    );

    const layerUtilization = Object.entries(systemState.layers).map(([layer, state]) => ({
      layer: layer as MemoryLayerType,
      utilization: state.utilizationRate,
      health: state.healthIndicators.coherenceScore,
      name: getLayerDisplayName(layer as MemoryLayerType)
    }));

    return {
      totalMemories,
      healthScore,
      layerUtilization,
      systemMetrics: {
        coherence: systemState.systemCoherence,
        efficiency: systemState.retrievalEfficiency,
        quality: systemState.averageMemoryQuality,
        growth: systemState.growthRate,
        optimization: systemState.optimizationScore
      }
    };
  }, [systemState]);

  // 获取当前层级的记忆
  const currentLayerMemories = memorySystem?.[activeLayer] || [];

  const handleRefresh = async () => {
    await refreshMemories();
  };

  const handleOptimization = async () => {
    try {
      await optimizeSystem();
      // 可以显示优化成功的提示
    } catch (error) {
      console.error('系统优化失败:', error);
    }
  };

  if (isLoading && !systemState) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400 animate-pulse" />
          <p className="text-gray-600">正在加载记忆系统...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <Brain className="h-12 w-12 mx-auto mb-4" />
            <p>记忆系统加载失败</p>
            <p className="text-sm mt-2">{error}</p>
            <Button onClick={handleRefresh} className="mt-4">
              重新加载
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 系统概览头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="h-8 w-8 text-blue-500" />
          <div>
            <h1 className="text-2xl font-bold">记忆系统仪表板</h1>
            <p className="text-gray-600">数字员工 #{employeeId} 的认知记忆管理</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">实时同步</span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center space-x-1"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>刷新</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOptimization}
            className="flex items-center space-x-1"
          >
            <Zap className="h-4 w-4" />
            <span>优化</span>
          </Button>
        </div>
      </div>

      {/* 系统健康概览 */}
      {systemOverview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{systemOverview.totalMemories}</div>
              <div className="text-sm text-gray-600">总记忆数</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${getHealthColor(systemOverview.healthScore).split(' ')[0]}`}>
                {(systemOverview.healthScore * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">系统健康度</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {(systemOverview.systemMetrics.efficiency * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">检索效率</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {(systemOverview.systemMetrics.quality * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">记忆质量</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {(systemOverview.systemMetrics.optimization * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600">优化程度</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 层级利用率 */}
      {systemOverview && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">记忆层级状态</h3>
            <div className="space-y-3">
              {systemOverview.layerUtilization.map(({ layer, utilization, health, name }) => {
                const Icon = getLayerIcon(layer);
                return (
                  <div key={layer} className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 w-24">
                      <Icon className={`h-4 w-4 ${getLayerColor(layer)}`} />
                      <span className="text-sm font-medium">{name}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>利用率</span>
                        <span>{(utilization * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={utilization * 100} className="h-2" />
                    </div>
                    <Badge className={`${getHealthColor(health)} text-xs`}>
                      健康度 {(health * 100).toFixed(0)}%
                    </Badge>
                    <Button
                      variant={activeLayer === layer ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => setActiveLayer(layer)}
                    >
                      查看
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 主要控制区域 */}
      <div className="flex items-center justify-between">
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
          <TabsList>
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="detailed">详细</TabsTrigger>
            <TabsTrigger value="flow">记忆流</TabsTrigger>
            <TabsTrigger value="analysis">分析</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="搜索记忆..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-64"
            />
          </div>
          <Button variant="secondary" size="sm">
            <Filter className="h-4 w-4 mr-1" />
            筛选
          </Button>
          <Button variant="secondary" size="sm">
            <Download className="h-4 w-4 mr-1" />
            导出
          </Button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="min-h-[600px]">
        {viewMode === 'overview' && (
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-4">记忆分布概览</h4>
                  <div className="space-y-3">
                    {Object.entries(layerStates || {}).map(([layer, state]) => {
                      const Icon = getLayerIcon(layer as MemoryLayerType);
                      return (
                        <div key={layer} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Icon className={`h-5 w-5 ${getLayerColor(layer as MemoryLayerType)}`} />
                            <span className="font-medium">{getLayerDisplayName(layer as MemoryLayerType)}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{state.totalMemories}</div>
                            <div className="text-xs text-gray-500">记忆数</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">系统性能指标</h4>
                  <div className="space-y-3">
                    {systemOverview && Object.entries(systemOverview.systemMetrics).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm">{key}</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={value * 100} className="w-24 h-2" />
                          <span className="text-sm font-medium">{(value * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {viewMode === 'detailed' && (
          <div className="space-y-6">
            {/* 层级选择器 */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">选择记忆层级:</span>
              {(['working', 'episodic', 'semantic', 'procedural', 'emotional'] as MemoryLayerType[]).map((layer) => {
                const Icon = getLayerIcon(layer);
                return (
                  <Button
                    key={layer}
                    variant={activeLayer === layer ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setActiveLayer(layer)}
                    className="flex items-center space-x-1"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{getLayerDisplayName(layer)}</span>
                    <Badge variant="secondary" className="ml-1">
                      {layerStates?.[layer]?.totalMemories || 0}
                    </Badge>
                  </Button>
                );
              })}
            </div>

            {/* 当前层级详细视图 */}
            {activeLayer === 'working' && (
              <WorkingMemory
                employeeId={employeeId}
                memories={currentLayerMemories}
                layerState={layerStates?.working!}
                onMemorySelect={onMemorySelect}
                onMemoryTransfer={onMemoryTransfer}
                onRefresh={handleRefresh}
              />
            )}

            {activeLayer === 'episodic' && (
              <EpisodicMemory
                employeeId={employeeId}
                memories={currentLayerMemories}
                layerState={layerStates?.episodic!}
                onMemorySelect={onMemorySelect}
                onMemoryTransfer={onMemoryTransfer}
              />
            )}

            {activeLayer === 'semantic' && (
              <SemanticMemory
                employeeId={employeeId}
                memories={currentLayerMemories}
                layerState={layerStates?.semantic!}
                onMemorySelect={onMemorySelect}
                onMemoryTransfer={onMemoryTransfer}
                onConceptExplore={onConceptExplore}
              />
            )}

            {activeLayer === 'procedural' && (
              <ProceduralMemory
                employeeId={employeeId}
                memories={currentLayerMemories}
                layerState={layerStates?.procedural!}
                onMemorySelect={onMemorySelect}
                onSkillExecute={onSkillExecute}
              />
            )}

            {activeLayer === 'emotional' && (
              <EmotionalMemory
                employeeId={employeeId}
                memories={currentLayerMemories}
                layerState={layerStates?.emotional!}
                onMemorySelect={onMemorySelect}
                onEmotionalInsightView={onEmotionalInsightView}
              />
            )}
          </div>
        )}

        {viewMode === 'flow' && (
          <MemoryFlow
            employeeId={employeeId}
            memorySystem={memorySystem}
            onMemorySelect={onMemorySelect}
            onLayerTransition={(fromLayer, toLayer) => {
              console.log(`记忆流转: ${fromLayer} -> ${toLayer}`);
            }}
          />
        )}

        {viewMode === 'analysis' && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">智能分析功能</h3>
                <p className="text-gray-600 mb-6">
                  深度分析记忆模式、学习趋势和优化建议
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <Button variant="secondary" className="p-4 h-auto flex-col">
                    <TrendingUp className="h-8 w-8 mb-2" />
                    <span className="font-medium">学习趋势</span>
                    <span className="text-sm text-gray-500">分析记忆形成和演化模式</span>
                  </Button>
                  <Button variant="secondary" className="p-4 h-auto flex-col">
                    <Layers className="h-8 w-8 mb-2" />
                    <span className="font-medium">层级健康</span>
                    <span className="text-sm text-gray-500">评估各层记忆质量和连贯性</span>
                  </Button>
                  <Button variant="secondary" className="p-4 h-auto flex-col">
                    <Zap className="h-8 w-8 mb-2" />
                    <span className="font-medium">优化建议</span>
                    <span className="text-sm text-gray-500">生成个性化优化策略</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};