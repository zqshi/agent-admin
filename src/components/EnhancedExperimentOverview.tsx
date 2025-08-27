import React, { useState } from 'react';
import {
  CheckCircle, XCircle, Clock, TrendingUp,
  Brain, Zap, Shield, DollarSign, Users, Target, BarChart3, 
  Play, Square, ArrowUp, Settings, Bell, Eye
} from 'lucide-react';
import { ABTest, AB_TEST_STATUS_LABELS, CREATION_TYPE_LABELS } from '../types';
import { ABTestSystemConfig, EXPERIMENT_STATUS_COLORS } from '../types/system-config';

interface SmartDecisionRecommendation {
  experimentId: string;
  status: 'ready' | 'pending_approval' | 'approved' | 'rejected';
  decision: 'continue' | 'stop_adopt_a' | 'stop_adopt_b' | 'stop_no_winner';
  confidence: number;
  reasoning: {
    statistical: string;
    business: string;
    risk: string;
  };
  estimatedImpact: {
    users: number;
    revenue: number;
    improvement: string;
  };
  requiredApproval: boolean;
  autoDeployEligible: boolean;
}

interface EnhancedExperimentOverviewProps {
  experiment: ABTest;
  systemConfig: ABTestSystemConfig;
  onApproveDecision?: (decision: SmartDecisionRecommendation) => void;
  onRejectDecision?: (decision: SmartDecisionRecommendation) => void;
  onManualDeploy?: (experimentId: string, winnerGroup: string) => void;
}

