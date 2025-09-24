import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Settings, Play, Pause, Eye, Edit2, Trash2, TestTube, X } from 'lucide-react';
import { MCPTool, MCPToolStatus, CreateMCPToolForm } from '../types';
import { mockMCPTools, mockToolUsageStats } from '../data/mockToolsData';
import CreateMCPTool from '../components/CreateMCPTool';
import ToolTestConsole from '../components/ToolTestConsole';
import { 
  PageLayout, 
  PageHeader, 
  PageContent, 
  MetricCard, 
  Card, 
  CardHeader, 
  CardBody, 
  Button, 
  Badge,
  EmptyState,
  FilterSection
} from '../components/ui';

// 状态映射
const getStatusBadgeVariant = (status: MCPToolStatus): 'success' | 'warning' | 'error' | 'info' | 'gray' => {
  const variants = {
    draft: 'gray' as const,
    configuring: 'info' as const,
    testing: 'warning' as const,
    pending_release: 'info' as const,
    published: 'success' as const,
    maintenance: 'error' as const,
    retired: 'gray' as const
  };
  return variants[status] || 'gray';
};

// 状态中文映射
const getStatusText = (status: MCPToolStatus): string => {
  const texts = {
    draft: '草稿',
    configuring: '配置中',
    testing: '测试中',
    pending_release: '待发布',
    published: '已发布',
    maintenance: '维护中',
    retired: '已下线'
  };
  return texts[status] || status;
};

// 连接类型图标
const getConnectionTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    stdio: '🔌',
    sse: '📡',
    http: '🌐'
  };
  return icons[type] || '❓';
};

