import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  GitBranch,
  History,
  GitCompare,
  Save,
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  FileText,
  TrendingUp,
  Lightbulb,
  RefreshCw,
  ArrowRight,
  Eye,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DigitalEmployee } from '@/types/employee';

interface ConfigVersion {
  id: string;
  version: string;
  timestamp: Date;
  author: string;
  description: string;
  type: 'manual' | 'auto' | 'milestone';
  status: 'active' | 'archived' | 'draft';
  changes: Array<{
    field: string;
    category: string;
    oldValue: any;
    newValue: any;
    impact: 'low' | 'medium' | 'high';
  }>;
  metrics: {
    performanceScore: number;
    userSatisfaction: number;
    knowledgeAccuracy: number;
    responseTime: number;
  };
  tags: string[];
  size: number; // KB
}

interface SmartSuggestion {
  id: string;
  type: 'optimization' | 'enhancement' | 'fix' | 'update';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  category: 'persona' | 'knowledge' | 'performance' | 'security';
  impact: string;
  effort: 'low' | 'medium' | 'high';
  confidence: number;
  recommendation: {
    action: string;
    expectedImprovement: string;
    risks: string[];
    prerequisites: string[];
  };
  relatedFields: string[];
  evidence: Array<{
    type: 'metric' | 'feedback' | 'analysis' | 'benchmark';
    source: string;
    value: any;
  }>;
}

interface ConfigVersionManagerProps {
  employee: DigitalEmployee;
  onVersionRestore?: (version: ConfigVersion) => void;
  onSuggestionApply?: (suggestion: SmartSuggestion) => void;
}

const VERSION_TYPE_CONFIG = {
  manual: { label: '手动保存', icon: Save, color: 'bg-blue-100 text-blue-800' },
  auto: { label: '自动备份', icon: RefreshCw, color: 'bg-green-100 text-green-800' },
  milestone: { label: '里程碑', icon: CheckCircle, color: 'bg-purple-100 text-purple-800' }
};

