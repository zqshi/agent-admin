/**
 * 配置中心 - 配置总览和快速入口
 * 简化版本，作为配置项的概览和快速访问入口
 */

import React from 'react';
import {
  Settings,
  User,
  Shield,
  Brain,
  GitBranch,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  Edit3,
  BarChart3,
  FileText
} from 'lucide-react';
import type { DigitalEmployee } from '../../types/employee';
import { DataSourceIndicator } from '../common';

interface ConfigurationCenterProps {
  employee: DigitalEmployee;
  onSectionClick: (sectionId: string) => void;
}

// 配置概览项定义
interface ConfigOverviewItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'basic' | 'intelligent' | 'management';
  isCompleted: boolean;
  isRequired: boolean;
  badge?: string;
  lastModified?: string;
  status: 'complete' | 'incomplete' | 'needs-attention';
  quickInfo: string;
}

const ConfigurationCenter: React.FC<ConfigurationCenterProps> = ({
  employee,
  onSectionClick
}) => {

  // 检查配置状态和生成快速信息
  const getConfigStatus = (sectionId: string): { isCompleted: boolean; status: ConfigOverviewItem['status']; quickInfo: string } => {
    switch (sectionId) {
      case 'basic-info':
        const hasBasicInfo = !!(employee.name && employee.department);
        return {
          isCompleted: hasBasicInfo,
          status: hasBasicInfo ? 'complete' : 'incomplete',
          quickInfo: hasBasicInfo ? `${employee.name} · ${employee.department}` : '缺少基础信息'
        };
      case 'persona':
        const hasPersona = !!(employee.persona?.systemPrompt && employee.persona?.personality);
        return {
          isCompleted: hasPersona,
          status: hasPersona ? 'complete' : 'needs-attention',
          quickInfo: hasPersona ? `${employee.persona?.personality || '角色'}已配置` : '需要配置角色定义'
        };
      case 'permissions':
        const hasPermissions = (employee.permissions?.allowedTools?.length || 0) > 0;
        return {
          isCompleted: hasPermissions,
          status: hasPermissions ? 'complete' : 'needs-attention',
          quickInfo: hasPermissions ? `${employee.permissions?.allowedTools?.length || 0}项权限` : '需要配置权限'
        };
      case 'advanced':
        const hasAdvanced = !!(employee.advancedConfig?.promptTemplates?.length);
        return {
          isCompleted: hasAdvanced,
          status: hasAdvanced ? 'complete' : 'incomplete',
          quickInfo: hasAdvanced ? `${employee.advancedConfig?.promptTemplates?.length || 0}个模板` : '可选配置'
        };
      case 'version-management':
        return {
          isCompleted: true,
          status: 'complete',
          quickInfo: '版本控制可用'
        };
      default:
        return {
          isCompleted: false,
          status: 'incomplete',
          quickInfo: '未知状态'
        };
    }
  };

  // 配置概览项定义
  const configOverviewItems: ConfigOverviewItem[] = [
    // 基础配置
    {
      id: 'basic-info',
      title: '基础信息',
      description: '员工基本信息、状态管理',
      icon: User,
      category: 'basic',
      isRequired: true,
      lastModified: '2024-01-15',
      ...getConfigStatus('basic-info')
    },

    // 智能配置
    {
      id: 'persona',
      title: '人设定义',
      description: '角色定义、系统提示词、性格特征',
      icon: Brain,
      category: 'intelligent',
      isRequired: true,
      badge: 'AI',
      lastModified: '2024-01-14',
      ...getConfigStatus('persona')
    },
    {
      id: 'permissions',
      title: '权限配置',
      description: '访问权限、工具配置、安全策略',
      icon: Shield,
      category: 'intelligent',
      isRequired: true,
      lastModified: '2024-01-13',
      ...getConfigStatus('permissions')
    },
    {
      id: 'advanced',
      title: '高级配置',
      description: 'Prompt工程、多领域管理、优化设置',
      icon: Settings,
      category: 'intelligent',
      isRequired: false,
      badge: '技术',
      lastModified: '2024-01-12',
      ...getConfigStatus('advanced')
    },

    // 管理功能
    {
      id: 'version-management',
      title: '版本管理',
      description: '配置版本控制、智能建议、回滚管理',
      icon: GitBranch,
      category: 'management',
      isRequired: false,
      lastModified: '2024-01-10',
      ...getConfigStatus('version-management')
    }
  ];

  // 计算配置统计
  const getConfigStats = () => {
    const completed = configOverviewItems.filter(item => item.isCompleted).length;
    const total = configOverviewItems.length;
    const required = configOverviewItems.filter(item => item.isRequired).length;
    const requiredCompleted = configOverviewItems.filter(item => item.isRequired && item.isCompleted).length;

    return {
      completed,
      total,
      required,
      requiredCompleted,
      completionRate: Math.round((completed / total) * 100),
      requiredCompletionRate: Math.round((requiredCompleted / required) * 100)
    };
  };

  const stats = getConfigStats();

  // 渲染配置卡片
  const renderConfigCard = (item: ConfigOverviewItem) => {
    const StatusIcon = item.status === 'complete' ? CheckCircle :
                      item.status === 'needs-attention' ? AlertTriangle : Clock;

    const statusColor = item.status === 'complete' ? 'text-green-500' :
                       item.status === 'needs-attention' ? 'text-orange-500' : 'text-gray-400';

    const statusBgColor = item.status === 'complete' ? 'bg-green-50 border-green-200' :
                         item.status === 'needs-attention' ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200';

    return (
      <div
        key={item.id}
        onClick={() => onSectionClick(item.id)}
        className={`${statusBgColor} border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02]`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${item.status === 'complete' ? 'bg-green-100' : item.status === 'needs-attention' ? 'bg-orange-100' : 'bg-gray-100'}`}>
              <item.icon className={`h-5 w-5 ${statusColor}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900">{item.title}</h3>
                {item.badge && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                    {item.badge}
                  </span>
                )}
                {item.isRequired && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    必需
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusIcon className={`h-5 w-5 ${statusColor}`} />
            <ArrowRight className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DataSourceIndicator
              type="config"
              variant="inline"
              size="sm"
            />
            <span className="text-sm text-gray-500">{item.quickInfo}</span>
          </div>
          {item.lastModified && (
            <span className="text-xs text-gray-400">
              更新于 {item.lastModified}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 配置概览标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">配置中心</h2>
        </div>
        <DataSourceIndicator type="config" variant="badge" />
      </div>


      {/* 配置项卡片列表 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <FileText className="h-5 w-5 text-gray-600" />
          配置项目
        </h3>

        <div className="grid gap-4">
          {configOverviewItems.map(renderConfigCard)}
        </div>
      </div>

    </div>
  );
};

export default ConfigurationCenter;