import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2, TestTube, Info, AlertTriangle } from 'lucide-react';
import { CreateMCPToolForm, MCPConnectionType, ToolTestCase, MCPTool } from '../types';

interface CreateMCPToolProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMCPToolForm) => void;
  editingTool?: MCPTool | null;
}

const CreateMCPTool: React.FC<CreateMCPToolProps> = ({ isOpen, onClose, onSubmit, editingTool }) => {
  const [formData, setFormData] = useState<CreateMCPToolForm>({
    name: '',
    displayName: '',
    description: '',
    category: '',
    tags: [],
    connectionType: 'http',
    enableSandbox: true,
    rateLimiting: {
      globalQPS: 10,
      perUserQPS: 1
    },
    allowedDepartments: [],
    requiresApproval: false,
    testCases: []
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [newTag, setNewTag] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveryResult, setDiscoveryResult] = useState<any>(null);

  // 编辑模式下初始化表单数据
  useEffect(() => {
    if (editingTool) {
      setFormData({
        name: editingTool.name,
        displayName: editingTool.displayName,
        description: editingTool.description,
        category: editingTool.category,
        tags: editingTool.tags,
        connectionType: editingTool.config.connectionType,
        enableSandbox: editingTool.config.security?.sandbox || false,
        rateLimiting: editingTool.config.security?.rateLimiting || { globalQPS: 10, perUserQPS: 1 },
        allowedDepartments: editingTool.permissions.allowedDepartments,
        requiresApproval: editingTool.permissions.requiresApproval,
        testCases: editingTool.testing?.testCases?.map(tc => ({
          name: tc.name,
          description: tc.description,
          toolName: tc.toolName,
          parameters: tc.parameters,
          tags: tc.tags
        })) || [],
        stdioConfig: editingTool.config.stdio,
        networkConfig: editingTool.config.network
      });
      setCurrentStep(1);
    } else {
      // 重置为初始状态
      setFormData({
        name: '',
        displayName: '',
        description: '',
        category: '',
        tags: [],
        connectionType: 'http',
        enableSandbox: true,
        rateLimiting: {
          globalQPS: 10,
          perUserQPS: 1
        },
        allowedDepartments: [],
        requiresApproval: false,
        testCases: []
      });
      setCurrentStep(1);
    }
  }, [editingTool]);

  // 预定义选项
  const categories = ['数据服务', '通信服务', '开发工具', '分析工具', '安全工具', '其他'];
  const departments = ['销售部', '客服部', '市场部', '技术部', 'HR部', '财务部'];
  const authTypes = ['bearer', 'api_key', 'oauth2'];

  // 处理表单提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      return;
    }
    onSubmit(formData);
    onClose();
  };

  // 添加标签
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  // 删除标签
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // 添加部门
  const addDepartment = () => {
    if (newDepartment && !formData.allowedDepartments.includes(newDepartment)) {
      setFormData(prev => ({
        ...prev,
        allowedDepartments: [...prev.allowedDepartments, newDepartment]
      }));
      setNewDepartment('');
    }
  };

  // 删除部门
  const removeDepartment = (dept: string) => {
    setFormData(prev => ({
      ...prev,
      allowedDepartments: prev.allowedDepartments.filter(d => d !== dept)
    }));
  };

  // 自动发现工具能力
  const discoverCapabilities = async () => {
    setIsDiscovering(true);
    // 模拟API调用
    setTimeout(() => {
      setDiscoveryResult({
        success: true,
        capabilities: [
          {
            type: 'tools',
            name: 'discovered_function',
            description: '自动发现的工具函数',
            schema: {
              type: 'object',
              properties: {
                input: { type: 'string', description: '输入参数' }
              },
              required: ['input']
            }
          }
        ],
        serverInfo: {
          name: 'Example MCP Server',
          version: '1.0.0',
          protocolVersion: '1.2'
        }
      });
      setIsDiscovering(false);
    }, 2000);
  };

  // 添加测试用例
  const addTestCase = () => {
    const newTestCase: Omit<ToolTestCase, 'id' | 'createdAt' | 'createdBy'> = {
      name: '',
      description: '',
      toolName: '',
      parameters: {},
      tags: []
    };
    setFormData(prev => ({
      ...prev,
      testCases: [...prev.testCases, newTestCase]
    }));
  };

  // 更新测试用例
  const updateTestCase = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      testCases: prev.testCases.map((tc, i) => 
        i === index ? { ...tc, [field]: value } : tc
      )
    }));
  };

  // 删除测试用例
  const removeTestCase = (index: number) => {
    setFormData(prev => ({
      ...prev,
      testCases: prev.testCases.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]" style={{margin: 0, width: '100vw', height: '100vh'}}>
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {editingTool ? '编辑工具' : '注册新工具'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              步骤 {currentStep} / 4 - {
                currentStep === 1 ? '基础信息' :
                currentStep === 2 ? '连接配置' :
                currentStep === 3 ? '安全与权限' : '测试用例'
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* 步骤1: 基础信息 */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    工具名称 *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="例如: weather-service"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <p className="text-xs text-gray-500 mt-1">用于系统内部识别的唯一名称</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    显示名称 *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="例如: 天气查询服务"
                    value={formData.displayName}
                    onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  工具描述 *
                </label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="描述这个工具的功能和用途..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  分类 *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="">请选择分类</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  标签
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="添加标签..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 步骤2: 连接配置 */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  连接类型 *
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {(['stdio', 'sse', 'http'] as MCPConnectionType[]).map(type => (
                    <label key={type} className="relative">
                      <input
                        type="radio"
                        name="connectionType"
                        value={type}
                        checked={formData.connectionType === type}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          connectionType: e.target.value as MCPConnectionType 
                        }))}
                        className="sr-only"
                      />
                      <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.connectionType === type
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <div className="text-center">
                          <div className="text-2xl mb-2">
                            {type === 'stdio' ? '🔌' : type === 'sse' ? '📡' : '🌐'}
                          </div>
                          <div className="font-medium text-sm uppercase">{type}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {type === 'stdio' ? '本地进程' : 
                             type === 'sse' ? '服务器推送' : 'HTTP接口'}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* STDIO配置 */}
              {formData.connectionType === 'stdio' && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">STDIO 配置</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      命令路径 *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="/usr/local/bin/my-mcp-server"
                      value={formData.stdioConfig?.command || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        stdioConfig: {
                          ...prev.stdioConfig,
                          command: e.target.value,
                          args: prev.stdioConfig?.args || [],
                          env: prev.stdioConfig?.env || {}
                        }
                      }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      启动参数
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="--config /path/to/config.json"
                      value={formData.stdioConfig?.args.join(' ') || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        stdioConfig: {
                          ...prev.stdioConfig,
                          command: prev.stdioConfig?.command || '',
                          args: e.target.value.split(' ').filter(arg => arg.trim()),
                          env: prev.stdioConfig?.env || {}
                        }
                      }))}
                    />
                  </div>
                </div>
              )}

              {/* HTTP/SSE配置 */}
              {(formData.connectionType === 'http' || formData.connectionType === 'sse') && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">网络配置</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL *
                    </label>
                    <input
                      type="url"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="https://api.example.com/mcp"
                      value={formData.networkConfig?.url || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        networkConfig: {
                          ...prev.networkConfig,
                          url: e.target.value,
                          headers: prev.networkConfig?.headers || {}
                        }
                      }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      认证方式
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      value={formData.networkConfig?.authentication?.type || 'none'}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        networkConfig: {
                          ...prev.networkConfig,
                          url: prev.networkConfig?.url || '',
                          headers: prev.networkConfig?.headers || {},
                          authentication: e.target.value === 'none' ? undefined : {
                            type: e.target.value,
                            token: ''
                          }
                        }
                      }))}
                    >
                      <option value="none">无认证</option>
                      {authTypes.map(type => (
                        <option key={type} value={type}>
                          {type === 'bearer' ? 'Bearer Token' : 
                           type === 'api_key' ? 'API Key' : 'OAuth2'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.networkConfig?.authentication && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {formData.networkConfig.authentication.type === 'bearer' ? 'Bearer Token' : 
                         formData.networkConfig.authentication.type === 'api_key' ? 'API Key' : 'Token'}
                      </label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="输入认证密钥..."
                        value={formData.networkConfig.authentication.token || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          networkConfig: {
                            ...prev.networkConfig!,
                            authentication: {
                              ...prev.networkConfig!.authentication!,
                              token: e.target.value
                            }
                          }
                        }))}
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={discoverCapabilities}
                      disabled={isDiscovering || !formData.networkConfig?.url}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <TestTube className="h-4 w-4" />
                      {isDiscovering ? '发现中...' : '自动发现能力'}
                    </button>
                    
                    {discoveryResult && (
                      <div className="flex items-center gap-2 text-sm">
                        {discoveryResult.success ? (
                          <>
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-green-700">
                              发现 {discoveryResult.capabilities.length} 个能力
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="text-red-700">连接失败</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 步骤3: 安全与权限 */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">安全提醒</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      请根据工具的风险等级合理配置安全参数。高风险工具建议启用沙箱隔离。
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    id="sandbox"
                    checked={formData.enableSandbox}
                    onChange={(e) => setFormData(prev => ({ ...prev, enableSandbox: e.target.checked }))}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="sandbox" className="text-sm font-medium text-gray-700">
                    启用沙箱隔离
                  </label>
                  <Info className="h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    全局QPS限制 *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={formData.rateLimiting.globalQPS}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      rateLimiting: {
                        ...prev.rateLimiting,
                        globalQPS: parseInt(e.target.value) || 1
                      }
                    }))}
                  />
                  <p className="text-xs text-gray-500 mt-1">整个系统的每秒最大请求数</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    单用户QPS限制
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={formData.rateLimiting.perUserQPS || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      rateLimiting: {
                        ...prev.rateLimiting,
                        perUserQPS: e.target.value ? parseInt(e.target.value) : undefined
                      }
                    }))}
                  />
                  <p className="text-xs text-gray-500 mt-1">单个用户的每秒最大请求数</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  允许使用的部门 *
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.allowedDepartments.map((dept, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full"
                    >
                      {dept}
                      <button
                        type="button"
                        onClick={() => removeDepartment(dept)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <select
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                  >
                    <option value="">选择部门...</option>
                    {departments.filter(dept => !formData.allowedDepartments.includes(dept)).map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addDepartment}
                    disabled={!newDepartment}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {formData.allowedDepartments.length === 0 && (
                  <p className="text-red-500 text-xs mt-1">至少选择一个部门</p>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="approval"
                    checked={formData.requiresApproval}
                    onChange={(e) => setFormData(prev => ({ ...prev, requiresApproval: e.target.checked }))}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="approval" className="text-sm font-medium text-gray-700">
                    使用前需要审批
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  启用后，用户需要获得管理员审批才能使用此工具
                </p>
              </div>
            </div>
          )}

          {/* 步骤4: 测试用例 */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900">测试用例</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    添加测试用例以验证工具功能（可选）
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addTestCase}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  添加测试用例
                </button>
              </div>

              {formData.testCases.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <TestTube className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>暂无测试用例</p>
                  <p className="text-sm">添加测试用例可以确保工具正常工作</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.testCases.map((testCase, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <h5 className="font-medium text-gray-900">测试用例 {index + 1}</h5>
                        <button
                          type="button"
                          onClick={() => removeTestCase(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            测试名称 *
                          </label>
                          <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="例如: 基础功能测试"
                            value={testCase.name}
                            onChange={(e) => updateTestCase(index, 'name', e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            工具函数名
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="例如: get_weather"
                            value={testCase.toolName}
                            onChange={(e) => updateTestCase(index, 'toolName', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          描述
                        </label>
                        <textarea
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="测试用例的详细描述..."
                          value={testCase.description}
                          onChange={(e) => updateTestCase(index, 'description', e.target.value)}
                        />
                      </div>
                      
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          测试参数 (JSON)
                        </label>
                        <textarea
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                          placeholder='{"city": "北京", "country": "CN"}'
                          value={JSON.stringify(testCase.parameters, null, 2)}
                          onChange={(e) => {
                            try {
                              const params = JSON.parse(e.target.value || '{}');
                              updateTestCase(index, 'parameters', params);
                            } catch {
                              // 忽略JSON解析错误，让用户继续编辑
                            }
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 底部按钮 */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <div className="flex gap-2">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  上一步
                </button>
              )}
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={currentStep === 3 && formData.allowedDepartments.length === 0}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentStep < 4 ? '下一步' : (editingTool ? '保存修改' : '创建工具')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default CreateMCPTool;