const SUGGESTION_TYPE_CONFIG = {
  optimization: { label: '性能优化', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
  enhancement: { label: '功能增强', icon: Lightbulb, color: 'text-blue-600', bg: 'bg-blue-50' },
  fix: { label: '问题修复', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
  update: { label: '内容更新', icon: RefreshCw, color: 'text-purple-600', bg: 'bg-purple-50' }
};

const PRIORITY_CONFIG = {
  low: { label: '低', color: 'bg-gray-100 text-gray-600' },
  medium: { label: '中', color: 'bg-blue-100 text-blue-600' },
  high: { label: '高', color: 'bg-orange-100 text-orange-600' },
  critical: { label: '紧急', color: 'bg-red-100 text-red-600' }
};

export const ConfigVersionManager: React.FC<ConfigVersionManagerProps> = ({
  employee,
  onVersionRestore,
  onSuggestionApply
}) => {
  const [activeTab, setActiveTab] = useState<'versions' | 'suggestions' | 'compare'>('versions');
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [showVersionDetails, setShowVersionDetails] = useState<string | null>(null);

  // 模拟版本历史数据
  const mockVersions: ConfigVersion[] = [
    {
      id: 'v1.2.3',
      version: 'v1.2.3',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      author: '系统管理员',
      description: '优化人设配置，提升对话质量',
      type: 'manual',
      status: 'active',
      changes: [
        {
          field: 'persona.personality',
          category: '人设配置',
          oldValue: '友善、专业',
          newValue: '友善、专业、耐心',
          impact: 'medium'
        },
        {
          field: 'prompt.temperature',
          category: 'Prompt配置',
          oldValue: 0.7,
          newValue: 0.8,
          impact: 'low'
        }
      ],
      metrics: {
        performanceScore: 88.5,
        userSatisfaction: 4.3,
        knowledgeAccuracy: 92.1,
        responseTime: 1.2
      },
      tags: ['人设优化', '对话质量'],
      size: 156.7
    },
    {
      id: 'v1.2.2',
      version: 'v1.2.2',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      author: '自动系统',
      description: '每日自动备份',
      type: 'auto',
      status: 'archived',
      changes: [
        {
          field: 'knowledgeBase.documents',
          category: '知识库',
          oldValue: '127个文档',
          newValue: '132个文档',
          impact: 'low'
        }
      ],
      metrics: {
        performanceScore: 85.2,
        userSatisfaction: 4.1,
        knowledgeAccuracy: 89.8,
        responseTime: 1.4
      },
      tags: ['自动备份'],
      size: 148.3
    },
    {
      id: 'v1.2.1',
      version: 'v1.2.1',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      author: '产品经理',
      description: '重大功能更新里程碑',
      type: 'milestone',
      status: 'archived',
      changes: [
        {
          field: 'capabilities.tools',
          category: '工具管理',
          oldValue: '8个工具',
          newValue: '12个工具',
          impact: 'high'
        },
        {
          field: 'mentor.enabled',
          category: '导师机制',
          oldValue: false,
          newValue: true,
          impact: 'high'
        }
      ],
      metrics: {
        performanceScore: 82.8,
        userSatisfaction: 3.9,
        knowledgeAccuracy: 87.5,
        responseTime: 1.6
      },
      tags: ['里程碑', '功能更新'],
      size: 134.9
    }
  ];

  // 模拟智能建议数据
  const mockSuggestions: SmartSuggestion[] = [
    {
      id: 'sugg-1',
      type: 'optimization',
      priority: 'high',
      title: '优化响应时间',
      description: '检测到平均响应时间较慢，建议优化Prompt长度和知识检索策略',
      category: 'performance',
      impact: '预计可提升25%响应速度',
      effort: 'medium',
      confidence: 0.85,
      recommendation: {
        action: '精简系统Prompt，优化知识向量检索算法',
        expectedImprovement: '响应时间从1.2s降至0.9s，用户体验显著提升',
        risks: ['可能影响回答的完整性', '需要重新测试准确性'],
        prerequisites: ['备份当前配置', '准备测试数据集']
      },
      relatedFields: ['prompt.systemPrompt', 'knowledgeBase.retrievalStrategy'],
      evidence: [
        { type: 'metric', source: '性能监控', value: { avgResponseTime: 1.2, targetTime: 0.9 } },
        { type: 'feedback', source: '用户反馈', value: '响应速度有待改善' }
      ]
    },
    {
      id: 'sugg-2',
      type: 'enhancement',
      priority: 'medium',
      title: '增强多语言支持',
      description: '用户反馈显示对多语言支持的需求增加，建议添加语言检测和切换功能',
      category: 'persona',
      impact: '覆盖更广用户群体，预计满意度提升15%',
      effort: 'high',
      confidence: 0.72,
      recommendation: {
        action: '添加语言检测机制，配置多语言人设模板',
        expectedImprovement: '支持中英日韩4种语言，覆盖95%用户需求',
        risks: ['增加配置复杂度', '需要更多存储空间'],
        prerequisites: ['多语言训练数据', '语言检测服务']
      },
      relatedFields: ['persona.language', 'capabilities.multiLanguage'],
      evidence: [
        { type: 'feedback', source: '用户调研', value: '68%用户有多语言需求' },
        { type: 'analysis', source: '使用统计', value: '英文询问占比23%' }
      ]
    },
    {
      id: 'sugg-3',
      type: 'fix',
      priority: 'critical',
      title: '修复知识准确性问题',
      description: '检测到部分领域知识准确率下降，可能存在过期信息',
      category: 'knowledge',
      impact: '提升知识准确率至95%以上',
      effort: 'low',
      confidence: 0.91,
      recommendation: {
        action: '更新过期知识条目，增强事实核查机制',
        expectedImprovement: '知识准确率从92.1%提升至96.5%',
        risks: ['临时影响部分回答', '需要人工验证'],
        prerequisites: ['获取最新数据源', '设置验证流程']
      },
      relatedFields: ['knowledgeBase.documents', 'knowledgeBase.validationRules'],
      evidence: [
        { type: 'metric', source: '准确性评估', value: { currentRate: 92.1, targetRate: 96.5 } },
        { type: 'analysis', source: '错误分析', value: '技术信息过期占比45%' }
      ]
    }
  ];

  const VersionCard = ({ version }: { version: ConfigVersion }) => {
    const config = VERSION_TYPE_CONFIG[version.type];
    const IconComponent = config.icon;

    return (
      <Card
        className={cn(
          "cursor-pointer hover:shadow-md transition-all",
          version.status === 'active' && "ring-2 ring-blue-500",
          selectedVersions.includes(version.id) && "ring-2 ring-purple-500"
        )}
        onClick={() => {
          if (selectedVersions.includes(version.id)) {
            setSelectedVersions(selectedVersions.filter(id => id !== version.id));
          } else if (selectedVersions.length < 2) {
            setSelectedVersions([...selectedVersions, version.id]);
          }
        }}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <IconComponent className="w-4 h-4" />
              <span className="font-semibold">{version.version}</span>
              {version.status === 'active' && (
                <Badge variant="default" className="text-xs">当前版本</Badge>
              )}
              <Badge className={cn("text-xs", config.color)}>
                {config.label}
              </Badge>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowVersionDetails(showVersionDetails === version.id ? null : version.id);
                }}
              >
                <Eye className="w-4 h-4" />
              </Button>
              {version.status !== 'active' && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onVersionRestore?.(version);
                  }}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600">{version.description}</p>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center">
                <User className="w-3 h-3 mr-1" />
                {version.author}
              </span>
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {version.timestamp.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex space-x-2">
                {version.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <span className="text-gray-500">{version.size} KB</span>
            </div>

            {/* 指标预览 */}
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="text-sm font-medium text-gray-900">
                  {version.metrics.performanceScore}
                </div>
                <div className="text-xs text-gray-500">性能分数</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="text-sm font-medium text-gray-900">
                  {version.metrics.userSatisfaction.toFixed(1)}
                </div>
                <div className="text-xs text-gray-500">用户满意度</div>
              </div>
            </div>
          </div>

          {/* 详细信息展开 */}
          {showVersionDetails === version.id && (
            <div className="mt-4 pt-4 border-t space-y-3">
              <div>
                <h5 className="text-sm font-medium mb-2">变更记录</h5>
                {version.changes.map((change, index) => (
                  <div key={index} className="text-xs bg-gray-50 p-2 rounded mb-1">
                    <div className="font-medium">{change.category} - {change.field}</div>
                    <div className="text-gray-600 mt-1">
                      <span className="text-red-600">- {String(change.oldValue)}</span>
                      <br />
                      <span className="text-green-600">+ {String(change.newValue)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <h5 className="text-sm font-medium mb-2">性能指标</h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>准确率: {version.metrics.knowledgeAccuracy}%</div>
                  <div>响应时间: {version.metrics.responseTime}s</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const SuggestionCard = ({ suggestion }: { suggestion: SmartSuggestion }) => {
    const typeConfig = SUGGESTION_TYPE_CONFIG[suggestion.type];
    const priorityConfig = PRIORITY_CONFIG[suggestion.priority];
    const TypeIcon = typeConfig.icon;

    return (
      <Card className="hover:shadow-md transition-all">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className={cn("p-2 rounded-full", typeConfig.bg)}>
                <TypeIcon className={cn("w-4 h-4", typeConfig.color)} />
              </div>
              <div>
                <h4 className="font-semibold">{suggestion.title}</h4>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={priorityConfig.color}>
                    {priorityConfig.label}优先级
                  </Badge>
                  <Badge variant="secondary">
                    {suggestion.category}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    置信度: {(suggestion.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => onSuggestionApply?.(suggestion)}
              className="ml-2"
            >
              应用建议
            </Button>
          </div>

          <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>

          <div className="space-y-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <h5 className="text-sm font-medium text-blue-800 mb-1">预期影响</h5>
              <p className="text-sm text-blue-700">{suggestion.impact}</p>
            </div>

            <div className="bg-green-50 p-3 rounded-lg">
              <h5 className="text-sm font-medium text-green-800 mb-1">推荐行动</h5>
              <p className="text-sm text-green-700">{suggestion.recommendation.action}</p>
              <p className="text-sm text-green-600 mt-1">
                {suggestion.recommendation.expectedImprovement}
              </p>
            </div>

            {suggestion.recommendation.risks.length > 0 && (
              <div className="bg-yellow-50 p-3 rounded-lg">
                <h5 className="text-sm font-medium text-yellow-800 mb-1">潜在风险</h5>
                <ul className="text-sm text-yellow-700 list-disc list-inside">
                  {suggestion.recommendation.risks.map((risk, index) => (
                    <li key={index}>{risk}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>工作量: {suggestion.effort === 'low' ? '低' : suggestion.effort === 'medium' ? '中' : '高'}</span>
              <div className="flex items-center space-x-2">
                {suggestion.evidence.map((evidence, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {evidence.type === 'metric' ? '指标' :
                     evidence.type === 'feedback' ? '反馈' :
                     evidence.type === 'analysis' ? '分析' : '基准'}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ComparisonView = () => {
    if (selectedVersions.length !== 2) {
      return (
        <div className="text-center py-12 text-gray-500">
          <GitCompare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>请选择两个版本进行比较</p>
          <p className="text-sm">在版本列表中点击版本卡片进行选择</p>
        </div>
      );
    }

    const version1 = mockVersions.find(v => v.id === selectedVersions[0])!;
    const version2 = mockVersions.find(v => v.id === selectedVersions[1])!;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">版本对比</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>{version1.version}</span>
            <ArrowRight className="w-4 h-4" />
            <span>{version2.version}</span>
          </div>
        </div>

        {/* 基本信息对比 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">基本信息对比</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">{version1.version}</h4>
                <div className="space-y-2 text-sm">
                  <div>作者: {version1.author}</div>
                  <div>时间: {version1.timestamp.toLocaleString()}</div>
                  <div>描述: {version1.description}</div>
                  <div>大小: {version1.size} KB</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">{version2.version}</h4>
                <div className="space-y-2 text-sm">
                  <div>作者: {version2.author}</div>
                  <div>时间: {version2.timestamp.toLocaleString()}</div>
                  <div>描述: {version2.description}</div>
                  <div>大小: {version2.size} KB</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 性能指标对比 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">性能指标对比</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(version1.metrics).map(([key, value1]) => {
                const value2 = version2.metrics[key as keyof typeof version2.metrics];
                const diff = typeof value1 === 'number' && typeof value2 === 'number' ?
                  value2 - value1 : 0;

                return (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">
                      {key === 'performanceScore' ? '性能分数' :
                       key === 'userSatisfaction' ? '用户满意度' :
                       key === 'knowledgeAccuracy' ? '知识准确率' :
                       key === 'responseTime' ? '响应时间(s)' : key}
                    </span>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm">{value1}</span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">{value2}</span>
                      {diff !== 0 && (
                        <span className={cn(
                          "text-xs px-2 py-1 rounded",
                          diff > 0 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                        )}>
                          {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <GitBranch className="w-5 h-5 mr-2" />
            配置版本管理与智能建议
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="versions">版本历史</TabsTrigger>
              <TabsTrigger value="suggestions">智能建议</TabsTrigger>
              <TabsTrigger value="compare">版本对比</TabsTrigger>
            </TabsList>

            <TabsContent value="versions" className="mt-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <History className="w-5 h-5 text-gray-500" />
                  <span className="font-medium">配置版本历史</span>
                  <Badge variant="secondary">{mockVersions.length} 个版本</Badge>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="secondary">
                    <Download className="w-4 h-4 mr-1" />
                    导出版本
                  </Button>
                  <Button size="sm" variant="secondary">
                    <Upload className="w-4 h-4 mr-1" />
                    导入版本
                  </Button>
                  <Button size="sm">
                    <Save className="w-4 h-4 mr-1" />
                    创建版本
                  </Button>
                </div>
              </div>

              {selectedVersions.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                  <span className="text-sm text-blue-700">
                    已选择 {selectedVersions.length} 个版本
                    {selectedVersions.length === 2 && " - 可进行对比"}
                  </span>
                  <div className="flex space-x-2">
                    {selectedVersions.length === 2 && (
                      <Button size="sm" variant="secondary" onClick={() => setActiveTab('compare')}>
                        <GitCompare className="w-4 h-4 mr-1" />
                        对比版本
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => setSelectedVersions([])}>
                      清除选择
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {mockVersions.map(version => (
                  <VersionCard key={version.id} version={version} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="suggestions" className="mt-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium">智能优化建议</span>
                  <Badge variant="secondary">{mockSuggestions.length} 条建议</Badge>
                </div>
                <Button size="sm">
                  <RefreshCw className="w-4 h-4 mr-1" />
                  刷新建议
                </Button>
              </div>

              <div className="space-y-4">
                {mockSuggestions.map(suggestion => (
                  <SuggestionCard key={suggestion.id} suggestion={suggestion} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="compare" className="mt-6">
              <ComparisonView />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};