const EnhancedExperimentOverview: React.FC<EnhancedExperimentOverviewProps> = ({
  experiment,
  systemConfig,
  onApproveDecision,
  onRejectDecision,
  onManualDeploy
}) => {
  const [showDecisionDetails, setShowDecisionDetails] = useState(false);
  
  // Mock智能决策数据 - 实际使用时从props或API获取
  const smartDecision: SmartDecisionRecommendation | null = experiment.status === 'experiment_ended' ? {
    experimentId: experiment.id,
    status: 'ready',
    decision: 'stop_adopt_b',
    confidence: 0.92,
    reasoning: {
      statistical: '实验组B相较于对照组A在主要指标上有显著提升，p值为0.003，置信度95%',
      business: '预估月度收入增长12.5%，用户满意度提升15%，投资回报率为340%',
      risk: '风险评估为低风险，无负面指标异常，建议立即上线'
    },
    estimatedImpact: {
      users: 50000,
      revenue: 125000,
      improvement: '12.5%'
    },
    requiredApproval: systemConfig.deploymentApproval.requiresHumanApproval && 
                     (experiment.creationType === 'ai_created' ? systemConfig.deploymentApproval.stricterAiExperimentApproval : true),
    autoDeployEligible: !systemConfig.deploymentApproval.requiresHumanApproval
  } : null;

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case 'stop_adopt_a': return <ArrowUp className="h-5 w-5 text-green-600" />;
      case 'stop_adopt_b': return <ArrowUp className="h-5 w-5 text-blue-600" />;
      case 'continue': return <Play className="h-5 w-5 text-yellow-600" />;
      case 'stop_no_winner': return <Square className="h-5 w-5 text-gray-600" />;
      default: return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getDecisionText = (decision: string) => {
    switch (decision) {
      case 'stop_adopt_a': return '推荐上线对照组A';
      case 'stop_adopt_b': return '推荐上线实验组B';
      case 'continue': return '建议继续实验';
      case 'stop_no_winner': return '无明显优胜者，停止实验';
      default: return '等待分析结果';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* 实验基本信息卡片 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">{experiment.name}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${EXPERIMENT_STATUS_COLORS[experiment.status]}`}>
                {AB_TEST_STATUS_LABELS[experiment.status]}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                experiment.creationType === 'ai_created' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {CREATION_TYPE_LABELS[experiment.creationType]}
              </span>
            </div>
            <p className="text-gray-600 mb-4">{experiment.description}</p>
            
            {/* 关键指标概览 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <div>
                  <div className="text-sm text-gray-500">总样本量</div>
                  <div className="font-semibold">
                    {experiment.metrics?.technicalMetrics?.totalSessions?.toLocaleString() || '0'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-green-500" />
                <div>
                  <div className="text-sm text-gray-500">成功率</div>
                  <div className="font-semibold">
                    {((experiment.metrics?.businessMetrics?.taskSuccessRate || 0) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-orange-500" />
                <div>
                  <div className="text-sm text-gray-500">成本支出</div>
                  <div className="font-semibold">
                    ${experiment.config?.budget?.currentSpent?.toFixed(2) || '0.00'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-500" />
                <div>
                  <div className="text-sm text-gray-500">运行时长</div>
                  <div className="font-semibold">
                    {experiment.endDate 
                      ? Math.ceil((new Date(experiment.endDate).getTime() - new Date(experiment.startDate).getTime()) / (1000 * 60 * 60 * 24))
                      : Math.ceil((new Date().getTime() - new Date(experiment.startDate).getTime()) / (1000 * 60 * 60 * 24))
                    }天
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 操作按钮区域 */}
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <Settings className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <Eye className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* AI智能决策推荐区域 - 整合在概览页面顶部 */}
        {smartDecision && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="h-6 w-6 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">AI智能决策推荐</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(smartDecision.confidence)} bg-white`}>
                    置信度 {(smartDecision.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    {getDecisionIcon(smartDecision.decision)}
                    <span className="font-medium text-gray-900">
                      {getDecisionText(smartDecision.decision)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      影响 {smartDecision.estimatedImpact.users.toLocaleString()} 用户
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      预估增收 ${smartDecision.estimatedImpact.revenue.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      改进幅度 {smartDecision.estimatedImpact.improvement}
                    </span>
                  </div>
                </div>

                {/* 决策理由概览 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <BarChart3 className="h-4 w-4 text-blue-500" />
                      <span className="font-medium text-sm text-gray-700">统计分析</span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">{smartDecision.reasoning.statistical}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <span className="font-medium text-sm text-gray-700">商业影响</span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">{smartDecision.reasoning.business}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="h-4 w-4 text-orange-500" />
                      <span className="font-medium text-sm text-gray-700">风险评估</span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">{smartDecision.reasoning.risk}</p>
                  </div>
                </div>

                {/* 详细信息切换 */}
                <button
                  onClick={() => setShowDecisionDetails(!showDecisionDetails)}
                  className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                >
                  {showDecisionDetails ? '收起详细分析' : '查看详细分析'}
                </button>

                {/* 详细决策信息 */}
                {showDecisionDetails && (
                  <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">统计分析详情</h4>
                        <p className="text-sm text-gray-700">{smartDecision.reasoning.statistical}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">商业影响分析</h4>
                        <p className="text-sm text-gray-700">{smartDecision.reasoning.business}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">风险评估</h4>
                        <p className="text-sm text-gray-700">{smartDecision.reasoning.risk}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* 决策操作按钮 */}
              <div className="flex flex-col gap-2 ml-6">
                {smartDecision.requiredApproval ? (
                  <>
                    <button
                      onClick={() => onApproveDecision?.(smartDecision)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                      批准上线
                    </button>
                    <button
                      onClick={() => onRejectDecision?.(smartDecision)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="h-4 w-4" />
                      拒绝建议
                    </button>
                  </>
                ) : smartDecision.autoDeployEligible ? (
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
                    <Zap className="h-4 w-4" />
                    <span className="text-sm font-medium">自动上线中...</span>
                  </div>
                ) : (
                  <button
                    onClick={() => onManualDeploy?.(experiment.id, smartDecision.decision === 'stop_adopt_b' ? 'treatment' : 'control')}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Play className="h-4 w-4" />
                    手动上线
                  </button>
                )}
                
                {/* 通知相关人员按钮 */}
                {smartDecision.requiredApproval && (
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    <Bell className="h-4 w-4" />
                    通知审核人
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 流量分组信息 */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">实验组对比</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {experiment.groups.map((group) => (
              <div key={group.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      group.id === 'control' ? 'bg-blue-500' : 'bg-green-500'
                    }`}></div>
                    <span className="font-medium text-gray-900">{group.name}</span>
                    <span className="text-sm text-gray-500">({group.trafficRatio}%)</span>
                  </div>
                  
                  {/* 胜出标识 */}
                  {smartDecision && 
                   ((smartDecision.decision === 'stop_adopt_a' && group.id === 'control') ||
                    (smartDecision.decision === 'stop_adopt_b' && group.id === 'treatment')) && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                      <CheckCircle className="h-3 w-3" />
                      推荐方案
                    </div>
                  )}
                </div>
                
                {/* 组指标 */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">会话数</span>
                    <span className="font-medium">
                      {group.realTimeMetrics?.currentSessions?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">转化率</span>
                    <span className="font-medium">
                      {((group.realTimeMetrics?.conversionRate || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">花费</span>
                    <span className="font-medium">
                      ${group.realTimeMetrics?.costSpent?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedExperimentOverview;