/**
 * 记忆流转可视化组件
 * 展示记忆在五层架构间的动态流转和转换过程
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Brain,
  Activity,
  Database,
  Settings,
  Heart,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  Shuffle,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Filter
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/progress';
import { EnhancedMemoryEntry, MemoryLayerType } from '../../types';

interface MemoryFlowProps {
  employeeId: string;
  memorySystem?: Record<MemoryLayerType, EnhancedMemoryEntry[]>;
  onMemorySelect?: (memory: EnhancedMemoryEntry) => void;
  onLayerTransition?: (fromLayer: MemoryLayerType, toLayer: MemoryLayerType) => void;
}

interface FlowTransition {
  id: string;
  memoryId: string;
  fromLayer: MemoryLayerType;
  toLayer: MemoryLayerType;
  timestamp: Date;
  status: 'pending' | 'active' | 'completed' | 'failed';
  progress: number;
  reason: string;
}

interface LayerNode {
  layer: MemoryLayerType;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  position: { x: number; y: number };
  memoryCount: number;
  incomingFlow: number;
  outgoingFlow: number;
}

export const MemoryFlow: React.FC<MemoryFlowProps> = ({
  employeeId,
  memorySystem = {},
  onMemorySelect,
  onLayerTransition
}) => {
  const [activeTransitions, setActiveTransitions] = useState<FlowTransition[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedTransition, setSelectedTransition] = useState<FlowTransition | null>(null);
  const [viewMode, setViewMode] = useState<'realtime' | 'history' | 'prediction'>('realtime');
  const [animationSpeed, setAnimationSpeed] = useState(1);

  // 定义层级节点配置
  const layerNodes: LayerNode[] = useMemo(() => [
    {
      layer: 'working',
      name: '工作记忆',
      icon: Brain,
      color: 'bg-blue-500',
      position: { x: 200, y: 100 },
      memoryCount: memorySystem.working?.length || 0,
      incomingFlow: 0,
      outgoingFlow: 0
    },
    {
      layer: 'episodic',
      name: '情景记忆',
      icon: Activity,
      color: 'bg-purple-500',
      position: { x: 400, y: 200 },
      memoryCount: memorySystem.episodic?.length || 0,
      incomingFlow: 0,
      outgoingFlow: 0
    },
    {
      layer: 'semantic',
      name: '语义记忆',
      icon: Database,
      color: 'bg-green-500',
      position: { x: 200, y: 300 },
      memoryCount: memorySystem.semantic?.length || 0,
      incomingFlow: 0,
      outgoingFlow: 0
    },
    {
      layer: 'procedural',
      name: '程序记忆',
      icon: Settings,
      color: 'bg-orange-500',
      position: { x: 50, y: 200 },
      memoryCount: memorySystem.procedural?.length || 0,
      incomingFlow: 0,
      outgoingFlow: 0
    },
    {
      layer: 'emotional',
      name: '情感记忆',
      icon: Heart,
      color: 'bg-pink-500',
      position: { x: 300, y: 50 },
      memoryCount: memorySystem.emotional?.length || 0,
      incomingFlow: 0,
      outgoingFlow: 0
    }
  ], [memorySystem]);

  // 计算流转统计
  const flowStats = useMemo(() => {
    const totalTransitions = activeTransitions.length;
    const completedTransitions = activeTransitions.filter(t => t.status === 'completed').length;
    const activeFlow = activeTransitions.filter(t => t.status === 'active').length;
    const avgTransitionTime = 2500; // 模拟平均转换时间

    return {
      total: totalTransitions,
      completed: completedTransitions,
      active: activeFlow,
      avgTime: avgTransitionTime,
      efficiency: totalTransitions > 0 ? completedTransitions / totalTransitions : 0
    };
  }, [activeTransitions]);

  // 定义常见的转换路径
  const transitionPaths = useMemo(() => [
    { from: 'working', to: 'episodic', reason: '对话结束，形成情景记忆' },
    { from: 'episodic', to: 'semantic', reason: '提取抽象概念和规律' },
    { from: 'semantic', to: 'procedural', reason: '知识转化为操作技能' },
    { from: 'working', to: 'emotional', reason: '情感体验记录' },
    { from: 'procedural', to: 'emotional', reason: '技能执行反馈' }
  ], []);

  // 模拟记忆流转动画
  useEffect(() => {
    if (!isAnimating) return;

    const interval = setInterval(() => {
      // 随机生成新的转换
      if (Math.random() < 0.3) {
        const randomPath = transitionPaths[Math.floor(Math.random() * transitionPaths.length)];
        const newTransition: FlowTransition = {
          id: `transition_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
          memoryId: `memory_${Math.random().toString(36).substring(2, 15)}`,
          fromLayer: randomPath.from as MemoryLayerType,
          toLayer: randomPath.to as MemoryLayerType,
          timestamp: new Date(),
          status: 'pending',
          progress: 0,
          reason: randomPath.reason
        };

        setActiveTransitions(prev => [...prev.slice(-10), newTransition]);
      }

      // 更新现有转换的进度
      setActiveTransitions(prev => prev.map(transition => {
        if (transition.status === 'pending') {
          return { ...transition, status: 'active', progress: 0 };
        } else if (transition.status === 'active') {
          const newProgress = Math.min(transition.progress + (10 * animationSpeed), 100);
          if (newProgress >= 100) {
            onLayerTransition?.(transition.fromLayer, transition.toLayer);
            return { ...transition, status: 'completed', progress: 100 };
          }
          return { ...transition, progress: newProgress };
        }
        return transition;
      }));

      // 清理已完成的转换
      setTimeout(() => {
        setActiveTransitions(prev => prev.filter(t =>
          t.status !== 'completed' || Date.now() - t.timestamp.getTime() < 5000
        ));
      }, 1000);

    }, 100 / animationSpeed);

    return () => clearInterval(interval);
  }, [isAnimating, animationSpeed, transitionPaths, onLayerTransition]);

  // 获取两个节点之间的路径
  const getPathBetweenNodes = (from: LayerNode, to: LayerNode) => {
    const dx = to.position.x - from.position.x;
    const dy = to.position.y - from.position.y;
    const midX = from.position.x + dx / 2;
    const midY = from.position.y + dy / 2;

    // 使用二次贝塞尔曲线
    return `M ${from.position.x} ${from.position.y} Q ${midX} ${midY - 30} ${to.position.x} ${to.position.y}`;
  };

  // 渲染转换动画
  const renderTransitionAnimation = (transition: FlowTransition) => {
    const fromNode = layerNodes.find(n => n.layer === transition.fromLayer);
    const toNode = layerNodes.find(n => n.layer === transition.toLayer);

    if (!fromNode || !toNode) return null;

    const pathLength = Math.sqrt(
      Math.pow(toNode.position.x - fromNode.position.x, 2) +
      Math.pow(toNode.position.y - fromNode.position.y, 2)
    );

    const progress = transition.progress / 100;
    const currentX = fromNode.position.x + (toNode.position.x - fromNode.position.x) * progress;
    const currentY = fromNode.position.y + (toNode.position.y - fromNode.position.y) * progress;

    return (
      <g key={transition.id}>
        {/* 路径 */}
        <path
          d={getPathBetweenNodes(fromNode, toNode)}
          stroke="#3B82F6"
          strokeWidth="2"
          fill="none"
          strokeDasharray="5,5"
          opacity={0.6}
        />

        {/* 移动的记忆点 */}
        <circle
          cx={currentX}
          cy={currentY}
          r="4"
          fill="#3B82F6"
          className="animate-pulse"
        >
          <title>{transition.reason}</title>
        </circle>

        {/* 进度指示 */}
        <path
          d={getPathBetweenNodes(fromNode, toNode)}
          stroke="#3B82F6"
          strokeWidth="3"
          fill="none"
          strokeDasharray={`${pathLength * progress} ${pathLength}`}
          opacity={0.8}
        />
      </g>
    );
  };

  return (
    <div className="space-y-6">
      {/* 控制面板 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant={isAnimating ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setIsAnimating(!isAnimating)}
                  className="flex items-center space-x-1"
                >
                  {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  <span>{isAnimating ? '暂停' : '播放'}</span>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setActiveTransitions([])}
                  className="flex items-center space-x-1"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>清空</span>
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm">动画速度:</span>
                <select
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value={0.5}>慢速</option>
                  <option value={1}>正常</option>
                  <option value={2}>快速</option>
                  <option value={3}>极速</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'realtime' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setViewMode('realtime')}
              >
                实时流转
              </Button>
              <Button
                variant={viewMode === 'history' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setViewMode('history')}
              >
                历史记录
              </Button>
              <Button
                variant={viewMode === 'prediction' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setViewMode('prediction')}
              >
                预测分析
              </Button>
            </div>
          </div>

          {/* 流转统计 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{flowStats.active}</div>
              <div className="text-xs text-gray-600">活跃流转</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{flowStats.completed}</div>
              <div className="text-xs text-gray-600">已完成</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{flowStats.avgTime}ms</div>
              <div className="text-xs text-gray-600">平均耗时</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">{(flowStats.efficiency * 100).toFixed(0)}%</div>
              <div className="text-xs text-gray-600">转换效率</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 主要可视化区域 */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            {/* SVG 流转图 */}
            <svg
              width="500"
              height="400"
              viewBox="0 0 500 400"
              className="border border-gray-200 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50"
            >
              {/* 连接线 */}
              {transitionPaths.map((path, index) => {
                const fromNode = layerNodes.find(n => n.layer === path.from);
                const toNode = layerNodes.find(n => n.layer === path.to);
                if (!fromNode || !toNode) return null;

                return (
                  <path
                    key={`${path.from}-${path.to}`}
                    d={getPathBetweenNodes(fromNode, toNode)}
                    stroke="#E5E7EB"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="3,3"
                  />
                );
              })}

              {/* 动态转换动画 */}
              {activeTransitions
                .filter(t => t.status === 'active')
                .map(renderTransitionAnimation)}

              {/* 层级节点 */}
              {layerNodes.map((node) => {
                const Icon = node.icon;
                return (
                  <g key={node.layer}>
                    {/* 节点圆圈 */}
                    <circle
                      cx={node.position.x}
                      cy={node.position.y}
                      r="30"
                      className={`${node.color} opacity-20`}
                    />
                    <circle
                      cx={node.position.x}
                      cy={node.position.y}
                      r="25"
                      className={node.color}
                    />

                    {/* 节点图标（需要转换为SVG路径或使用foreignObject） */}
                    <foreignObject
                      x={node.position.x - 12}
                      y={node.position.y - 12}
                      width="24"
                      height="24"
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </foreignObject>

                    {/* 节点标签 */}
                    <text
                      x={node.position.x}
                      y={node.position.y + 45}
                      textAnchor="middle"
                      className="text-sm font-medium fill-gray-700"
                    >
                      {node.name}
                    </text>

                    {/* 记忆数量 */}
                    <text
                      x={node.position.x}
                      y={node.position.y + 60}
                      textAnchor="middle"
                      className="text-xs fill-gray-500"
                    >
                      {node.memoryCount} 个记忆
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* 图例 */}
            <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-sm border">
              <div className="text-sm font-medium mb-2">状态说明</div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>活跃转换</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 border-2 border-gray-300 border-dashed rounded-full"></div>
                  <span>可能路径</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 转换详情 */}
      {viewMode === 'realtime' && activeTransitions.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Shuffle className="h-5 w-5 mr-2 text-blue-500" />
              实时转换列表
            </h3>
            <div className="space-y-3">
              {activeTransitions.slice(-5).map((transition) => (
                <div
                  key={transition.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedTransition?.id === transition.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedTransition(transition)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <Badge variant="secondary" className="text-xs">
                          {transition.fromLayer}
                        </Badge>
                        <ArrowRight className="h-3 w-3 text-gray-400" />
                        <Badge variant="secondary" className="text-xs">
                          {transition.toLayer}
                        </Badge>
                      </div>
                      <Badge
                        variant={
                          transition.status === 'completed' ? 'primary' :
                          transition.status === 'active' ? 'secondary' : 'outline'
                        }
                        className="text-xs"
                      >
                        {transition.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      {transition.status === 'active' && (
                        <Progress value={transition.progress} className="w-16 h-1" />
                      )}
                      <span className="text-xs text-gray-500">
                        {transition.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {transition.reason}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 历史记录和预测分析 */}
      {(viewMode === 'history' || viewMode === 'prediction') && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <Zap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">
                {viewMode === 'history' ? '历史转换记录' : '智能预测分析'}
              </h3>
              <p className="text-gray-600">
                {viewMode === 'history'
                  ? '查看过去的记忆转换历史和模式分析'
                  : '基于历史数据预测未来的记忆流转趋势'
                }
              </p>
              <Button className="mt-4">
                {viewMode === 'history' ? '查看详细历史' : '生成预测报告'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};