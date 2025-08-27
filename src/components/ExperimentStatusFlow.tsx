import React, { useState, useCallback } from 'react';
import {
  Play, Square, CheckCircle, Clock, Settings, 
  ArrowRight, RotateCcw, TrendingUp, Upload, Download, Archive,
  Zap, Shield, Eye, FileText
} from 'lucide-react';
import { ABTest, AB_TEST_STATUS_LABELS, CREATION_TYPE_LABELS } from '../types';
import { ABTestSystemConfig, ExperimentStatus, EXPERIMENT_STATUS_COLORS } from '../types/system-config';

interface StatusTransitionRule {
  from: ExperimentStatus;
  to: ExperimentStatus;
  label: string;
  description: string;
  conditions: string[];
  requiredPermissions: string[];
  autoTransition?: boolean;
  icon: React.ElementType;
  color: string;
}

interface ExperimentStatusFlowProps {
  experiment: ABTest;
  systemConfig: ABTestSystemConfig;
  currentUser: {
    id: string;
    name: string;
    permissions: string[];
  };
  onStatusTransition: (experimentId: string, toStatus: ExperimentStatus, reason?: string) => Promise<void>;
  onViewHistory?: (experimentId: string) => void;
}

const ExperimentStatusFlow: React.FC<ExperimentStatusFlowProps> = ({
  experiment,
  systemConfig,
  currentUser,
  onStatusTransition,
  onViewHistory
}) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showTransitionReason, setShowTransitionReason] = useState<ExperimentStatus | null>(null);
  const [transitionReason, setTransitionReason] = useState('');

  // 定义完整的状态流转规则
  const statusTransitionRules: StatusTransitionRule[] = [
    {
      from: 'draft',
      to: 'pending_experiment',
      label: '发布实验',
      description: '将草稿实验发布，等待实验开始时间',
      conditions: ['实验配置完整', '预算审核通过', '流量分配合理'],
      requiredPermissions: ['experiment.publish'],
      icon: Upload,
      color: 'text-blue-600'
    },
    {
      from: 'pending_experiment',
      to: 'experimenting',
      label: '开始实验',
      description: '到达预定时间，自动或手动开始实验',
      conditions: ['到达开始时间', '系统资源充足', '流量分配正常'],
      requiredPermissions: ['experiment.start'],
      autoTransition: true,
      icon: Play,
      color: 'text-green-600'
    },
    {
      from: 'experimenting',
      to: 'experiment_ended',
      label: '结束实验',
      description: '达到结束条件，停止数据收集',
      conditions: ['达到结束时间', '或满足提前停止条件', '数据收集完整'],
      requiredPermissions: ['experiment.stop'],
      autoTransition: true,
      icon: Square,
      color: 'text-orange-600'
    },
    {
      from: 'experiment_ended',
      to: 'deploying',
      label: '开始上线',
      description: '根据实验结果开始部署获胜方案',
      conditions: ['通过统计显著性检验', '业务指标达标', '风险评估通过'],
      requiredPermissions: ['experiment.deploy'],
      icon: TrendingUp,
      color: 'text-purple-600'
    },
    {
      from: 'deploying',
      to: 'deployed',
      label: '上线完成',
      description: '方案已成功部署到生产环境',
      conditions: ['部署脚本执行成功', '健康检查通过', '监控指标正常'],
      requiredPermissions: ['experiment.complete'],
      autoTransition: true,
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      from: 'deployed',
      to: 'offline',
      label: '下线方案',
      description: '有新方案上线，当前方案被替换',
      conditions: ['新实验方案上线', '或手动下线操作'],
      requiredPermissions: ['experiment.offline'],
      icon: Download,
      color: 'text-gray-600'
    },
    {
      from: 'experiment_ended',
      to: 'archived',
      label: '直接归档',
      description: '实验结果无统计意义，直接归档',
      conditions: ['无显著性结果', '或业务决定不采用'],
      requiredPermissions: ['experiment.archive'],
      icon: Archive,
      color: 'text-gray-500'
    },
    {
      from: 'offline',
      to: 'archived',
      label: '归档',
      description: '将已下线的实验永久归档',
      conditions: ['下线时间超过保留期', '或手动归档'],
      requiredPermissions: ['experiment.archive'],
      icon: Archive,
      color: 'text-gray-500'
    }
  ];

  // 获取当前状态可以转换到的状态
  const getAvailableTransitions = useCallback((currentStatus: ExperimentStatus) => {
    return statusTransitionRules.filter(rule => {
      // 基础状态匹配
      if (rule.from !== currentStatus) return false;
      
      // 权限检查
      const hasPermission = rule.requiredPermissions.every(permission => 
        currentUser.permissions.includes(permission)
      );
      if (!hasPermission) return false;
      
      // 特殊业务逻辑检查
      if (rule.to === 'deploying') {
        // 需要审核的情况
        if (systemConfig.deploymentApproval.requiresHumanApproval) {
          // AI创建的实验需要更严格的审核
          if (experiment.creationType === 'ai_created' && 
              systemConfig.deploymentApproval.stricterAiExperimentApproval) {
            return currentUser.permissions.includes('experiment.approve_ai');
          }
          return currentUser.permissions.includes('experiment.approve');
        }
      }
      
      return true;
    });
  }, [currentUser.permissions, systemConfig, experiment.creationType]);

  // 执行状态转换
  const handleStatusTransition = useCallback(async (toStatus: ExperimentStatus) => {
    setIsTransitioning(true);
    try {
      await onStatusTransition(experiment.id, toStatus, transitionReason);
      setShowTransitionReason(null);
      setTransitionReason('');
    } catch (error) {
      console.error('状态转换失败:', error);
      // 这里可以添加错误处理逻辑
    } finally {
      setIsTransitioning(false);
    }
  }, [experiment.id, onStatusTransition, transitionReason]);

  // 获取状态描述
  const getStatusDescription = (status: ExperimentStatus): string => {
    switch (status) {
      case 'draft':
        return '实验配置阶段，尚未发布';
      case 'pending_experiment':
        return '实验已发布，等待开始时间';
      case 'experimenting':
        return '实验正在运行，收集数据中';
      case 'experiment_ended':
        return '实验已结束，等待分析和决策';
      case 'deploying':
        return '获胜方案正在部署到生产环境';
      case 'deployed':
        return '方案已成功上线，正在生产运行';
      case 'offline':
        return '方案已下线，可操作归档';
      case 'archived':
        return '实验已归档，数据永久保存';
      default:
        return '未知状态';
    }
  };

  // 判断是否需要审核
  const needsApproval = (toStatus: ExperimentStatus): boolean => {
    if (toStatus !== 'deploying') return false;
    
    if (!systemConfig.deploymentApproval.requiresHumanApproval) return false;
    
    // AI创建的实验需要更严格审核
    if (experiment.creationType === 'ai_created' && 
        systemConfig.deploymentApproval.stricterAiExperimentApproval) {
      return true;
    }
    
    return systemConfig.deploymentApproval.requiresHumanApproval;
  };

  const availableTransitions = getAvailableTransitions(experiment.status);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-600" />
            实验状态管理
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            管理实验在整个生命周期中的状态流转
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {onViewHistory && (
            <button
              onClick={() => onViewHistory(experiment.id)}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Eye className="h-4 w-4" />
              查看历史
            </button>
          )}
        </div>
      </div>

      {/* 当前状态展示 */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${EXPERIMENT_STATUS_COLORS[experiment.status].split(' ')[1]}`}></div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">
                  {AB_TEST_STATUS_LABELS[experiment.status]}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  experiment.creationType === 'ai_created' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {CREATION_TYPE_LABELS[experiment.creationType]}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {getStatusDescription(experiment.status)}
              </p>
            </div>
          </div>
          
          {/* 自动转换指示 */}
          {statusTransitionRules.some(rule => 
            rule.from === experiment.status && rule.autoTransition
          ) && (
            <div className="flex items-center gap-1 text-blue-600 text-sm">
              <Zap className="h-4 w-4" />
              <span>自动流转</span>
            </div>
          )}
        </div>
      </div>

      {/* 可用的状态转换操作 */}
      {availableTransitions.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">可执行操作</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableTransitions.map((transition) => (
              <div key={`${transition.from}-${transition.to}`} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <transition.icon className={`h-5 w-5 ${transition.color}`} />
                    <span className="font-medium text-gray-900">{transition.label}</span>
                  </div>
                  
                  {needsApproval(transition.to) && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                      <Shield className="h-3 w-3" />
                      需审核
                    </div>
                  )}
                  
                  {transition.autoTransition && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      <Zap className="h-3 w-3" />
                      自动
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{transition.description}</p>
                
                {/* 转换条件 */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-700 mb-2">执行条件：</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {transition.conditions.map((condition, index) => (
                      <li key={index} className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        {condition}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* 操作按钮 */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (transition.to === 'deploying' || transition.to === 'archived') {
                        setShowTransitionReason(transition.to);
                      } else {
                        handleStatusTransition(transition.to);
                      }
                    }}
                    disabled={isTransitioning}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                      transition.color.includes('green') 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : transition.color.includes('blue')
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-600 text-white hover:bg-gray-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isTransitioning ? (
                      <RotateCcw className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                    执行
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 无可用操作时的提示 */}
      {availableTransitions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Settings className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">当前状态下暂无可执行的操作</p>
          <p className="text-xs text-gray-400 mt-1">
            {experiment.status === 'archived' 
              ? '实验已归档，无法进行状态变更'
              : '请等待满足转换条件或联系管理员'
            }
          </p>
        </div>
      )}

      {/* 状态转换原因输入弹窗 */}
      {showTransitionReason && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {showTransitionReason === 'deploying' ? '上线原因说明' : '归档原因说明'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              请简要说明此次{showTransitionReason === 'deploying' ? '上线' : '归档'}操作的原因：
            </p>
            <textarea
              value={transitionReason}
              onChange={(e) => setTransitionReason(e.target.value)}
              placeholder={`请输入${showTransitionReason === 'deploying' ? '上线' : '归档'}原因...`}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none"
              rows={4}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setShowTransitionReason(null);
                  setTransitionReason('');
                }}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={() => handleStatusTransition(showTransitionReason)}
                disabled={!transitionReason.trim() || isTransitioning}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTransitioning ? '处理中...' : '确认'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 状态流转流程图（简化版） */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-4">状态流转流程</h4>
        <div className="flex items-center justify-between text-xs overflow-x-auto">
          {[
            { status: 'draft', label: '草稿', icon: FileText },
            { status: 'pending_experiment', label: '待实验', icon: Clock },
            { status: 'experimenting', label: '实验中', icon: Play },
            { status: 'experiment_ended', label: '已结束', icon: Square },
            { status: 'deploying', label: '上线中', icon: Upload },
            { status: 'deployed', label: '已上线', icon: CheckCircle },
            { status: 'offline', label: '已下线', icon: Download },
            { status: 'archived', label: '归档', icon: Archive }
          ].map((step, index, array) => (
            <React.Fragment key={step.status}>
              <div className={`flex flex-col items-center p-2 rounded-lg min-w-0 ${
                experiment.status === step.status 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'text-gray-500'
              }`}>
                <step.icon className="h-4 w-4 mb-1" />
                <span className="whitespace-nowrap">{step.label}</span>
              </div>
              {index < array.length - 1 && (
                <ArrowRight className="h-4 w-4 text-gray-300 flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExperimentStatusFlow;