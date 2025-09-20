/**
 * 导师配置组件
 */

import React, { useState } from 'react';
import { Users, Calendar, FileText, AlertTriangle } from 'lucide-react';
import { useCreationStore } from '../../../stores/creationStore';

const MentorConfig: React.FC = () => {
  const { advancedConfig, updateAdvancedConfig } = useCreationStore();
  const [isEnabled, setIsEnabled] = useState(advancedConfig?.mentor?.enabled || false);

  // 可用导师列表（模拟数据）
  const availableMentors = [
    {
      id: 'ai_manager_001',
      name: 'AI-Manager',
      role: '智能管理助手',
      description: '专业的AI管理助手，擅长团队协调和业务分析',
      avatar: '🤖'
    },
    {
      id: 'senior_advisor_001',
      name: '高级顾问',
      role: '资深业务顾问',
      description: '拥有丰富业务经验的高级顾问',
      avatar: '👨‍💼'
    },
    {
      id: 'qa_specialist_001',
      name: '质量专家',
      role: '质量保证专家',
      description: '专注于服务质量监控和改进',
      avatar: '👩‍🔬'
    }
  ];

  // 汇报模板
  const reportTemplates = [
    {
      id: 'daily_summary',
      name: '日常工作摘要',
      description: '包含工作量、问题处理情况、用户反馈等',
      content: `# {{date}} 工作摘要

## 基本数据
- 处理会话数：{{sessionCount}}
- 成功解决率：{{successRate}}%
- 平均响应时间：{{avgResponseTime}}秒
- 用户满意度：{{satisfactionScore}}/5

## 主要工作内容
{{workSummary}}

## 遇到的问题
{{issues}}

## 需要关注的事项
{{concerns}}

## 明日计划
{{tomorrowPlan}}`
    },
    {
      id: 'weekly_report',
      name: '周度工作报告',
      description: '详细的周度工作总结和分析',
      content: `# {{weekRange}} 周度工作报告

## 数据概览
- 本周处理会话：{{weeklySessionCount}}
- 问题解决率：{{weeklySuccessRate}}%
- 用户反馈评分：{{weeklyRating}}/5
- 较上周变化：{{weeklyTrend}}

## 工作亮点
{{highlights}}

## 改进建议
{{improvements}}

## 下周目标
{{nextWeekGoals}}`
    }
  ];

  // 升级规则模板
  const escalationRules = [
    {
      id: 'customer_complaint',
      name: '客户投诉升级',
      condition: '客户情绪激动或表达强烈不满',
      action: '立即通知导师并转人工处理',
      priority: 'high' as const
    },
    {
      id: 'complex_technical',
      name: '复杂技术问题',
      condition: '超出知识库范围的技术问题',
      action: '记录问题并请求导师支持',
      priority: 'medium' as const
    },
    {
      id: 'policy_violation',
      name: '政策违规风险',
      condition: '可能涉及违规操作的请求',
      action: '拒绝执行并报告导师',
      priority: 'high' as const
    }
  ];

  // 更新配置
  const updateMentorConfig = (updates: any) => {
    updateAdvancedConfig({
      mentor: {
        ...advancedConfig?.mentor,
        ...updates
      }
    });
  };

  // 切换启用状态
  const toggleEnabled = (enabled: boolean) => {
    setIsEnabled(enabled);
    updateMentorConfig({ enabled });
  };

  return (
    <div className="space-y-6">
      {/* 启用开关 */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => toggleEnabled(e.target.checked)}
            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
          <div>
            <span className="text-lg font-medium text-gray-900">启用导师机制</span>
            <p className="text-sm text-gray-600">
              为数字员工配置导师，提供监督、指导和汇报功能
            </p>
          </div>
        </label>
      </div>

      {/* 导师配置 */}
      {isEnabled && (
        <>
          {/* 导师选择 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              导师选择
            </h4>

            <div className="grid grid-cols-1 gap-4">
              {availableMentors.map(mentor => (
                <label
                  key={mentor.id}
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="mentor"
                    value={mentor.id}
                    onChange={(e) => updateMentorConfig({
                      mentor: {
                        id: mentor.id,
                        name: mentor.name,
                        role: mentor.role
                      }
                    })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-2xl">{mentor.avatar}</span>
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{mentor.name}</h5>
                    <p className="text-sm text-gray-600">{mentor.role}</p>
                    <p className="text-xs text-gray-500 mt-1">{mentor.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 汇报配置 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              汇报配置
            </h4>

            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  onChange={(e) => updateMentorConfig({
                    reporting: {
                      ...advancedConfig?.mentor?.reporting,
                      enabled: e.target.checked
                    }
                  })}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm font-medium text-gray-900">启用定期汇报</span>
              </label>

              <div className="ml-7 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">汇报周期</label>
                  <select
                    onChange={(e) => updateMentorConfig({
                      reporting: {
                        ...advancedConfig?.mentor?.reporting,
                        schedule: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">每日汇报</option>
                    <option value="weekly">每周汇报</option>
                    <option value="monthly">每月汇报</option>
                    <option value="custom">自定义</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">汇报方式</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="report_method"
                        value="email"
                        onChange={(e) => updateMentorConfig({
                          reporting: {
                            ...advancedConfig?.mentor?.reporting,
                            method: e.target.value
                          }
                        })}
                        className="text-blue-600"
                      />
                      <span className="text-sm">邮件发送</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="report_method"
                        value="im"
                        className="text-blue-600"
                      />
                      <span className="text-sm">即时消息</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="report_method"
                        value="dashboard"
                        className="text-blue-600"
                      />
                      <span className="text-sm">管理面板</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="report_method"
                        value="document"
                        className="text-blue-600"
                        defaultChecked
                      />
                      <span className="text-sm">生成文档</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">汇报模板</label>
                  <select
                    onChange={(e) => {
                      const template = reportTemplates.find(t => t.id === e.target.value);
                      updateMentorConfig({
                        reporting: {
                          ...advancedConfig?.mentor?.reporting,
                          template: template?.content || ''
                        }
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">选择模板</option>
                    {reportTemplates.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 监督配置 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              监督配置
            </h4>

            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  onChange={(e) => updateMentorConfig({
                    supervision: {
                      ...advancedConfig?.mentor?.supervision,
                      reviewDecisions: e.target.checked
                    }
                  })}
                  className="w-4 h-4 text-blue-600"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">决策审查</span>
                  <p className="text-sm text-gray-500">重要决策需要导师审查确认</p>
                </div>
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">需要审批的操作</label>
                <div className="space-y-2">
                  {[
                    '退款处理',
                    '订单修改',
                    '价格调整',
                    '客户信息修改',
                    '敏感信息查询'
                  ].map(operation => (
                    <label key={operation} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-blue-600"
                        onChange={(e) => {
                          const currentList = advancedConfig?.mentor?.supervision?.approvalRequired || [];
                          const newList = e.target.checked
                            ? [...currentList, operation]
                            : currentList.filter(op => op !== operation);

                          updateMentorConfig({
                            supervision: {
                              ...advancedConfig?.mentor?.supervision,
                              approvalRequired: newList
                            }
                          });
                        }}
                      />
                      <span className="text-sm">{operation}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">升级规则</label>
                <div className="space-y-3">
                  {escalationRules.map(rule => (
                    <div key={rule.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900">{rule.name}</h5>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          rule.priority === 'high'
                            ? 'bg-red-100 text-red-700'
                            : rule.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {rule.priority === 'high' ? '高优先级' :
                           rule.priority === 'medium' ? '中优先级' : '低优先级'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>触发条件：</strong>{rule.condition}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>处理动作：</strong>{rule.action}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 配置摘要 */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-3">导师机制摘要</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">导师：</span>
                <p className="text-gray-600">
                  {advancedConfig?.mentor?.mentor?.name || '未选择'}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">汇报周期：</span>
                <p className="text-gray-600">
                  {advancedConfig?.mentor?.reporting?.enabled
                    ? (advancedConfig.mentor.reporting.schedule || '未设置')
                    : '已禁用'
                  }
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">监督模式：</span>
                <p className="text-gray-600">
                  {advancedConfig?.mentor?.supervision?.reviewDecisions
                    ? '启用决策审查'
                    : '自主运行'
                  }
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">升级规则：</span>
                <p className="text-gray-600">{escalationRules.length} 项规则</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 说明信息 */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-amber-800 mb-1">关于导师机制</h4>
            <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
              <li>导师机制可以提供额外的监督和指导，适用于关键业务场景</li>
              <li>定期汇报有助于了解数字员工的工作状态和性能表现</li>
              <li>升级规则确保复杂或敏感问题能够及时得到人工介入</li>
              <li>如果不确定是否需要，建议先不启用，后续可以随时配置</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorConfig;