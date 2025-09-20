/**
 * Prompt模板库组件
 * 提供模板浏览、搜索、选择等功能
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Search,
  Filter,
  Star,
  Users,
  GitFork,
  Clock,
  ChevronDown,
  Grid,
  List,
  Bookmark,
  Eye,
  Copy,
  Download,
  MoreHorizontal
} from 'lucide-react';
import { usePromptTemplate } from '../../hooks/usePromptTemplate';
import type { PromptTemplate } from '../../types';

export interface PromptTemplateLibraryProps {
  onTemplateSelect?: (template: PromptTemplate) => void;
  onTemplatePreview?: (template: PromptTemplate) => void;
  className?: string;
  compact?: boolean;
}

export const PromptTemplateLibrary: React.FC<PromptTemplateLibraryProps> = ({
  onTemplateSelect,
  onTemplatePreview,
  className = '',
  compact = false
}) => {
  const {
    templates,
    selectedTemplate,
    templateCategories,
    isLoading,
    error,
    selectTemplate,
    favoriteTemplate,
    forkTemplate,
    filterTemplatesByCategory,
    searchTemplates,
    getFeaturedTemplates,
    getTemplatesByUsage,
    getTemplateStats
  } = usePromptTemplate();

  // 本地状态
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'usage' | 'rating' | 'recent' | 'name'>('usage');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // 过滤和排序模板
  const filteredAndSortedTemplates = useMemo(() => {
    let filtered = templates;

    // 搜索过滤
    if (searchQuery.trim()) {
      filtered = searchTemplates(searchQuery);
    }

    // 分类过滤
    if (selectedCategory !== 'all') {
      filtered = filterTemplatesByCategory(selectedCategory);
    }

    // 排序
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'usage':
          return b.usage.count - a.usage.count;
        case 'rating':
          return b.usage.rating - a.usage.rating;
        case 'recent':
          return new Date(b.metadata.updatedAt).getTime() - new Date(a.metadata.updatedAt).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return sorted;
  }, [templates, searchQuery, selectedCategory, sortBy, searchTemplates, filterTemplatesByCategory]);

  // 推荐模板
  const featuredTemplates = useMemo(() => getFeaturedTemplates(), [getFeaturedTemplates]);

  // 处理模板选择
  const handleTemplateSelect = useCallback((template: PromptTemplate) => {
    selectTemplate(template);
    onTemplateSelect?.(template);
  }, [selectTemplate, onTemplateSelect]);

  // 处理模板预览
  const handleTemplatePreview = useCallback((template: PromptTemplate) => {
    onTemplatePreview?.(template);
  }, [onTemplatePreview]);

  // 处理收藏
  const handleFavorite = useCallback(async (template: PromptTemplate) => {
    try {
      await favoriteTemplate(template.id);
    } catch (error) {
      console.error('收藏失败:', error);
    }
  }, [favoriteTemplate]);

  // 处理分叉
  const handleFork = useCallback(async (template: PromptTemplate) => {
    try {
      const newName = prompt('请输入新模板名称:', `${template.name} - 副本`);
      if (newName) {
        await forkTemplate(template.id, newName);
      }
    } catch (error) {
      console.error('分叉失败:', error);
    }
  }, [forkTemplate]);

  // 渲染搜索栏
  const renderSearchBar = () => (
    <div className="flex items-center gap-3 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="搜索模板名称、描述或标签..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <button
        onClick={() => setShowFilters(!showFilters)}
        className={`p-2 border rounded-lg transition-colors ${
          showFilters ? 'bg-blue-50 border-blue-200' : 'border-gray-300 hover:bg-gray-50'
        }`}
      >
        <Filter className="h-4 w-4" />
      </button>

      <div className="flex border border-gray-300 rounded-lg">
        <button
          onClick={() => setViewMode('grid')}
          className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <Grid className="h-4 w-4" />
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`p-2 border-l border-gray-300 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <List className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  // 渲染过滤器
  const renderFilters = () => {
    if (!showFilters) return null;

    return (
      <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 分类过滤 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">分类</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部分类</option>
              {templateCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* 排序方式 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">排序</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="usage">使用量</option>
              <option value="rating">评分</option>
              <option value="recent">最近更新</option>
              <option value="name">名称</option>
            </select>
          </div>

          {/* 其他过滤选项 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">其他</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">仅显示收藏</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">高评分模板</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染推荐模板
  const renderFeaturedTemplates = () => {
    if (compact || featuredTemplates.length === 0) return null;

    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">推荐模板</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredTemplates.slice(0, 3).map(template => (
            <TemplateCard
              key={`featured-${template.id}`}
              template={template}
              variant="featured"
              onSelect={handleTemplateSelect}
              onPreview={handleTemplatePreview}
              onFavorite={handleFavorite}
              onFork={handleFork}
              isSelected={selectedTemplate?.id === template.id}
            />
          ))}
        </div>
      </div>
    );
  };

  // 渲染模板列表
  const renderTemplateList = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <TemplateSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            重试
          </button>
        </div>
      );
    }

    if (filteredAndSortedTemplates.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            {searchQuery || selectedCategory !== 'all'
              ? '没有找到符合条件的模板'
              : '暂无模板'
            }
          </p>
          {(searchQuery || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="text-blue-600 hover:text-blue-700"
            >
              清除筛选条件
            </button>
          )}
        </div>
      );
    }

    const gridClass = viewMode === 'grid'
      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
      : 'space-y-3';

    return (
      <div className={gridClass}>
        {filteredAndSortedTemplates.map(template => (
          <TemplateCard
            key={template.id}
            template={template}
            variant={viewMode}
            onSelect={handleTemplateSelect}
            onPreview={handleTemplatePreview}
            onFavorite={handleFavorite}
            onFork={handleFork}
            isSelected={selectedTemplate?.id === template.id}
            stats={getTemplateStats(template.id)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={`prompt-template-library ${className}`}>
      {!compact && (
        <>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">模板库</h2>
            <p className="text-gray-600">选择或创建Prompt模板来开始配置您的数字员工</p>
          </div>

          {renderSearchBar()}
          {renderFilters()}
          {renderFeaturedTemplates()}
        </>
      )}

      <div className="template-list">
        {!compact && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              所有模板 ({filteredAndSortedTemplates.length})
            </h3>
          </div>
        )}
        {renderTemplateList()}
      </div>
    </div>
  );
};

// 模板卡片组件
interface TemplateCardProps {
  template: PromptTemplate;
  variant: 'grid' | 'list' | 'featured';
  onSelect: (template: PromptTemplate) => void;
  onPreview: (template: PromptTemplate) => void;
  onFavorite: (template: PromptTemplate) => void;
  onFork: (template: PromptTemplate) => void;
  isSelected: boolean;
  stats?: any;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  variant,
  onSelect,
  onPreview,
  onFavorite,
  onFork,
  isSelected,
  stats
}) => {
  const [showActions, setShowActions] = useState(false);

  if (variant === 'list') {
    return (
      <div className={`flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
      }`}>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 truncate">{template.name}</h4>
              <p className="text-sm text-gray-500 truncate mt-1">{template.description}</p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <span className="inline-flex items-center text-xs text-gray-500">
                <Star className="h-3 w-3 mr-1" />
                {template.usage.rating.toFixed(1)}
              </span>
              <span className="inline-flex items-center text-xs text-gray-500">
                <Users className="h-3 w-3 mr-1" />
                {template.usage.count}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-xs text-gray-500">{template.category}</span>
            <div className="flex gap-1">
              {template.metadata.tags.slice(0, 3).map(tag => (
                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => onPreview(template)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => onSelect(template)}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            选择
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`template-card border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer ${
        isSelected ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'
      } ${variant === 'featured' ? 'bg-gradient-to-br from-blue-50 to-purple-50' : 'bg-white'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={() => onSelect(template)}
    >
      {/* 头部 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate">{template.name}</h4>
          <p className="text-xs text-gray-500 mt-1">{template.category}</p>
        </div>
        <div className={`flex items-center gap-1 transition-opacity ${
          showActions ? 'opacity-100' : 'opacity-0'
        }`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavorite(template);
            }}
            className="p-1 text-gray-400 hover:text-yellow-500 rounded"
          >
            <Bookmark className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview(template);
            }}
            className="p-1 text-gray-400 hover:text-blue-500 rounded"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFork(template);
            }}
            className="p-1 text-gray-400 hover:text-green-500 rounded"
          >
            <GitFork className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 描述 */}
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{template.description}</p>

      {/* 标签 */}
      <div className="flex flex-wrap gap-1 mb-4">
        {template.metadata.tags.slice(0, 3).map(tag => (
          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
            {tag}
          </span>
        ))}
        {template.metadata.tags.length > 3 && (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
            +{template.metadata.tags.length - 3}
          </span>
        )}
      </div>

      {/* 统计信息 */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center">
            <Star className="h-3 w-3 mr-1" />
            {template.usage.rating.toFixed(1)}
          </span>
          <span className="flex items-center">
            <Users className="h-3 w-3 mr-1" />
            {template.usage.count}
          </span>
          {stats && (
            <span className="flex items-center">
              <GitFork className="h-3 w-3 mr-1" />
              {stats.slotCount} slots
            </span>
          )}
        </div>
        <span className="flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          {new Date(template.metadata.updatedAt).toLocaleDateString()}
        </span>
      </div>

      {/* 社交证明 */}
      {variant === 'featured' && template.socialProof.usedByTeams.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            被 {template.socialProof.usedByTeams.slice(0, 2).join('、')} 等团队使用
          </p>
        </div>
      )}
    </div>
  );
};

// 骨架屏组件
const TemplateSkeleton: React.FC = () => (
  <div className="border border-gray-200 rounded-lg p-4 animate-pulse">
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="w-6 h-6 bg-gray-200 rounded"></div>
    </div>
    <div className="space-y-2 mb-4">
      <div className="h-3 bg-gray-200 rounded"></div>
      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
    </div>
    <div className="flex gap-2 mb-4">
      <div className="h-6 bg-gray-200 rounded w-16"></div>
      <div className="h-6 bg-gray-200 rounded w-12"></div>
      <div className="h-6 bg-gray-200 rounded w-20"></div>
    </div>
    <div className="flex justify-between">
      <div className="h-4 bg-gray-200 rounded w-24"></div>
      <div className="h-4 bg-gray-200 rounded w-16"></div>
    </div>
  </div>
);

export default PromptTemplateLibrary;