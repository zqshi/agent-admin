/**
 * 程序性记忆管理组件
 * 管理技能操作流程、API调用模式、自动化程序和肌肉记忆
 */

import React, { useState, useMemo } from 'react';
import {
  Settings,
  Play,
  Pause,
  Code,
  Workflow,
  Zap,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  RotateCcw,
  Activity
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/progress';
import { EnhancedMemoryEntry, MemoryLayerState } from '../../types';

interface ProceduralMemoryProps {
  employeeId: string;
  memories: EnhancedMemoryEntry[];
  layerState: MemoryLayerState;
  onMemorySelect?: (memory: EnhancedMemoryEntry) => void;
  onSkillExecute?: (skillId: string) => void;
  onSkillOptimize?: (skillId: string) => void;
}

interface Skill {
  id: string;
  name: string;
  type: 'api_call' | 'workflow' | 'automation' | 'algorithm' | 'interaction';
  steps: SkillStep[];
  proficiency: number; // 熟练度 [0, 1]
  executionCount: number;
  successRate: number;
  averageExecutionTime: number;
  lastExecuted?: Date;
  complexity: 'simple' | 'medium' | 'complex';
  dependencies: string[];
  relatedMemories: string[];
  optimization: {
    level: number;
    suggestions: string[];
    lastOptimized?: Date;
  };
}

interface SkillStep {
  id: string;
  name: string;
  type: 'action' | 'decision' | 'input' | 'output' | 'validation';
  description: string;
  parameters?: Record<string, any>;
  successRate: number;
  executionTime: number;
}

export const ProceduralMemory: React.FC<ProceduralMemoryProps> = ({
  employeeId,
  memories,
  layerState,
  onMemorySelect,
  onSkillExecute,
  onSkillOptimize
}) => {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [viewMode, setViewMode] = useState<'skills' | 'workflows' | 'performance'>('skills');
  const [filterType, setFilterType] = useState<'all' | 'api_call' | 'workflow' | 'automation' | 'algorithm' | 'interaction'>('all');
  const [sortBy, setSortBy] = useState<'proficiency' | 'usage' | 'recent' | 'success_rate'>('proficiency');

  // 从记忆中提取技能
  const skills = useMemo(() => {
    return memories.map(memory => extractSkillFromMemory(memory)).filter(Boolean) as Skill[];
  }, [memories]);

  // 过滤和排序技能
  const filteredSkills = useMemo(() => {
    let filtered = skills;

    if (filterType !== 'all') {
      filtered = filtered.filter(skill => skill.type === filterType);
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'proficiency':
          return b.proficiency - a.proficiency;
        case 'usage':
          return b.executionCount - a.executionCount;
        case 'recent':
          const aTime = a.lastExecuted?.getTime() || 0;
          const bTime = b.lastExecuted?.getTime() || 0;
          return bTime - aTime;
        case 'success_rate':
          return b.successRate - a.successRate;
        default:
          return 0;
      }
    });
  }, [skills, filterType, sortBy]);

  // 统计信息
  const stats = useMemo(() => {
    const totalSkills = skills.length;
    const expertSkills = skills.filter(s => s.proficiency > 0.8).length;
    const automatedSkills = skills.filter(s => s.type === 'automation').length;
    const avgProficiency = totalSkills > 0
      ? skills.reduce((sum, s) => sum + s.proficiency, 0) / totalSkills
      : 0;
    const avgSuccessRate = totalSkills > 0
      ? skills.reduce((sum, s) => sum + s.successRate, 0) / totalSkills
      : 0;

    const typeDistribution = skills.reduce((acc, skill) => {
      acc[skill.type] = (acc[skill.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: totalSkills,
      expert: expertSkills,
      automated: automatedSkills,
      avgProficiency,
      avgSuccessRate,
      typeDistribution
    };
  }, [skills]);

  const getSkillTypeIcon = (type: string) => {
    switch (type) {
      case 'api_call': return <Code className="h-4 w-4" />;
      case 'workflow': return <Workflow className="h-4 w-4" />;
      case 'automation': return <Zap className="h-4 w-4" />;
      case 'algorithm': return <Settings className="h-4 w-4" />;
      case 'interaction': return <Activity className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getSkillTypeColor = (type: string) => {
    switch (type) {
      case 'api_call': return 'bg-blue-100 text-blue-800';
      case 'workflow': return 'bg-purple-100 text-purple-800';
      case 'automation': return 'bg-green-100 text-green-800';
      case 'algorithm': return 'bg-orange-100 text-orange-800';
      case 'interaction': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'complex': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProficiencyLevel = (proficiency: number) => {
    if (proficiency > 0.9) return { level: '专家', color: 'text-green-600' };
    if (proficiency > 0.7) return { level: '熟练', color: 'text-blue-600' };
    if (proficiency > 0.5) return { level: '中等', color: 'text-yellow-600' };
    if (proficiency > 0.3) return { level: '初级', color: 'text-orange-600' };
    return { level: '新手', color: 'text-red-600' };
  };

  return (
    <div className="space-y-6">
      {/* 程序性记忆概览 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-orange-500" />
              <h3 className="text-lg font-semibold">程序性记忆</h3>
              <Badge variant="secondary">{stats.total}个技能</Badge>
            </div>
          </div>

          {/* 统计指标 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.total}</div>
              <div className="text-sm text-gray-600">技能总数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.expert}</div>
              <div className="text-sm text-gray-600">专家级技能</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.automated}</div>
              <div className="text-sm text-gray-600">自动化程序</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{(stats.avgProficiency * 100).toFixed(0)}%</div>
              <div className="text-sm text-gray-600">平均熟练度</div>
            </div>
          </div>

          {/* 整体成功率 */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>整体成功率</span>
              <span>{(stats.avgSuccessRate * 100).toFixed(1)}%</span>
            </div>
            <Progress
              value={stats.avgSuccessRate * 100}
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* 控制面板 */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'skills' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('skills')}
          >
            技能列表
          </Button>
          <Button
            variant={viewMode === 'workflows' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('workflows')}
          >
            工作流程
          </Button>
          <Button
            variant={viewMode === 'performance' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('performance')}
          >
            性能分析
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="all">所有类型</option>
            <option value="api_call">API调用</option>
            <option value="workflow">工作流程</option>
            <option value="automation">自动化</option>
            <option value="algorithm">算法</option>
            <option value="interaction">交互</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="proficiency">按熟练度</option>
            <option value="usage">按使用频率</option>
            <option value="recent">按最近使用</option>
            <option value="success_rate">按成功率</option>
          </select>
        </div>
      </div>

      {/* 技能列表视图 */}
      {viewMode === 'skills' && (
        <div className="space-y-4">
          {filteredSkills.map((skill) => {
            const proficiencyInfo = getProficiencyLevel(skill.proficiency);
            return (
              <Card
                key={skill.id}
                className={`cursor-pointer hover:shadow-md transition-shadow ${
                  selectedSkill?.id === skill.id ? 'ring-2 ring-orange-500' : ''
                }`}
                onClick={() => setSelectedSkill(skill)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getSkillTypeColor(skill.type)}>
                          {getSkillTypeIcon(skill.type)}
                          <span className="ml-1">{skill.type}</span>
                        </Badge>
                        <Badge className={getComplexityColor(skill.complexity)}>
                          {skill.complexity}
                        </Badge>
                        <Badge className={proficiencyInfo.color}>
                          {proficiencyInfo.level}
                        </Badge>
                      </div>

                      <h4 className="font-semibold text-lg mb-2">{skill.name}</h4>

                      {/* 技能指标 */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                        <div>
                          <div className="text-gray-600">熟练度</div>
                          <div className="font-medium">{(skill.proficiency * 100).toFixed(0)}%</div>
                          <Progress value={skill.proficiency * 100} className="h-1 mt-1" />
                        </div>
                        <div>
                          <div className="text-gray-600">成功率</div>
                          <div className="font-medium">{(skill.successRate * 100).toFixed(0)}%</div>
                          <Progress value={skill.successRate * 100} className="h-1 mt-1" />
                        </div>
                        <div>
                          <div className="text-gray-600">执行次数</div>
                          <div className="font-medium">{skill.executionCount}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">平均耗时</div>
                          <div className="font-medium">{skill.averageExecutionTime}ms</div>
                        </div>
                      </div>

                      {/* 技能步骤预览 */}
                      <div className="mb-3">
                        <div className="text-sm font-medium mb-1">步骤概览 ({skill.steps.length})</div>
                        <div className="flex flex-wrap gap-1">
                          {skill.steps.slice(0, 5).map((step) => (
                            <Badge key={step.id} variant="outline" className="text-xs">
                              {step.name}
                            </Badge>
                          ))}
                          {skill.steps.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{skill.steps.length - 5}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* 优化建议 */}
                      {skill.optimization.suggestions.length > 0 && (
                        <div className="text-xs text-amber-600 bg-amber-50 rounded p-2">
                          <div className="font-medium">优化建议:</div>
                          <div>{skill.optimization.suggestions[0]}</div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end space-y-2 ml-4">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSkillExecute?.(skill.id);
                        }}
                        className="flex items-center space-x-1"
                      >
                        <Play className="h-3 w-3" />
                        <span>执行</span>
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSkillOptimize?.(skill.id);
                        }}
                        className="flex items-center space-x-1"
                      >
                        <TrendingUp className="h-3 w-3" />
                        <span>优化</span>
                      </Button>
                      {skill.lastExecuted && (
                        <div className="text-xs text-gray-500">
                          最后执行: {skill.lastExecuted.toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredSkills.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">暂无匹配的技能</p>
                <p className="text-sm text-gray-400 mt-1">
                  技能会在执行任务和交互过程中自动形成
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* 工作流程视图 */}
      {viewMode === 'workflows' && selectedSkill && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-lg">{selectedSkill.name} - 执行流程</h4>
              <div className="flex items-center space-x-2">
                <Badge className={getComplexityColor(selectedSkill.complexity)}>
                  {selectedSkill.complexity}
                </Badge>
                <Badge variant="secondary">
                  {selectedSkill.steps.length} 步骤
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              {selectedSkill.steps.map((step, index) => (
                <div key={step.id} className="flex items-start space-x-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step.successRate > 0.8 ? 'bg-green-500 text-white' :
                      step.successRate > 0.6 ? 'bg-yellow-500 text-white' :
                      'bg-red-500 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    {index < selectedSkill.steps.length - 1 && (
                      <div className="w-px h-12 bg-gray-200 mt-2"></div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h5 className="font-medium">{step.name}</h5>
                      <Badge variant="outline" className="text-xs">
                        {step.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{step.description}</p>

                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="h-3 w-3" />
                        <span>成功率 {(step.successRate * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{step.executionTime}ms</span>
                      </div>
                    </div>

                    {step.parameters && Object.keys(step.parameters).length > 0 && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        <div className="font-medium mb-1">参数:</div>
                        {Object.entries(step.parameters).slice(0, 3).map(([key, value]) => (
                          <div key={key} className="text-gray-600">
                            {key}: {String(value)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 性能分析视图 */}
      {viewMode === 'performance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h4 className="font-semibold mb-4">技能类型分布</h4>
              <div className="space-y-3">
                {Object.entries(stats.typeDistribution).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getSkillTypeIcon(type)}
                      <span className="text-sm">{type}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20">
                        <Progress value={(count / stats.total) * 100} className="h-2" />
                      </div>
                      <span className="text-sm font-medium w-8">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h4 className="font-semibold mb-4">熟练度分布</h4>
              <div className="space-y-3">
                {[
                  { label: '专家级 (>90%)', range: [0.9, 1], color: 'bg-green-500' },
                  { label: '熟练 (70-90%)', range: [0.7, 0.9], color: 'bg-blue-500' },
                  { label: '中等 (50-70%)', range: [0.5, 0.7], color: 'bg-yellow-500' },
                  { label: '初级 (<50%)', range: [0, 0.5], color: 'bg-red-500' }
                ].map(({ label, range, color }) => {
                  const count = skills.filter(s =>
                    s.proficiency >= range[0] && s.proficiency < range[1]
                  ).length;
                  return (
                    <div key={label} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${color}`}></div>
                        <span className="text-sm">{label}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-20">
                          <Progress value={(count / stats.total) * 100} className="h-2" />
                        </div>
                        <span className="text-sm font-medium w-8">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// === 辅助函数 ===

function extractSkillFromMemory(memory: EnhancedMemoryEntry): Skill | null {
  // 简化的技能提取逻辑
  if (!memory.content.includes('执行') && !memory.content.includes('操作') && !memory.content.includes('调用')) {
    return null;
  }

  const steps: SkillStep[] = [
    {
      id: `step_${memory.id}_1`,
      name: '准备参数',
      type: 'input',
      description: '准备执行所需的参数和上下文',
      executionTime: 50 + Math.random() * 50,
      successRate: 0.9 + Math.random() * 0.1
    },
    {
      id: `step_${memory.id}_2`,
      name: '执行操作',
      type: 'action',
      description: memory.content.substring(0, 50) + '...',
      executionTime: 100 + Math.random() * 200,
      successRate: 0.8 + Math.random() * 0.2
    },
    {
      id: `step_${memory.id}_3`,
      name: '验证结果',
      type: 'validation',
      description: '验证执行结果是否符合预期',
      executionTime: 30 + Math.random() * 30,
      successRate: 0.85 + Math.random() * 0.15
    }
  ];

  return {
    id: `skill_${memory.id}`,
    name: memory.content.split(' ').slice(0, 4).join(' '),
    type: memory.source === 'conversation' ? 'interaction' : 'workflow',
    steps,
    proficiency: memory.confidence,
    executionCount: memory.accessCount,
    successRate: 0.7 + Math.random() * 0.3,
    averageExecutionTime: steps.reduce((sum, step) => sum + step.executionTime, 0),
    lastExecuted: memory.lastAccessedAt,
    complexity: memory.content.length > 200 ? 'complex' :
                 memory.content.length > 100 ? 'medium' : 'simple',
    dependencies: [],
    relatedMemories: [memory.id],
    optimization: {
      level: Math.floor(Math.random() * 5),
      suggestions: memory.importance < 0.7 ? ['提高执行效率', '优化参数传递'] : [],
      lastOptimized: undefined
    }
  };
}