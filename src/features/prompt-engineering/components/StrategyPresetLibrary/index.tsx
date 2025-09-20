/**
 * 策略预设库组件
 * 管理压缩策略和注入策略的预设，支持创建、编辑、分享和导入
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  Copy,
  Download,
  Upload,
  Star,
  StarOff,
  Settings,
  Zap,
  BarChart3,
  Filter,
  Search,
  Share2,
  Check,
  AlertTriangle,
  Info,
  Tag,
  Clock,
  TrendingUp,
  Users
} from 'lucide-react';
import { usePromptEngineeringStore } from '../../stores/promptEngineeringStore';
import type { CompressionStrategy, InjectionStrategy, ConfigPreset } from '../../types';

export interface StrategyPresetLibraryProps {
  className?: string;
  type: 'compression' | 'injection' | 'both';
  showBuiltIn?: boolean;
  showUserCreated?: boolean;
  allowCreate?: boolean;
  allowEdit?: boolean;
  compact?: boolean;
  onPresetSelect?: (preset: ConfigPreset) => void;
}

export const StrategyPresetLibrary: React.FC<StrategyPresetLibraryProps> = ({
  className = '',
  type = 'both',
  showBuiltIn = true,
  showUserCreated = true,
  allowCreate = true,
  allowEdit = true,
  compact = false,
  onPresetSelect
}) => {
  const {
    compressionPresets,
    injectionPresets,
    configPresets,
    applyCompressionPreset,
    applyInjectionPreset
  } = usePromptEngineeringStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'usage' | 'rating' | 'recent'>('usage');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPreset, setEditingPreset] = useState<ConfigPreset | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // 构建预设列表
  const allPresets = useMemo(() => {
    const presets: ConfigPreset[] = [];

    // 添加压缩策略预设
    if (type === 'compression' || type === 'both') {
      compressionPresets.forEach(strategy => {
        presets.push({
          id: `compression-${strategy.id}`,
          name: strategy.name,
          description: `压缩率: ${Math.round((1 - strategy.config.compressionRatio) * 100)}%, 质量阈值: ${Math.round(strategy.config.qualityThreshold * 100)}%`,
          type: 'compression',
          config: { compressionStrategy: strategy },
          category: strategy.algorithm === 'semantic' ? '语义压缩' :
                   strategy.algorithm === 'syntactic' ? '语法压缩' : '混合压缩',
          isBuiltIn: true,
          usage: {
            count: Math.floor(Math.random() * 1000),
            rating: 4.0 + Math.random()
          }
        });
      });
    }

    // 添加注入策略预设
    if (type === 'injection' || type === 'both') {
      injectionPresets.forEach(strategy => {
        presets.push({
          id: `injection-${strategy.id}`,
          name: strategy.name,
          description: `注入时机: ${strategy.timing}, 超时: ${strategy.performance.timeout}ms`,
          type: 'injection',
          config: { injectionStrategy: strategy },
          category: strategy.timing === 'immediate' ? '立即注入' :
                   strategy.timing === 'lazy' ? '延迟注入' : '缓存注入',
          isBuiltIn: true,
          usage: {
            count: Math.floor(Math.random() * 800),
            rating: 3.8 + Math.random()
          }
        });
      });
    }

    // 添加用户自定义预设
    if (showUserCreated) {
      presets.push(...configPresets.filter(p =>
        (type === 'both') ||
        (type === 'compression' && p.type === 'compression') ||
        (type === 'injection' && p.type === 'injection')
      ));
    }

    return presets;
  }, [type, compressionPresets, injectionPresets, configPresets, showUserCreated]);

  // 过滤和排序预设
  const filteredPresets = useMemo(() => {
    let filtered = allPresets;

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(preset =>
        preset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        preset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        preset.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 分类过滤
    if (filterCategory !== 'all') {
      filtered = filtered.filter(preset => preset.category === filterCategory);
    }

    // 内置/自定义过滤
    if (!showBuiltIn) {
      filtered = filtered.filter(preset => !preset.isBuiltIn);
    }

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'usage':
          return b.usage.count - a.usage.count;
        case 'rating':
          return b.usage.rating - a.usage.rating;
        case 'recent':
          return new Date().getTime() - new Date().getTime(); // 模拟时间排序
        default:
          return 0;
      }
    });

    return filtered;
  }, [allPresets, searchTerm, filterCategory, showBuiltIn, sortBy]);

  // 获取分类列表
  const categories = useMemo(() => {
    const cats = Array.from(new Set(allPresets.map(p => p.category)));
    return ['all', ...cats];
  }, [allPresets]);

  const handlePresetApply = useCallback((preset: ConfigPreset) => {
    if (preset.type === 'compression' && preset.config.compressionStrategy) {
      applyCompressionPreset(preset.config.compressionStrategy.id);
    } else if (preset.type === 'injection' && preset.config.injectionStrategy) {
      applyInjectionPreset(preset.config.injectionStrategy.id);
    }

    onPresetSelect?.(preset);
  }, [applyCompressionPreset, applyInjectionPreset, onPresetSelect]);

  const handleToggleFavorite = useCallback((presetId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(presetId)) {
        newFavorites.delete(presetId);
      } else {
        newFavorites.add(presetId);
      }
      return newFavorites;
    });
  }, []);

  const getEffectivenessScore = useCallback((preset: ConfigPreset): number => {
    if (preset.type === 'compression' && preset.config.compressionStrategy) {
      const { compressionRatio, qualityThreshold } = preset.config.compressionStrategy.config;
      return Math.round((1 - compressionRatio) * qualityThreshold * 100);
    } else if (preset.type === 'injection' && preset.config.injectionStrategy) {
      const { timing, performance } = preset.config.injectionStrategy;
      const speedScore = timing === 'immediate' ? 1 : timing === 'lazy' ? 0.7 : 0.9;
      const reliabilityScore = Math.min(1, 5000 / performance.timeout);
      return Math.round(speedScore * reliabilityScore * 100);
    }
    return 75; // 默认分数
  }, []);

  const renderSearchAndFilters = () => {
    return (
      <div className="space-y-4">
        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索预设..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 过滤和排序 */}
        <div className="flex gap-3">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? '全部分类' : cat}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="usage">使用次数</option>
            <option value="rating">评分</option>
            <option value="name">名称</option>
            <option value="recent">最近更新</option>
          </select>

          {allowCreate && (
            <button
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              {compact ? '新建' : '创建预设'}
            </button>
          )}
        </div>

        {/* 统计信息 */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>总计: {allPresets.length}</span>
          <span>已过滤: {filteredPresets.length}</span>
          <span>收藏: {favorites.size}</span>
        </div>
      </div>
    );
  };

  const renderPresetCard = (preset: ConfigPreset) => {
    const isFavorite = favorites.has(preset.id);
    const effectiveness = getEffectivenessScore(preset);

    return (
      <div
        key={preset.id}
        className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-gray-900">{preset.name}</h4>

              {/* 类型标识 */}
              <span className={`px-2 py-1 text-xs rounded ${
                preset.type === 'compression'
                  ? 'bg-blue-100 text-blue-700'
                  : preset.type === 'injection'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-purple-100 text-purple-700'
              }`}>
                {preset.type === 'compression' ? '压缩' :
                 preset.type === 'injection' ? '注入' : '完整'}
              </span>

              {preset.isBuiltIn && (
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                  内置
                </span>
              )}
            </div>

            <p className="text-sm text-gray-600 mb-2">{preset.description}</p>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {preset.category}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {preset.usage.count} 次使用
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                {preset.usage.rating.toFixed(1)}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {/* 收藏按钮 */}
            <button
              onClick={() => handleToggleFavorite(preset.id)}
              className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                isFavorite ? 'text-yellow-500' : 'text-gray-400'
              }`}
            >
              {isFavorite ? <Star className="h-4 w-4 fill-current" /> : <StarOff className="h-4 w-4" />}
            </button>

            {/* 效果评分 */}
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">效果评分</div>
              <div className="flex items-center gap-1">
                <div className="w-12 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      effectiveness > 70 ? 'bg-green-500' :
                      effectiveness > 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${effectiveness}%` }}
                  />
                </div>
                <span className="text-xs font-medium">{effectiveness}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex gap-2">
            <button
              onClick={() => handlePresetApply(preset)}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              <Check className="h-3 w-3" />
              应用
            </button>

            <button
              onClick={() => {/* TODO: 复制预设 */}}
              className="flex items-center gap-1 px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors"
            >
              <Copy className="h-3 w-3" />
              复制
            </button>

            {allowEdit && !preset.isBuiltIn && (
              <>
                <button
                  onClick={() => setEditingPreset(preset)}
                  className="flex items-center gap-1 px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors"
                >
                  <Edit3 className="h-3 w-3" />
                  编辑
                </button>

                <button
                  onClick={() => {/* TODO: 删除预设 */}}
                  className="flex items-center gap-1 px-3 py-1 border border-red-300 text-red-700 text-sm rounded hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                  删除
                </button>
              </>
            )}
          </div>

          <div className="flex gap-1">
            <button
              onClick={() => {/* TODO: 导出预设 */}}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="导出"
            >
              <Download className="h-4 w-4" />
            </button>

            <button
              onClick={() => {/* TODO: 分享预设 */}}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="分享"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderCreateDialog = () => {
    if (!showCreateDialog) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">创建策略预设</h3>
            <button
              onClick={() => setShowCreateDialog(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">创建自定义预设</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    基于当前的策略配置创建预设，可以保存和分享给团队使用。
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  预设名称
                </label>
                <input
                  type="text"
                  placeholder="输入预设名称"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  描述
                </label>
                <textarea
                  placeholder="描述这个预设的用途和特点"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  分类
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="custom">自定义</option>
                  <option value="performance">性能优化</option>
                  <option value="quality">质量优先</option>
                  <option value="balanced">平衡型</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="sharePreset"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="sharePreset" className="text-sm text-gray-700">
                  允许团队成员使用此预设
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  // TODO: 实现创建逻辑
                  setShowCreateDialog(false);
                }}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                创建预设
              </button>
              <button
                onClick={() => setShowCreateDialog(false)}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 搜索和过滤 */}
      {!compact && renderSearchAndFilters()}

      {/* 预设列表 */}
      <div className={`${compact ? 'space-y-2' : 'space-y-3'}`}>
        {filteredPresets.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>没有找到匹配的预设</p>
            {allowCreate && (
              <button
                onClick={() => setShowCreateDialog(true)}
                className="mt-3 text-blue-600 hover:text-blue-700"
              >
                创建第一个预设
              </button>
            )}
          </div>
        ) : (
          filteredPresets.map(renderPresetCard)
        )}
      </div>

      {/* 创建对话框 */}
      {renderCreateDialog()}
    </div>
  );
};

export default StrategyPresetLibrary;