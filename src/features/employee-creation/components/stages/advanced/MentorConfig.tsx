/**
 * 导师配置组件
 */

import React, { useState } from 'react';
import { Users, Calendar, FileText, AlertTriangle, Search, ChevronRight, ChevronDown, UserCheck } from 'lucide-react';
import { useCreationStore } from '../../../stores/creationStore';
import type { AdvancedConfig } from '../../../types';

// Props接口定义
interface MentorConfigProps {
  config?: AdvancedConfig['mentor'];
  onChange?: (updates: Partial<AdvancedConfig['mentor']>) => void;
}

const MentorConfig: React.FC<MentorConfigProps> = ({ config, onChange }) => {
  const store = useCreationStore();

  // 判断是领域模式还是全局模式
  const isGlobalMode = !config && !onChange;
  const actualConfig = config || store.actualConfig;
  const actualOnChange = onChange || ((updates: Partial<AdvancedConfig['mentor']>) => {
    store.updateAdvancedConfig({ mentor: { ...store.actualConfig, ...updates } });
  });

  const [isEnabled, setIsEnabled] = useState(actualConfig?.enabled || false);

  // 组织架构树选择状态
  const [showOrgTree, setShowOrgTree] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root', 'tech', 'product']));
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Mock组织架构数据
  const orgTree = {
    id: 'root',
    name: '科技公司',
    type: 'company',
    children: [
      {
        id: 'tech',
        name: '技术部',
        type: 'department',
        children: [
          {
            id: 'frontend',
            name: '前端组',
            type: 'team',
            users: [
              { id: 'u001', name: '张三', role: '高级前端工程师', avatar: '👨‍💻' },
              { id: 'u002', name: '李四', role: '前端技术专家', avatar: '👩‍💻' },
              { id: 'u003', name: '王五', role: '前端架构师', avatar: '👨‍🎨' }
            ]
          },
          {
            id: 'backend',
            name: '后端组',
            type: 'team',
            users: [
              { id: 'u004', name: '赵六', role: '后端工程师', avatar: '👨‍💼' },
              { id: 'u005', name: '钱七', role: '系统架构师', avatar: '👩‍💼' },
              { id: 'u006', name: '孙八', role: 'DevOps工程师', avatar: '🔧' }
            ]
          },
          {
            id: 'ai',
            name: 'AI算法组',
            type: 'team',
            users: [
              { id: 'u007', name: '周九', role: 'AI工程师', avatar: '🤖' },
              { id: 'u008', name: '吴十', role: '机器学习专家', avatar: '🧠' }
            ]
          }
        ]
      },
      {
        id: 'product',
        name: '产品部',
        type: 'department',
        children: [
          {
            id: 'pm',
            name: '产品经理组',
            type: 'team',
            users: [
              { id: 'u009', name: '郑十一', role: '产品经理', avatar: '📋' },
              { id: 'u010', name: '王十二', role: '高级产品经理', avatar: '📊' }
            ]
          },
          {
            id: 'design',
            name: '设计组',
            type: 'team',
            users: [
              { id: 'u011', name: '李十三', role: 'UI设计师', avatar: '🎨' },
              { id: 'u012', name: '张十四', role: 'UX设计师', avatar: '✨' }
            ]
          }
        ]
      },
      {
        id: 'operation',
        name: '运营部',
        type: 'department',
        children: [
          {
            id: 'marketing',
            name: '市场营销组',
            type: 'team',
            users: [
              { id: 'u013', name: '陈十五', role: '市场专员', avatar: '📈' },
              { id: 'u014', name: '杨十六', role: '营销总监', avatar: '💼' }
            ]
          }
        ]
      }
    ]
  };

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
    actualOnChange({
      ...actualConfig,
      ...updates
    });
  };

  // 切换启用状态
  const toggleEnabled = (enabled: boolean) => {
    setIsEnabled(enabled);
    updateMentorConfig({ enabled });
  };

  // 组织架构树相关函数
  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const toggleUserSelection = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    } else {
      setSelectedUsers(prev => [...prev, userId]);
    }
  };

  // 获取所有用户（用于搜索）
  const getAllUsers = (node: any): any[] => {
    let users: any[] = node.users || [];
    if (node.children) {
      node.children.forEach((child: any) => {
        users = users.concat(getAllUsers(child));
      });
    }
    return users;
  };

  const allUsers = getAllUsers(orgTree);

  // 用户搜索功能
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    const filtered = allUsers.filter(user =>
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.role.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filtered);
  };

  // 获取选中用户的信息
  const getSelectedUsersInfo = () => {
    return allUsers.filter(user => selectedUsers.includes(user.id));
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
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                导师选择
              </h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowOrgTree(!showOrgTree)}
                  className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Users className="h-4 w-4" />
                  {showOrgTree ? '显示预设导师' : '从组织架构选择'}
                </button>
                {selectedUsers.length > 0 && (
                  <span className="text-sm text-blue-600">
                    已选择 {selectedUsers.length} 人
                  </span>
                )}
              </div>
            </div>

            {!showOrgTree ? (
              /* 预设导师列表 */
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
            ) : (
              /* 组织架构树选择 */
              <div className="space-y-4">
                {/* 搜索框 */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="搜索用户姓名或职位..."
                  />
                </div>

                {/* 搜索结果 */}
                {searchQuery && searchResults.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h6 className="text-sm font-medium text-blue-900 mb-2">搜索结果</h6>
                    <div className="space-y-2">
                      {searchResults.map(user => (
                        <label
                          key={user.id}
                          className="flex items-center gap-3 p-2 hover:bg-blue-100 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => toggleUserSelection(user.id)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-lg">{user.avatar}</span>
                          <div>
                            <span className="text-sm font-medium text-gray-900">{user.name}</span>
                            <p className="text-xs text-gray-600">{user.role}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* 组织架构树 */}
                <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                  <OrgTreeNode
                    node={orgTree}
                    level={0}
                    expandedNodes={expandedNodes}
                    selectedUsers={selectedUsers}
                    onToggleNode={toggleNode}
                    onToggleUser={toggleUserSelection}
                  />
                </div>

                {/* 已选择的用户 */}
                {selectedUsers.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h6 className="text-sm font-medium text-green-900 mb-3">
                      已选择的导师 ({selectedUsers.length})
                    </h6>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {getSelectedUsersInfo().map(user => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-2 bg-white border border-green-200 rounded"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{user.avatar}</span>
                            <div>
                              <span className="text-sm font-medium">{user.name}</span>
                              <p className="text-xs text-gray-600">{user.role}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => toggleUserSelection(user.id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            移除
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
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
                      ...actualConfig?.reporting,
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
                        ...actualConfig?.reporting,
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
                            ...actualConfig?.reporting,
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
                          ...actualConfig?.reporting,
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
                      ...actualConfig?.supervision,
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
                          const currentList = actualConfig?.supervision?.approvalRequired || [];
                          const newList = e.target.checked
                            ? [...currentList, operation]
                            : currentList.filter(op => op !== operation);

                          updateMentorConfig({
                            supervision: {
                              ...actualConfig?.supervision,
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
                  {actualConfig?.mentor?.name || '未选择'}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">汇报周期：</span>
                <p className="text-gray-600">
                  {actualConfig?.reporting?.enabled
                    ? (advancedConfig.mentor.reporting.schedule || '未设置')
                    : '已禁用'
                  }
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">监督模式：</span>
                <p className="text-gray-600">
                  {actualConfig?.supervision?.reviewDecisions
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

// 组织架构树节点组件
interface OrgTreeNodeProps {
  node: any;
  level: number;
  expandedNodes: Set<string>;
  selectedUsers: string[];
  onToggleNode: (nodeId: string) => void;
  onToggleUser: (userId: string) => void;
}

const OrgTreeNode: React.FC<OrgTreeNodeProps> = ({
  node,
  level,
  expandedNodes,
  selectedUsers,
  onToggleNode,
  onToggleUser
}) => {
  const isExpanded = expandedNodes.has(node.id);
  const hasChildren = node.children && node.children.length > 0;
  const hasUsers = node.users && node.users.length > 0;

  return (
    <div>
      {/* 节点标题 */}
      <div
        className={`flex items-center gap-2 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100`}
        style={{ paddingLeft: `${level * 20 + 12}px` }}
      >
        {hasChildren && (
          <button
            onClick={() => onToggleNode(node.id)}
            className="flex items-center justify-center w-4 h-4 text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
        )}

        <div className="flex items-center gap-2">
          <span className="text-sm">
            {node.type === 'company' ? '🏢' :
             node.type === 'department' ? '🏛️' :
             node.type === 'team' ? '👥' : '📁'}
          </span>
          <span className="text-sm font-medium text-gray-900">{node.name}</span>
          {hasUsers && (
            <span className="text-xs text-gray-500">({node.users.length}人)</span>
          )}
        </div>
      </div>

      {/* 展开的内容 */}
      {isExpanded && (
        <div>
          {/* 用户列表 */}
          {hasUsers && (
            <div style={{ paddingLeft: `${(level + 1) * 20 + 12}px` }}>
              {node.users.map((user: any) => (
                <label
                  key={user.id}
                  className="flex items-center gap-3 p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => onToggleUser(user.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-lg">{user.avatar}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{user.name}</span>
                      {selectedUsers.includes(user.id) && (
                        <UserCheck className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600">{user.role}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* 子节点 */}
          {hasChildren &&
            node.children.map((child: any) => (
              <OrgTreeNode
                key={child.id}
                node={child}
                level={level + 1}
                expandedNodes={expandedNodes}
                selectedUsers={selectedUsers}
                onToggleNode={onToggleNode}
                onToggleUser={onToggleUser}
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default MentorConfig;