/**
 * 知识洞察面板组件
 * 展示创新意识和能力缺失的深度分析结果
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Brain,
  Lightbulb,
  AlertCircle,
  TrendingUp,
  Target,
  Zap,
  Clock,
  BarChart3,
  PieChart,
  Network,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Filter,
  Eye,
  Settings,
  Sparkles,
  BookOpen,
  Users,
  Cpu,
  Layers,
  Activity,
  Calendar,
  Star,
  Award,
  Shield,
  Flag
} from 'lucide-react';
import { knowledgeInsightService } from '../../services/KnowledgeInsightService';
import type {
  KnowledgeInsightReport,
  InnovationInsight,
  CapabilityGapAnalysis,
  KnowledgePatternInsight,
  InsightAnalysisState,
  InnovationType,
  CapabilityGapType,
  ConfidenceLevel,
  ImpactLevel,
  UrgencyLevel
} from '../../types/knowledge-insights';
import type { DigitalEmployee } from '../../types/employee';

interface KnowledgeInsightsPanelProps {
  employee: DigitalEmployee;
  onInsightClick?: (insight: InnovationInsight | CapabilityGapAnalysis) => void;
  showAdvancedControls?: boolean;
}

const KnowledgeInsightsPanel: React.FC<KnowledgeInsightsPanelProps> = ({
  employee,
  onInsightClick,
  showAdvancedControls = false
}) => {
  const [report, setReport] = useState<KnowledgeInsightReport | null>(null);
  const [analysisState, setAnalysisState] = useState<InsightAnalysisState>({
    status: 'idle',
    progress: 0,
    currentStage: ''
  });
  const [selectedView, setSelectedView] = useState<'overview' | 'innovation' | 'gaps' | 'patterns' | 'recommendations'>('overview');
  const [selectedFilters, setSelectedFilters] = useState<{
    innovationType?: InnovationType;
    gapType?: CapabilityGapType;
    impactLevel?: ImpactLevel;
    confidenceLevel?: ConfidenceLevel;
  }>({});
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);

  // 初始化加载分析报告
  useEffect(() => {
    loadInsightReport();
  }, [employee.id]);

  // 自动刷新逻辑
  useEffect(() => {
    if (isAutoRefresh && report) {
      const interval = setInterval(() => {
        loadInsightReport();
      }, 5 * 60 * 1000); // 5分钟刷新一次

      return () => clearInterval(interval);
    }
  }, [isAutoRefresh, report]);

  const loadInsightReport = async () => {
    setAnalysisState({
      status: 'analyzing',
      progress: 0,
      currentStage: '开始分析知识库内容...'
    });

    try {
      // 模拟分析过程
      const stages = [
        '分析文档内容...',
        '检测创新指标...',
        '识别能力缺失...',
        '生成模式洞察...',
        '编制综合报告...'
      ];

      for (let i = 0; i < stages.length; i++) {
        setAnalysisState({
          status: 'analyzing',
          progress: (i + 1) / stages.length * 80,
          currentStage: stages[i]
        });
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      const newReport = await knowledgeInsightService.generateInsightReport(employee);

      setAnalysisState({
        status: 'completed',
        progress: 100,
        currentStage: '分析完成',
        completionTime: new Date()
      });

      setReport(newReport);
    } catch (error) {
      setAnalysisState({
        status: 'error',
        progress: 0,
        currentStage: '分析失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  };

  // 过滤洞察
  const filteredInnovationInsights = useMemo(() => {
    if (!report) return [];
    return report.innovationInsights.filter(insight => {
      if (selectedFilters.innovationType && insight.type !== selectedFilters.innovationType) return false;
      if (selectedFilters.impactLevel && insight.impact !== selectedFilters.impactLevel) return false;
      if (selectedFilters.confidenceLevel && insight.confidence !== selectedFilters.confidenceLevel) return false;
      return true;
    });
  }, [report, selectedFilters]);

  const filteredCapabilityGaps = useMemo(() => {
    if (!report) return [];
    return report.capabilityGaps.filter(gap => {
      if (selectedFilters.gapType && gap.type !== selectedFilters.gapType) return false;
      if (selectedFilters.impactLevel && gap.impact !== selectedFilters.impactLevel) return false;
      if (selectedFilters.confidenceLevel && gap.confidence !== selectedFilters.confidenceLevel) return false;
      return true;
    });
  }, [report, selectedFilters]);

  // 获取影响级别的样式
  const getImpactLevelStyle = (level: ImpactLevel) => {
    const styles = {
      minimal: 'bg-gray-100 text-gray-700 border-gray-200',
      low: 'bg-blue-100 text-blue-700 border-blue-200',
      moderate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      high: 'bg-orange-100 text-orange-700 border-orange-200',
      critical: 'bg-red-100 text-red-700 border-red-200'
    };
    return styles[level] || styles.moderate;
  };

  // 获取置信度样式
  const getConfidenceLevelStyle = (level: ConfidenceLevel) => {
    const styles = {
      low: 'bg-red-100 text-red-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-green-100 text-green-700',
      very_high: 'bg-emerald-100 text-emerald-700'
    };
    return styles[level] || styles.medium;
  };

  // 获取紧急程度样式
  const getUrgencyLevelStyle = (level: UrgencyLevel) => {
    const styles = {
      low: 'bg-gray-100 text-gray-600',
      medium: 'bg-blue-100 text-blue-600',
      high: 'bg-orange-100 text-orange-600',
      urgent: 'bg-red-100 text-red-600'
    };
    return styles[level] || styles.medium;
  };

  // 渲染分析进度
  const renderAnalysisProgress = () => (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-500" />
          智能洞察分析
        </h3>
        {analysisState.status === 'analyzing' && (
          <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
        )}
      </div>

      {analysisState.status === 'analyzing' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{analysisState.currentStage}</span>
            <span className="text-blue-600 font-medium">{Math.round(analysisState.progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${analysisState.progress}%` }}
            />
          </div>
        </div>
      )}

      {analysisState.status === 'error' && (
        <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
          <XCircle className="h-5 w-5 text-red-500" />
          <div>
            <p className="text-red-700 font-medium">分析失败</p>
            <p className="text-red-600 text-sm">{analysisState.error}</p>
          </div>
          <button
            onClick={loadInsightReport}
            className="ml-auto px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            重试
          </button>
        </div>
      )}

      {analysisState.status === 'completed' && analysisState.completionTime && (
        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <div>
            <p className="text-green-700 font-medium">分析完成</p>
            <p className="text-green-600 text-sm">
              更新时间: {analysisState.completionTime.toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  // 渲染概览视图
  const renderOverview = () => {
    if (!report) return null;

    return (
      <div className="space-y-6">
        {/* 核心指标 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <Lightbulb className="h-8 w-8 text-blue-600" />
              <span className="text-xs text-blue-600 font-medium">创新指数</span>
            </div>
            <div className="text-2xl font-bold text-blue-700">{report.summary.innovationScore}</div>
            <div className="text-xs text-blue-600 mt-1">
              基于{report.innovationInsights.length}个创新洞察
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-8 w-8 text-green-600" />
              <span className="text-xs text-green-600 font-medium">能力水平</span>
            </div>
            <div className="text-2xl font-bold text-green-700">{report.summary.capabilityScore}</div>
            <div className="text-xs text-green-600 mt-1">
              识别{report.capabilityGaps.length}个改进点
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <Shield className="h-8 w-8 text-purple-600" />
              <span className="text-xs text-purple-600 font-medium">健康指数</span>
            </div>
            <div className="text-2xl font-bold text-purple-700">{report.summary.overallHealthScore}</div>
            <div className="text-xs text-purple-600 mt-1">
              知识库整体质量
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <Flag className="h-8 w-8 text-orange-600" />
              <span className="text-xs text-orange-600 font-medium">优先级</span>
            </div>
            <div className="text-2xl font-bold text-orange-700">{report.summary.highPriorityInsights}</div>
            <div className="text-xs text-orange-600 mt-1">
              高优先级洞察
            </div>
          </div>
        </div>

        {/* 综合分析 */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-500" />
            综合分析
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 优势领域 */}
            <div className="space-y-3">
              <h4 className="font-medium text-green-800 flex items-center gap-2">
                <Award className="h-4 w-4" />
                优势领域
              </h4>
              {report.comprehensiveAnalysis.strengthAreas.map((strength, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-green-50 rounded border border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-green-700 text-sm">{strength}</span>
                </div>
              ))}
            </div>

            {/* 改进领域 */}
            <div className="space-y-3">
              <h4 className="font-medium text-orange-800 flex items-center gap-2">
                <Target className="h-4 w-4" />
                改进领域
              </h4>
              {report.comprehensiveAnalysis.improvementAreas.map((area, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-orange-50 rounded border border-orange-200">
                  <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span className="text-orange-700 text-sm">{area}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 关键行动 */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="font-medium text-red-800 mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              关键行动项
            </h4>
            <div className="space-y-2">
              {report.comprehensiveAnalysis.criticalActions.map((action, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-red-50 rounded border border-red-200">
                  <ArrowRight className="h-4 w-4 text-red-600" />
                  <span className="text-red-700 text-sm font-medium">{action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 趋势预测 */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-500" />
            趋势预测
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {report.predictions.map((prediction, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-800">
                    {prediction.timeline === '1month' ? '1个月内' :
                     prediction.timeline === '3months' ? '3个月内' :
                     prediction.timeline === '6months' ? '6个月内' : '1年内'}
                  </h4>
                  <Calendar className="h-4 w-4 text-gray-500" />
                </div>

                <div className="space-y-3">
                  <div>
                    <h5 className="text-xs font-medium text-gray-600 mb-1">预期变化</h5>
                    <ul className="text-xs text-gray-700 space-y-1">
                      {prediction.expectedChanges.map((change, idx) => (
                        <li key={idx} className="flex items-center gap-1">
                          <div className="w-1 h-1 bg-green-500 rounded-full" />
                          {change}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="text-xs font-medium text-gray-600 mb-1">风险因素</h5>
                    <ul className="text-xs text-gray-700 space-y-1">
                      {prediction.riskFactors.map((risk, idx) => (
                        <li key={idx} className="flex items-center gap-1">
                          <div className="w-1 h-1 bg-red-500 rounded-full" />
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="text-xs font-medium text-gray-600 mb-1">机会点</h5>
                    <ul className="text-xs text-gray-700 space-y-1">
                      {prediction.opportunities.map((opportunity, idx) => (
                        <li key={idx} className="flex items-center gap-1">
                          <div className="w-1 h-1 bg-blue-500 rounded-full" />
                          {opportunity}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 渲染创新洞察视图
  const renderInnovationInsights = () => {
    if (!report || filteredInnovationInsights.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <Lightbulb className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>暂无创新洞察数据</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {filteredInnovationInsights.map((insight, index) => (
          <div
            key={insight.id}
            className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onInsightClick?.(insight)}
          >
            {/* 洞察标题 */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Lightbulb className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{insight.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs border ${getImpactLevelStyle(insight.impact)}`}>
                  {insight.impact === 'low' ? '低影响' :
                   insight.impact === 'moderate' ? '中影响' :
                   insight.impact === 'high' ? '高影响' : '关键影响'}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs ${getConfidenceLevelStyle(insight.confidence)}`}>
                  {insight.confidence === 'low' ? '低置信' :
                   insight.confidence === 'medium' ? '中置信' :
                   insight.confidence === 'high' ? '高置信' : '极高置信'}
                </span>
              </div>
            </div>

            {/* 指标展示 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">{insight.metrics.innovationPotential}%</div>
                <div className="text-xs text-blue-600">创新潜力</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">{insight.metrics.creativityIndex}%</div>
                <div className="text-xs text-purple-600">创造力指数</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">{insight.metrics.crossDomainCapability}%</div>
                <div className="text-xs text-green-600">跨域能力</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-lg font-bold text-orange-600">{insight.metrics.implementationFeasibility}%</div>
                <div className="text-xs text-orange-600">实现可行性</div>
              </div>
            </div>

            {/* 机会展示 */}
            {insight.opportunities.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  创新机会
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {insight.opportunities.slice(0, 2).map((opportunity, idx) => (
                    <div key={idx} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-medium text-yellow-800 text-sm">{opportunity.title}</h5>
                        <span className="text-xs text-yellow-600">价值: {opportunity.potentialValue}%</span>
                      </div>
                      <p className="text-yellow-700 text-xs">{opportunity.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 行动建议 */}
            {insight.actionRecommendations.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4 text-indigo-500" />
                  建议行动
                </h4>
                <div className="space-y-2">
                  {insight.actionRecommendations.slice(0, 2).map((action, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2 bg-indigo-50 rounded border border-indigo-200">
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${
                        action.priority === 'high' ? 'bg-red-500' :
                        action.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <div>
                        <p className="text-indigo-800 text-sm font-medium">{action.action}</p>
                        <p className="text-indigo-600 text-xs">{action.expectedOutcome}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // 渲染能力缺失视图
  const renderCapabilityGaps = () => {
    if (!report || filteredCapabilityGaps.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>暂无能力缺失数据</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {filteredCapabilityGaps.map((gap, index) => (
          <div
            key={gap.id}
            className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onInsightClick?.(gap)}
          >
            {/* 缺失标题 */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{gap.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{gap.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs border ${getImpactLevelStyle(gap.impact)}`}>
                  {gap.impact === 'low' ? '低影响' :
                   gap.impact === 'moderate' ? '中影响' :
                   gap.impact === 'high' ? '高影响' : '关键影响'}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs ${getUrgencyLevelStyle(gap.urgency)}`}>
                  {gap.urgency === 'low' ? '低紧急' :
                   gap.urgency === 'medium' ? '中紧急' :
                   gap.urgency === 'high' ? '高紧急' : '极紧急'}
                </span>
              </div>
            </div>

            {/* 缺失指标 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-lg font-bold text-red-600">{gap.gapMetrics.severityScore}%</div>
                <div className="text-xs text-red-600">严重程度</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-lg font-bold text-orange-600">{gap.gapMetrics.frequencyImpact}%</div>
                <div className="text-xs text-orange-600">频率影响</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-lg font-bold text-yellow-600">{gap.gapMetrics.businessImpact}%</div>
                <div className="text-xs text-yellow-600">业务影响</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">{gap.gapMetrics.learningDifficulty}%</div>
                <div className="text-xs text-blue-600">学习难度</div>
              </div>
            </div>

            {/* 根本原因 */}
            {gap.rootCauses.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-500" />
                  根本原因
                </h4>
                <div className="space-y-2">
                  {gap.rootCauses.slice(0, 3).map((cause, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-purple-50 rounded border border-purple-200">
                      <span className="text-purple-800 text-sm">{cause.description}</span>
                      <div className="flex items-center gap-1">
                        <div className="w-20 bg-purple-200 rounded-full h-1.5">
                          <div
                            className="bg-purple-600 h-1.5 rounded-full"
                            style={{ width: `${cause.contributionWeight}%` }}
                          />
                        </div>
                        <span className="text-xs text-purple-600 font-medium">{cause.contributionWeight}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 改进路径 */}
            {gap.improvementPath.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-green-500" />
                  改进路径
                </h4>
                <div className="space-y-2">
                  {gap.improvementPath.slice(0, 2).map((stage, idx) => (
                    <div key={idx} className="p-3 bg-green-50 rounded border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-green-800">阶段{stage.stage}: {stage.milestone}</h5>
                        <span className="text-xs text-green-600">{stage.estimatedDuration}</span>
                      </div>
                      <ul className="text-sm text-green-700 space-y-1">
                        {stage.requiredActions.slice(0, 3).map((action, actionIdx) => (
                          <li key={actionIdx} className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // 渲染知识模式视图
  const renderKnowledgePatterns = () => {
    if (!report || report.knowledgePatterns.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <Network className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>暂无知识模式数据</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {report.knowledgePatterns.map((pattern, index) => (
          <div key={pattern.id} className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Network className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{pattern.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{pattern.description}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${getConfidenceLevelStyle(pattern.confidence)}`}>
                置信度: {pattern.confidence === 'high' ? '高' : pattern.confidence === 'medium' ? '中' : '低'}
              </span>
            </div>

            {/* 模式特征 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-indigo-50 rounded-lg">
                <div className="text-lg font-bold text-indigo-600">{Math.round(pattern.patternCharacteristics.frequency)}</div>
                <div className="text-xs text-indigo-600">频率</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">{Math.round(pattern.patternCharacteristics.consistency * 100)}%</div>
                <div className="text-xs text-green-600">一致性</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-lg font-bold text-orange-600">{Math.round(pattern.patternCharacteristics.strength * 100)}%</div>
                <div className="text-xs text-orange-600">强度</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">{Math.round(pattern.patternCharacteristics.stability * 100)}%</div>
                <div className="text-xs text-purple-600">稳定性</div>
              </div>
            </div>

            {/* 趋势信息 */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-800">趋势分析</h4>
                <div className="flex items-center gap-2">
                  <TrendingUp className={`h-4 w-4 ${
                    pattern.trendData.direction === 'increasing' ? 'text-green-500' :
                    pattern.trendData.direction === 'decreasing' ? 'text-red-500' :
                    pattern.trendData.direction === 'stable' ? 'text-blue-500' : 'text-orange-500'
                  }`} />
                  <span className="text-sm text-gray-600">
                    {pattern.trendData.direction === 'increasing' ? '上升趋势' :
                     pattern.trendData.direction === 'decreasing' ? '下降趋势' :
                     pattern.trendData.direction === 'stable' ? '稳定趋势' : '波动趋势'}
                  </span>
                </div>
              </div>
              <div className="text-sm text-gray-700">
                趋势强度: {Math.round(pattern.trendData.magnitude * 100)}%，
                延续性预测: {pattern.trendData.predictedContinuation}%
              </div>
            </div>

            {/* 含义和建议 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">模式含义</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  {pattern.implications.map((implication, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <div className="w-1 h-1 bg-blue-500 rounded-full mt-2" />
                      {implication}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-2">优化建议</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  {pattern.recommendations.map((recommendation, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <div className="w-1 h-1 bg-green-500 rounded-full mt-2" />
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // 渲染建议视图
  const renderRecommendations = () => {
    if (!report) return null;

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            战略建议
          </h3>
          <div className="space-y-3">
            {report.comprehensiveAnalysis.strategicRecommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <Star className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-yellow-800 font-medium">建议 {index + 1}</p>
                  <p className="text-yellow-700 text-sm">{recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 主界面渲染
  return (
    <div className="space-y-6">
      {/* 控制面板 */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* 视图切换 */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { id: 'overview', label: '概览', icon: BarChart3 },
              { id: 'innovation', label: '创新洞察', icon: Lightbulb },
              { id: 'gaps', label: '能力缺失', icon: AlertCircle },
              { id: 'patterns', label: '知识模式', icon: Network },
              { id: 'recommendations', label: '建议', icon: Star }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSelectedView(id as any)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                  selectedView === id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-2">
            {showAdvancedControls && (
              <>
                <button className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Filter className="h-4 w-4" />
                  筛选
                </button>
                <button className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Settings className="h-4 w-4" />
                  设置
                </button>
              </>
            )}
            <button
              onClick={loadInsightReport}
              disabled={analysisState.status === 'analyzing'}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${analysisState.status === 'analyzing' ? 'animate-spin' : ''}`} />
              {analysisState.status === 'analyzing' ? '分析中...' : '刷新分析'}
            </button>
            <button className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="h-4 w-4" />
              导出
            </button>
          </div>
        </div>
      </div>

      {/* 分析进度 */}
      {(analysisState.status === 'analyzing' || analysisState.status === 'error') && renderAnalysisProgress()}

      {/* 主要内容区域 */}
      {analysisState.status === 'completed' && report && (
        <>
          {selectedView === 'overview' && renderOverview()}
          {selectedView === 'innovation' && renderInnovationInsights()}
          {selectedView === 'gaps' && renderCapabilityGaps()}
          {selectedView === 'patterns' && renderKnowledgePatterns()}
          {selectedView === 'recommendations' && renderRecommendations()}
        </>
      )}

      {/* 空状态 */}
      {analysisState.status === 'idle' && !report && (
        <div className="text-center py-12 text-gray-500">
          <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>点击"刷新分析"开始深度洞察分析</p>
        </div>
      )}
    </div>
  );
};

export default KnowledgeInsightsPanel;