const ToolManagement: React.FC = () => {
  const [tools, setTools] = useState<MCPTool[]>(mockMCPTools);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<MCPToolStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedTool, setSelectedTool] = useState<MCPTool | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTool, setEditingTool] = useState<MCPTool | null>(null);
  const [showTestConsole, setShowTestConsole] = useState(false);
  const [testingTool, setTestingTool] = useState<MCPTool | null>(null);

  // 筛选工具
  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesSearch = tool.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tool.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || tool.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || tool.category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [tools, searchTerm, statusFilter, categoryFilter]);

  // 获取分类列表
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(tools.map(tool => tool.category))];
    return uniqueCategories.sort();
  }, [tools]);

  // 创建工具
  const handleCreateTool = (formData: CreateMCPToolForm) => {
    const newTool: MCPTool = {
      id: `tool_${Date.now()}`,
      name: formData.name,
      displayName: formData.displayName,
      description: formData.description,
      version: '1.0.0',
      author: '当前用户',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
      statusHistory: [],
      config: {
        connectionType: formData.connectionType,
        stdio: formData.stdioConfig,
        network: formData.networkConfig ? {
          ...formData.networkConfig,
          authentication: formData.networkConfig.authentication ? {
            ...formData.networkConfig.authentication,
            type: formData.networkConfig.authentication.type as 'bearer' | 'api_key' | 'oauth2'
          } : undefined
        } : undefined,
        security: {
          sandbox: formData.enableSandbox,
          networkRestrictions: [],
          resourceLimits: {},
          rateLimiting: formData.rateLimiting
        }
      },
      capabilities: [], // 后续通过自动发现填充
      permissions: {
        allowedDepartments: formData.allowedDepartments,
        requiresApproval: formData.requiresApproval
      },
      versions: [],
      currentVersion: '1.0.0',
      testing: {
        testCases: formData.testCases.map((tc, index) => ({
          ...tc,
          id: `test_${Date.now()}_${index}`,
          createdAt: new Date().toISOString(),
          createdBy: '当前用户'
        })),
        testEnvironment: 'dev'
      },
      tags: formData.tags,
      category: formData.category
    };

    setTools(prev => [...prev, newTool]);
    setShowCreateModal(false);
    console.log('创建新工具:', newTool);
  };

  // 编辑工具
  const handleEditTool = (formData: CreateMCPToolForm) => {
    if (!editingTool) return;
    
    const updatedTool: MCPTool = {
      ...editingTool,
      name: formData.name,
      displayName: formData.displayName,
      description: formData.description,
      updatedAt: new Date().toISOString(),
      config: {
        connectionType: formData.connectionType,
        stdio: formData.stdioConfig,
        network: formData.networkConfig ? {
          ...formData.networkConfig,
          authentication: formData.networkConfig.authentication ? {
            ...formData.networkConfig.authentication,
            type: formData.networkConfig.authentication.type as 'bearer' | 'api_key' | 'oauth2'
          } : undefined
        } : undefined,
        security: {
          sandbox: formData.enableSandbox,
          networkRestrictions: editingTool.config.security?.networkRestrictions || [],
          resourceLimits: editingTool.config.security?.resourceLimits || {},
          rateLimiting: formData.rateLimiting
        }
      },
      permissions: {
        allowedDepartments: formData.allowedDepartments,
        requiresApproval: formData.requiresApproval
      },
      testing: {
        ...editingTool.testing,
        testCases: formData.testCases.map((tc, index) => ({
          ...tc,
          id: `test_${Date.now()}_${index}`,
          createdAt: new Date().toISOString(),
          createdBy: '当前用户'
        }))
      },
      tags: formData.tags,
      category: formData.category
    };

    setTools(prev => prev.map(t => t.id === editingTool.id ? updatedTool : t));
    setShowEditModal(false);
    setEditingTool(null);
    console.log('编辑工具:', updatedTool);
  };

  // 工具操作
  const handleToolAction = (tool: MCPTool, action: string) => {
    switch (action) {
      case 'test':
        setTestingTool(tool);
        setShowTestConsole(true);
        break;
      case 'edit':
        setEditingTool(tool);
        setShowEditModal(true);
        break;
      case 'delete':
        if (confirm(`确定要删除工具 "${tool.displayName}" 吗？`)) {
          setTools(prev => prev.filter(t => t.id !== tool.id));
        }
        break;
      case 'publish':
        setTools(prev => prev.map(t => 
          t.id === tool.id 
            ? { 
                ...t, 
                status: 'published',
                statusHistory: [
                  ...t.statusHistory,
                  {
                    id: `hist_${Date.now()}`,
                    fromStatus: t.status,
                    toStatus: 'published',
                    timestamp: new Date().toISOString(),
                    operator: '当前用户',
                    reason: '手动发布'
                  }
                ]
              }
            : t
        ));
        break;
      case 'maintenance':
        setTools(prev => prev.map(t => 
          t.id === tool.id 
            ? { 
                ...t, 
                status: 'maintenance',
                statusHistory: [
                  ...t.statusHistory,
                  {
                    id: `hist_${Date.now()}`,
                    fromStatus: t.status,
                    toStatus: 'maintenance',
                    timestamp: new Date().toISOString(),
                    operator: '当前用户',
                    reason: '进入维护模式'
                  }
                ]
              }
            : t
        ));
        break;
      default:
        console.log(`执行操作: ${action} on tool: ${tool.name}`);
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title="工具管理"
        subtitle="MCP协议工具的全生命周期管理"
      >
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4" />
          注册新工具
        </Button>
      </PageHeader>

      <PageContent>

        {/* 统计卡片 */}
        <div className="grid-responsive">
          <MetricCard
            title="总工具数"
            value={mockToolUsageStats.totalTools}
            icon={Settings}
            color="blue"
          />
          
          <MetricCard
            title="已发布"
            value={mockToolUsageStats.publishedTools}
            icon={Play}
            color="green"
          />
          
          <MetricCard
            title="测试中"
            value={mockToolUsageStats.testingTools}
            icon={Pause}
            color="yellow"
          />
          
          <MetricCard
            title="平均响应时间"
            value={`${mockToolUsageStats.avgResponseTime}ms`}
            icon={Eye}
            color="purple"
          />
        </div>

        {/* 搜索和筛选 */}
        <FilterSection
          searchProps={{
            value: searchTerm,
            onChange: setSearchTerm,
            placeholder: "搜索工具名称、描述或标签..."
          }}
          filters={[
            {
              key: 'status',
              placeholder: '全部状态',
              showIcon: true,
              value: statusFilter,
              onChange: (value) => setStatusFilter(value as MCPToolStatus | 'all'),
              options: [
                { value: 'draft', label: '草稿', count: tools.filter(t => t.status === 'draft').length },
                { value: 'configuring', label: '配置中', count: tools.filter(t => t.status === 'configuring').length },
                { value: 'testing', label: '测试中', count: tools.filter(t => t.status === 'testing').length },
                { value: 'pending_release', label: '待发布', count: tools.filter(t => t.status === 'pending_release').length },
                { value: 'published', label: '已发布', count: tools.filter(t => t.status === 'published').length },
                { value: 'maintenance', label: '维护中', count: tools.filter(t => t.status === 'maintenance').length },
                { value: 'retired', label: '已下线', count: tools.filter(t => t.status === 'retired').length }
              ],
              showCount: true
            },
            {
              key: 'category',
              placeholder: '全部分类',
              value: categoryFilter,
              onChange: setCategoryFilter,
              options: categories.map(category => ({
                value: category,
                label: category,
                count: tools.filter(t => t.category === category).length
              })),
              showCount: true
            }
          ]}
        />

        {/* 工具列表 */}
        <Card>
          <CardHeader>
            <h2 className="card-title">
              工具列表 ({filteredTools.length})
            </h2>
          </CardHeader>
          <CardBody>
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">工具信息</th>
                    <th className="table-header-cell">状态</th>
                    <th className="table-header-cell">连接类型</th>
                    <th className="table-header-cell">能力</th>
                    <th className="table-header-cell">性能指标</th>
                    <th className="table-header-cell">操作</th>
                  </tr>
                </thead>
                <tbody className="table-body">
              {filteredTools.map((tool) => (
                <tr key={tool.id} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-start space-x-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-gray-900">
                            {tool.displayName}
                          </h3>
                          <span className="text-xs text-gray-500">v{tool.version}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1 max-w-md">
                          {tool.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {tool.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="info">
                              {tag}
                            </Badge>
                          ))}
                          {tool.tags.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{tool.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <Badge variant={getStatusBadgeVariant(tool.status)}>
                      {getStatusText(tool.status)}
                    </Badge>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {getConnectionTypeIcon(tool.config.connectionType)}
                      </span>
                      <span className="text-sm text-gray-900 capitalize">
                        {tool.config.connectionType}
                      </span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="text-sm text-gray-900">
                      {tool.capabilities.length} 个能力
                    </div>
                    <div className="text-xs text-gray-500">
                      {tool.capabilities.map(cap => cap.type).join(', ')}
                    </div>
                  </td>
                  <td className="table-cell">
                    {tool.metrics ? (
                      <div className="text-sm">
                        <div className="text-gray-900">
                          {(tool.metrics.successRate * 100).toFixed(1)}% 成功率
                        </div>
                        <div className="text-gray-500">
                          {tool.metrics.avgResponseTime}ms 平均响应
                        </div>
                        <div className="text-gray-500">
                          {tool.metrics.totalCalls.toLocaleString()} 次调用
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">暂无数据</span>
                    )}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTool(tool)}
                        title="查看详情"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToolAction(tool, 'edit')}
                        title="编辑"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      {(tool.status === 'testing' || tool.status === 'published') && tool.capabilities.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToolAction(tool, 'test')}
                          className="text-success-600 hover:text-success-700 hover:bg-success-50"
                          title="测试工具"
                        >
                          <TestTube className="h-4 w-4" />
                        </Button>
                      )}
                      {tool.status === 'testing' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToolAction(tool, 'publish')}
                          className="text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                          title="发布工具"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      {tool.status === 'published' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToolAction(tool, 'maintenance')}
                          className="text-warning-600 hover:text-warning-700 hover:bg-warning-50"
                          title="进入维护"
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
                      )}
                      {tool.status !== 'retired' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToolAction(tool, 'delete')}
                          className="text-error-600 hover:text-error-700 hover:bg-error-50"
                          title="删除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
                </tbody>
              </table>
              
              {filteredTools.length === 0 && (
                <EmptyState
                  icon="🔍"
                  title="未找到匹配的工具"
                  description="尝试调整搜索条件或筛选器"
                />
              )}
            </div>
          </CardBody>
        </Card>

        {/* 工具详情模态框 */}
        {selectedTool && createPortal(
          <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]" style={{margin: 0, width: '100vw', height: '100vh'}}>
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* 头部 */}
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    工具详情 - {selectedTool.displayName}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">查看工具的详细信息和配置</p>
                </div>
                <button
                  onClick={() => setSelectedTool(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 基础信息 */}
                  <div>
                    <h4 className="card-subtitle mb-3">基础信息</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">工具名称</span>
                        <span className="font-medium">{selectedTool.name}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">显示名称</span>
                        <span className="font-medium">{selectedTool.displayName}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">版本</span>
                        <span className="font-medium">{selectedTool.version}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">作者</span>
                        <span className="font-medium">{selectedTool.author}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">分类</span>
                        <span className="font-medium">{selectedTool.category}</span>
                      </div>
                      <div className="py-2">
                        <div className="text-gray-600 mb-2">描述</div>
                        <p className="text-sm text-gray-900">{selectedTool.description}</p>
                      </div>
                    </div>
                  </div>
                
                  {/* 配置信息 */}
                  <div>
                    <h4 className="card-subtitle mb-3">配置信息</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">连接类型</span>
                        <span className="font-medium">{selectedTool.config.connectionType}</span>
                      </div>
                      {selectedTool.config.network && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">URL</span>
                          <span className="font-medium">{selectedTool.config.network.url}</span>
                        </div>
                      )}
                      {selectedTool.config.stdio && (
                        <div className="py-2 border-b border-gray-100">
                          <div className="text-gray-600 mb-2">命令</div>
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">{selectedTool.config.stdio.command}</code>
                        </div>
                      )}
                      {selectedTool.config.security && (
                        <>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">沙箱</span>
                            <Badge variant={selectedTool.config.security.sandbox ? 'success' : 'gray'}>
                              {selectedTool.config.security.sandbox ? '启用' : '禁用'}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">QPS限制</span>
                            <span className="font-medium">{selectedTool.config.security.rateLimiting.globalQPS}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* 能力列表 */}
                <div className="mt-6">
                  <h4 className="card-subtitle mb-3">能力列表</h4>
                  <div className="space-y-3">
                    {selectedTool.capabilities.map((capability, index) => (
                      <Card key={index}>
                        <CardBody>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="info">{capability.type}</Badge>
                            <span className="font-medium">{capability.name}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{capability.description}</p>
                          {capability.schema && (
                            <details className="text-xs">
                              <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                                查看Schema
                              </summary>
                              <pre className="mt-2 bg-gray-50 p-3 rounded text-xs overflow-x-auto border">
{JSON.stringify(capability.schema, null, 2)}
                              </pre>
                            </details>
                          )}
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* 创建工具模态框 */}
        <CreateMCPTool
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTool}
        />

        {/* 编辑工具模态框 */}
        <CreateMCPTool
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingTool(null);
          }}
          onSubmit={handleEditTool}
          editingTool={editingTool}
        />

        {/* 测试控制台 */}
        {testingTool && (
          <ToolTestConsole
            tool={testingTool}
            isOpen={showTestConsole}
            onClose={() => {
              setShowTestConsole(false);
              setTestingTool(null);
            }}
          />
        )}
      </PageContent>
    </PageLayout>
  );
};

export default ToolManagement;