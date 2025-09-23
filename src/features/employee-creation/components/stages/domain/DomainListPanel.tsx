/**
 * 领域列表面板组件
 */

import React from 'react';
import { Plus, Power, Settings, Copy, Trash2, AlertCircle } from 'lucide-react';
import { useCreationStore } from '../../../stores/creationStore';
import type { DomainConfig } from '../../../types';

interface DomainListPanelProps {
  domains: DomainConfig[];
  selectedDomainId: string | null;
  onSelectDomain: (id: string) => void;
  onAddDomain: () => void;
  getDomainConfigStatus: (domain: DomainConfig) => {
    completed: number;
    total: number;
    percentage: number;
  };
}

const DomainListPanel: React.FC<DomainListPanelProps> = ({
  domains,
  selectedDomainId,
  onSelectDomain,
  onAddDomain,
  getDomainConfigStatus
}) => {
  const { toggleDomain, duplicateDomain, deleteDomain } = useCreationStore();

  // 领域卡片组件
  const DomainCard: React.FC<{ domain: DomainConfig }> = ({ domain }) => {
    const isSelected = selectedDomainId === domain.id;
    const status = getDomainConfigStatus(domain);

    return (
      <div
        className={`group relative border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
          isSelected
            ? 'border-indigo-500 bg-indigo-50 shadow-md'
            : 'border-gray-200 bg-white hover:border-gray-300'
        }`}
        onClick={() => onSelectDomain(domain.id)}
      >
        {/* 头部：图标、名称、状态 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-2xl flex-shrink-0">{domain.icon}</span>
            <div className="min-w-0 flex-1">
              <h4 className={`font-medium truncate ${isSelected ? 'text-indigo-900' : 'text-gray-900'}`}>
                {domain.name}
              </h4>
              <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                {domain.description}
              </p>
            </div>
          </div>

          {/* 启用/禁用开关 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleDomain(domain.id);
            }}
            className={`p-1.5 rounded-md transition-colors ${
              domain.enabled
                ? 'text-green-600 hover:bg-green-100'
                : 'text-gray-400 hover:bg-gray-100'
            }`}
            title={domain.enabled ? '点击禁用' : '点击启用'}
          >
            <Power className="h-4 w-4" />
          </button>
        </div>

        {/* 权重条 */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-500">权重</span>
            <span className={`font-medium ${isSelected ? 'text-indigo-700' : 'text-gray-700'}`}>
              {domain.weight}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500'
              }`}
              style={{ width: `${domain.weight}%` }}
            />
          </div>
        </div>

        {/* 配置进度 */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-500">配置完成度</span>
            <span className={`font-medium ${
              status.percentage >= 80 ? 'text-green-600' :
              status.percentage >= 40 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {status.completed}/{status.total}
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                status.percentage >= 80 ? 'bg-green-500' :
                status.percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${status.percentage}%` }}
            />
          </div>
        </div>

        {/* 标签 */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {domain.isDefault && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                默认
              </span>
            )}
            {!domain.enabled && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                已禁用
              </span>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                duplicateDomain(domain.id);
              }}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="复制领域"
            >
              <Copy className="h-3 w-3" />
            </button>
            {!domain.isDefault && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('确定要删除这个领域吗？此操作不可恢复。')) {
                    deleteDomain(domain.id);
                  }
                }}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="删除领域"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg h-full flex flex-col">
      {/* 头部 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">领域列表</h3>
          <span className="text-xs text-gray-500">{domains.length} 个领域</span>
        </div>

        <button
          onClick={onAddDomain}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-indigo-400 hover:text-indigo-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          添加新领域
        </button>
      </div>

      {/* 领域列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {domains.length === 0 ? (
          <div className="text-center py-8">
            <Settings className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">暂无领域配置</p>
          </div>
        ) : (
          domains.map(domain => (
            <DomainCard key={domain.id} domain={domain} />
          ))
        )}
      </div>

      {/* 底部统计 */}
      {domains.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>启用领域：</span>
              <span className="font-medium">
                {domains.filter(d => d.enabled).length} / {domains.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>总权重：</span>
              <span className="font-medium">
                {domains.reduce((sum, d) => sum + (d.enabled ? d.weight : 0), 0)}%
              </span>
            </div>
          </div>

          {domains.reduce((sum, d) => sum + (d.enabled ? d.weight : 0), 0) !== 100 && (
            <div className="mt-2 flex items-start gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
              <AlertCircle className="h-3 w-3 text-yellow-600 mt-0.5 flex-shrink-0" />
              <span className="text-yellow-700">
                建议调整领域权重，使启用领域的总权重接近100%
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DomainListPanel;