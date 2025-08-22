import { useState } from 'react';
import { 
  ArrowLeft,
  Edit3,
  Save,
  X,
  Upload,
  FileText,
  Brain,
  Settings,
  Database,
  Eye,
  Trash2,
  Plus,
  Download,
  Search,
  Filter,
  MessageSquare,
  Lightbulb,
  Network
} from 'lucide-react';
import { DigitalEmployeeManagement } from '../types';

interface DigitalEmployeeDetailProps {
  employee: DigitalEmployeeManagement;
  onClose: () => void;
  onSave: (employee: DigitalEmployeeManagement) => void;
}

const DigitalEmployeeDetail = ({ employee, onClose, onSave }: DigitalEmployeeDetailProps) => {
  const [activeTab, setActiveTab] = useState<'config' | 'knowledge' | 'memory'>('config');
  const [isEditing, setIsEditing] = useState(false);
  const [editedEmployee, setEditedEmployee] = useState<DigitalEmployeeManagement>(employee);
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    { id: 'config', label: '配置信息', icon: Settings },
    { id: 'knowledge', label: '知识库管理', icon: Database },
    { id: 'memory', label: '记忆系统', icon: Brain }
  ];

  const handleSave = () => {
    onSave(editedEmployee);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedEmployee(employee);
    setIsEditing(false);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      disabled: 'bg-yellow-100 text-yellow-800', 
      retired: 'bg-gray-100 text-gray-800'
    };
    const labels = {
      active: '启用',
      disabled: '禁用',
      retired: '停用'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const renderConfigTab = () => (
    <div className="space-y-6">
      {/* 基础信息 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">基础信息</h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Edit3 className="h-4 w-4" />
              编辑
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">员工姓名</label>
            {isEditing ? (
              <input
                type="text"
                value={editedEmployee.name}
                onChange={(e) => setEditedEmployee(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{employee.name}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">员工编号</label>
            <p className="text-gray-900">{employee.employeeNumber}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">所属部门</label>
            {isEditing ? (
              <select
                value={editedEmployee.department}
                onChange={(e) => setEditedEmployee(prev => ({ ...prev, department: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="客户服务部">客户服务部</option>
                <option value="技术支持部">技术支持部</option>
                <option value="销售部">销售部</option>
                <option value="人力资源部">人力资源部</option>
                <option value="管理层">管理层</option>
              </select>
            ) : (
              <p className="text-gray-900">{employee.department}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
            {isEditing ? (
              <select
                value={editedEmployee.status}
                onChange={(e) => setEditedEmployee(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">启用</option>
                <option value="disabled">禁用</option>
                <option value="retired">停用</option>
              </select>
            ) : (
              getStatusBadge(employee.status)
            )}
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
          {isEditing ? (
            <textarea
              value={editedEmployee.description || ''}
              onChange={(e) => setEditedEmployee(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="输入数字员工的描述..."
            />
          ) : (
            <p className="text-gray-900">{employee.description || '暂无描述'}</p>
          )}
        </div>
      </div>

      {/* 角色与人设 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">角色与人设</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">系统提示词</label>
            {isEditing ? (
              <textarea
                value={editedEmployee.persona.systemPrompt}
                onChange={(e) => setEditedEmployee(prev => ({ 
                  ...prev, 
                  persona: { ...prev.persona, systemPrompt: e.target.value }
                }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{employee.persona.systemPrompt}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">性格特点</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedEmployee.persona.personality}
                  onChange={(e) => setEditedEmployee(prev => ({ 
                    ...prev, 
                    persona: { ...prev.persona, personality: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{employee.persona.personality}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">主要职责</label>
              <div className="flex flex-wrap gap-1">
                {employee.persona.responsibilities.map((resp, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    {resp}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 权限配置 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">权限配置</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">允许使用的工具</label>
            <div className="flex flex-wrap gap-2">
              {employee.permissions.allowedTools.map((tool, index) => (
                <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  {tool}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">知识管理权限</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={employee.permissions.knowledgeManagement.canSelfLearn}
                  disabled={!isEditing}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">可自主学习</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={employee.permissions.knowledgeManagement.canModifyKnowledge}
                  disabled={!isEditing}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">可修改知识库</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 运行统计 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">运行统计</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{employee.metrics.totalSessions}</div>
            <div className="text-sm text-gray-600">总会话数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {((employee.metrics.successfulSessions / employee.metrics.totalSessions) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">成功率</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{employee.metrics.avgResponseTime}s</div>
            <div className="text-sm text-gray-600">平均响应时间</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {employee.metrics.userSatisfactionScore?.toFixed(1) || 'N/A'}
            </div>
            <div className="text-sm text-gray-600">用户满意度</div>
          </div>
        </div>
      </div>

      {/* 编辑操作按钮 */}
      {isEditing && (
        <div className="flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
          >
            <Save className="h-4 w-4" />
            保存
          </button>
        </div>
      )}
    </div>
  );

  const renderKnowledgeTab = () => (
    <div className="space-y-6">
      {/* 知识库统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{employee.knowledgeBase.documents.length}</p>
              <p className="text-sm text-gray-600">知识文档</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{employee.knowledgeBase.faqItems.length}</p>
              <p className="text-sm text-gray-600">FAQ条目</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Lightbulb className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {employee.knowledgeBase.autoLearnedItems?.length || 0}
              </p>
              <p className="text-sm text-gray-600">自学知识</p>
            </div>
          </div>
        </div>
      </div>

      {/* 知识管理操作 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">知识库管理</h3>
          <div className="flex gap-2">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center gap-1 text-sm">
              <Upload className="h-4 w-4" />
              上传文档
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center gap-1 text-sm">
              <Plus className="h-4 w-4" />
              添加FAQ
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg flex items-center gap-1 text-sm">
              <Network className="h-4 w-4" />
              构建知识图谱
            </button>
          </div>
        </div>
        
        {/* 搜索和筛选 */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="搜索知识库内容..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="h-4 w-4" />
          </button>
        </div>

        {/* 知识文档列表 */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">知识文档</h4>
          {employee.knowledgeBase.documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">{doc.name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(doc.uploadedAt).toLocaleDateString()} · {(doc.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                  <Eye className="h-4 w-4" />
                </button>
                <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                  <Download className="h-4 w-4" />
                </button>
                <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMemoryTab = () => {
    const memoryTypes = [
      { key: 'working', label: '工作记忆', color: 'blue', description: '当前上下文和临时信息' },
      { key: 'episodic', label: '情景记忆', color: 'green', description: '具体事件和经历' },
      { key: 'semantic', label: '语义记忆', color: 'purple', description: '概念知识和规则' },
      { key: 'procedural', label: '程序性记忆', color: 'orange', description: '技能和操作流程' },
      { key: 'emotional', label: '情感记忆', color: 'red', description: '情感反馈和偏好' }
    ];

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">多层记忆系统</h3>
            <div className="text-sm text-gray-500">
              基于认知科学的记忆架构
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {memoryTypes.map((type) => {
              const memoryCount = employee.memorySystem?.[`${type.key}Memory` as keyof typeof employee.memorySystem]?.length || 0;
              return (
                <div key={type.key} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className={`w-3 h-3 rounded-full bg-${type.color}-500 mr-2`}></div>
                    <h4 className="font-medium text-gray-900">{type.label}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{type.description}</p>
                  <div className="text-2xl font-bold text-gray-900">{memoryCount}</div>
                  <div className="text-sm text-gray-500">条记忆</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">记忆查看器</h3>
          <div className="text-center py-8 text-gray-500">
            <Brain className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>记忆系统详细分析</p>
            <p className="text-sm">此功能主要供AI工程师调试使用</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl h-full max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <button
              onClick={onClose}
              className="mr-4 p-1 hover:bg-gray-100 rounded"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center mr-3">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{employee.name}</h2>
                <p className="text-gray-600">#{employee.employeeNumber} · {employee.department}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(employee.status)}
          </div>
        </div>

        {/* 标签页导航 */}
        <div className="border-b border-gray-200">
          <nav className="flex px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-4 py-3 border-b-2 text-sm font-medium ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* 内容区域 */}
        <div className="p-6 overflow-y-auto" style={{ height: 'calc(90vh - 140px)' }}>
          {activeTab === 'config' && renderConfigTab()}
          {activeTab === 'knowledge' && renderKnowledgeTab()}
          {activeTab === 'memory' && renderMemoryTab()}
        </div>
      </div>
    </div>
  );
};

export default DigitalEmployeeDetail;