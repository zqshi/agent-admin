import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Network,
  Clock,
  User,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { DigitalEmployeeManagement, KnowledgeDocument, FAQItem } from '../types';
import { mockDigitalEmployees } from '../data/mockDigitalEmployees';

const DigitalEmployeeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [employee, setEmployee] = useState<DigitalEmployeeManagement | null>(null);
  const [activeTab, setActiveTab] = useState<'config' | 'knowledge' | 'memory'>('config');
  const [memorySubTab, setMemorySubTab] = useState<'details' | 'graph'>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [editedEmployee, setEditedEmployee] = useState<DigitalEmployeeManagement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);

  // 知识库管理状态
  const [newDocument, setNewDocument] = useState<File | null>(null);
  const [showAddFAQ, setShowAddFAQ] = useState(false);
  const [newFAQ, setNewFAQ] = useState({ question: '', answer: '', tags: '' });
  const [buildingGraph, setBuildingGraph] = useState(false);

  useEffect(() => {
    const foundEmployee = mockDigitalEmployees.find(emp => emp.id === id);
    if (foundEmployee) {
      setEmployee(foundEmployee);
      setEditedEmployee(foundEmployee);
    } else {
      navigate('/digital-employees');
    }
  }, [id, navigate]);

  if (!employee) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'config', label: '配置信息', icon: Settings },
    { id: 'knowledge', label: '知识库管理', icon: Database },
    { id: 'memory', label: '记忆系统', icon: Brain }
  ];

  const handleSave = () => {
    if (editedEmployee) {
      setEmployee(editedEmployee);
      setIsEditing(false);
      // 这里应该调用API保存到后端
    }
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

  // 处理文档上传
  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const file = files[0];
    
    // 模拟上传过程
    setTimeout(() => {
      const newDoc: KnowledgeDocument = {
        id: Date.now().toString(),
        name: file.name,
        type: file.name.split('.').pop() as any || 'txt',
        uploadedAt: new Date().toISOString(),
        size: file.size,
        processedAt: new Date().toISOString(),
        tags: ['新上传'],
        metadata: { uploadedBy: 'admin' }
      };

      if (editedEmployee) {
        setEditedEmployee(prev => prev ? {
          ...prev,
          knowledgeBase: {
            ...prev.knowledgeBase,
            documents: [...prev.knowledgeBase.documents, newDoc]
          }
        } : null);
      }
      
      setUploading(false);
      setNewDocument(null);
    }, 2000);
  };

  // 处理FAQ添加
  const handleAddFAQ = () => {
    if (!newFAQ.question.trim() || !newFAQ.answer.trim()) return;

    const faqItem: FAQItem = {
      id: Date.now().toString(),
      question: newFAQ.question,
      answer: newFAQ.answer,
      tags: newFAQ.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      confidence: 1.0,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editedEmployee) {
      setEditedEmployee(prev => prev ? {
        ...prev,
        knowledgeBase: {
          ...prev.knowledgeBase,
          faqItems: [...prev.knowledgeBase.faqItems, faqItem]
        }
      } : null);
    }

    setNewFAQ({ question: '', answer: '', tags: '' });
    setShowAddFAQ(false);
  };

  // 处理知识图谱构建
  const handleBuildKnowledgeGraph = () => {
    setBuildingGraph(true);
    
    // 模拟构建过程
    setTimeout(() => {
      if (editedEmployee) {
        setEditedEmployee(prev => prev ? {
          ...prev,
          knowledgeBase: {
            ...prev.knowledgeBase,
            knowledgeGraph: {
              entities: [
                { id: '1', name: '客户服务', type: 'concept', properties: {}, confidence: 0.9 },
                { id: '2', name: '订单查询', type: 'action', properties: {}, confidence: 0.85 },
                { id: '3', name: '物流追踪', type: 'action', properties: {}, confidence: 0.8 }
              ],
              relations: [
                { id: '1', sourceId: '1', targetId: '2', type: 'includes', properties: {}, confidence: 0.9 },
                { id: '2', sourceId: '1', targetId: '3', type: 'includes', properties: {}, confidence: 0.85 }
              ],
              lastUpdated: new Date().toISOString(),
              statistics: {
                entityCount: 3,
                relationCount: 2,
                avgConnectivity: 1.33
              }
            }
          }
        } : null);
      }
      setBuildingGraph(false);
    }, 3000);
  };

  // Mock记忆系统数据
  const mockMemoryData = {
    workingMemory: [
      {
        id: '1',
        type: 'working' as const,
        content: '用户刚才询问了订单DE001的配送状态',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        importance: 0.8,
        accessCount: 1,
        associatedIds: ['order_DE001'],
        metadata: { sessionId: 'sess_123', context: 'order_inquiry' }
      },
      {
        id: '2',
        type: 'working' as const,
        content: '正在处理客户关于退货流程的咨询',
        timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
        importance: 0.9,
        accessCount: 2,
        associatedIds: ['return_policy'],
        metadata: { sessionId: 'sess_124', urgency: 'high' }
      }
    ],
    episodicMemory: [
      {
        id: '3',
        type: 'episodic' as const,
        content: '2024-02-28 14:30: 成功帮助客户王先生解决了订单配送问题，客户表示满意',
        timestamp: '2024-02-28T14:30:00Z',
        importance: 0.7,
        accessCount: 3,
        associatedIds: ['customer_wang', 'delivery_issue'],
        metadata: { outcome: 'positive', satisfaction: 5 }
      },
      {
        id: '4',
        type: 'episodic' as const,
        content: '2024-02-27 16:20: 处理了复杂的退换货流程咨询，需要转接人工客服',
        timestamp: '2024-02-27T16:20:00Z',
        importance: 0.6,
        accessCount: 1,
        associatedIds: ['return_complex', 'escalation'],
        metadata: { escalated: true, reason: 'complex_policy' }
      }
    ],
    semanticMemory: [
      {
        id: '5',
        type: 'semantic' as const,
        content: '客户服务原则：始终保持耐心、专业和友好的态度',
        timestamp: '2024-01-15T10:00:00Z',
        importance: 0.95,
        accessCount: 156,
        associatedIds: ['service_principles'],
        metadata: { category: 'core_values', source: 'training' }
      },
      {
        id: '6',
        type: 'semantic' as const,
        content: '订单状态包括：待付款、已付款、处理中、已发货、已送达、已完成',
        timestamp: '2024-01-15T10:30:00Z',
        importance: 0.9,
        accessCount: 89,
        associatedIds: ['order_status', 'business_rules'],
        metadata: { category: 'business_logic', updateFreq: 'stable' }
      }
    ],
    proceduralMemory: [
      {
        id: '7',
        type: 'procedural' as const,
        content: '查询订单状态流程：1.验证订单号格式 2.调用order_query工具 3.解析返回结果 4.格式化回复',
        timestamp: '2024-01-20T09:00:00Z',
        importance: 0.85,
        accessCount: 234,
        associatedIds: ['order_query_tool', 'workflow'],
        metadata: { steps: 4, success_rate: 0.96 }
      }
    ],
    emotionalMemory: [
      {
        id: '8',
        type: 'emotional' as const,
        content: '用户对快速解决配送问题的积极反馈，增强了主动询问配送状态的倾向',
        timestamp: '2024-02-20T15:00:00Z',
        importance: 0.7,
        accessCount: 12,
        associatedIds: ['positive_feedback', 'delivery_proactive'],
        metadata: { emotion: 'confidence', strength: 0.8 }
      }
    ]
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
                value={editedEmployee?.name || ''}
                onChange={(e) => setEditedEmployee(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
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
                value={editedEmployee?.department || ''}
                onChange={(e) => setEditedEmployee(prev => prev ? ({ ...prev, department: e.target.value }) : null)}
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
                value={editedEmployee?.status || ''}
                onChange={(e) => setEditedEmployee(prev => prev ? ({ ...prev, status: e.target.value as any }) : null)}
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
              value={editedEmployee?.description || ''}
              onChange={(e) => setEditedEmployee(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
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
                value={editedEmployee?.persona.systemPrompt || ''}
                onChange={(e) => setEditedEmployee(prev => prev ? ({ 
                  ...prev, 
                  persona: { ...prev.persona, systemPrompt: e.target.value }
                }) : null)}
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
                  value={editedEmployee?.persona.personality || ''}
                  onChange={(e) => setEditedEmployee(prev => prev ? ({ 
                    ...prev, 
                    persona: { ...prev.persona, personality: e.target.value }
                  }) : null)}
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
              <p className="text-2xl font-bold text-gray-900">{editedEmployee?.knowledgeBase.documents.length || 0}</p>
              <p className="text-sm text-gray-600">知识文档</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{editedEmployee?.knowledgeBase.faqItems.length || 0}</p>
              <p className="text-sm text-gray-600">FAQ条目</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Lightbulb className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {editedEmployee?.knowledgeBase.autoLearnedItems?.length || 0}
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
            <label className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center gap-1 text-sm cursor-pointer">
              <Upload className="h-4 w-4" />
              {uploading ? '上传中...' : '上传文档'}
              <input
                type="file"
                accept=".pdf,.txt,.md,.doc,.docx"
                onChange={handleDocumentUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
            <button 
              onClick={() => setShowAddFAQ(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center gap-1 text-sm"
            >
              <Plus className="h-4 w-4" />
              添加FAQ
            </button>
            <button 
              onClick={handleBuildKnowledgeGraph}
              disabled={buildingGraph}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-3 py-2 rounded-lg flex items-center gap-1 text-sm"
            >
              <Network className="h-4 w-4" />
              {buildingGraph ? '构建中...' : '构建知识图谱'}
            </button>
          </div>
        </div>

        {/* 上传进度 */}
        {uploading && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-sm text-blue-800">正在上传和处理文档...</span>
            </div>
          </div>
        )}

        {/* 知识图谱构建进度 */}
        {buildingGraph && (
          <div className="mb-4 p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
              <span className="text-sm text-purple-800">正在分析文档内容并构建知识图谱...</span>
            </div>
          </div>
        )}
        
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
        <div className="space-y-3 mb-6">
          <h4 className="font-medium text-gray-900">知识文档</h4>
          {editedEmployee?.knowledgeBase.documents.map((doc) => (
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

        {/* FAQ列表 */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">FAQ条目</h4>
          {editedEmployee?.knowledgeBase.faqItems.map((faq) => (
            <div key={faq.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h5 className="font-medium text-gray-900">{faq.question}</h5>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">使用次数: {faq.usageCount}</span>
                  <button className="p-1 text-gray-400 hover:text-red-600">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <p className="text-gray-700 text-sm mb-2">{faq.answer}</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {faq.tags.map((tag, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="text-xs text-gray-500">
                  置信度: {(faq.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 知识图谱状态 */}
        {editedEmployee?.knowledgeBase.knowledgeGraph && (
          <div className="mt-6 p-4 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">知识图谱</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-purple-700">实体数量: </span>
                <span className="font-medium">{editedEmployee.knowledgeBase.knowledgeGraph.statistics.entityCount}</span>
              </div>
              <div>
                <span className="text-purple-700">关系数量: </span>
                <span className="font-medium">{editedEmployee.knowledgeBase.knowledgeGraph.statistics.relationCount}</span>
              </div>
              <div>
                <span className="text-purple-700">平均连通性: </span>
                <span className="font-medium">{editedEmployee.knowledgeBase.knowledgeGraph.statistics.avgConnectivity.toFixed(2)}</span>
              </div>
            </div>
            <p className="text-xs text-purple-600 mt-2">
              最后更新: {new Date(editedEmployee.knowledgeBase.knowledgeGraph.lastUpdated).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* 添加FAQ弹窗 */}
      {showAddFAQ && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">添加FAQ</h3>
              <button 
                onClick={() => setShowAddFAQ(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">问题</label>
                <input
                  type="text"
                  value={newFAQ.question}
                  onChange={(e) => setNewFAQ(prev => ({ ...prev, question: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="输入问题..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">答案</label>
                <textarea
                  value={newFAQ.answer}
                  onChange={(e) => setNewFAQ(prev => ({ ...prev, answer: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="输入答案..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">标签</label>
                <input
                  type="text"
                  value={newFAQ.tags}
                  onChange={(e) => setNewFAQ(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="用逗号分隔多个标签..."
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddFAQ(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleAddFAQ}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // 记忆详情渲染函数
  const renderMemoryDetails = () => {
    const memoryTypes = [
      { key: 'workingMemory', label: '工作记忆', color: 'blue', description: '当前上下文和临时信息', data: mockMemoryData.workingMemory },
      { key: 'episodicMemory', label: '情景记忆', color: 'green', description: '具体事件和经历', data: mockMemoryData.episodicMemory },
      { key: 'semanticMemory', label: '语义记忆', color: 'purple', description: '概念知识和规则', data: mockMemoryData.semanticMemory },
      { key: 'proceduralMemory', label: '程序性记忆', color: 'orange', description: '技能和操作流程', data: mockMemoryData.proceduralMemory },
      { key: 'emotionalMemory', label: '情感记忆', color: 'red', description: '情感反馈和偏好', data: mockMemoryData.emotionalMemory }
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {memoryTypes.map((type) => (
              <div key={type.key} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <div className={`w-3 h-3 rounded-full bg-${type.color}-500 mr-2`}></div>
                  <h4 className="font-medium text-gray-900">{type.label}</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">{type.description}</p>
                <div className="text-2xl font-bold text-gray-900">{type.data.length}</div>
                <div className="text-sm text-gray-500">条记忆</div>
              </div>
            ))}
          </div>

          {/* 记忆详细查看器 */}
          <div className="space-y-4">
            {memoryTypes.map((type) => (
              <div key={type.key}>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <div className={`w-3 h-3 rounded-full bg-${type.color}-500 mr-2`}></div>
                  {type.label}
                </h4>
                
                <div className="space-y-2 mb-6">
                  {type.data.map((memory) => (
                    <div key={memory.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="text-gray-900 mb-1">{memory.content}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(memory.timestamp).toLocaleString()}
                            </span>
                            <span>重要性: {(memory.importance * 100).toFixed(0)}%</span>
                            <span>访问次数: {memory.accessCount}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      {memory.associatedIds.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {memory.associatedIds.map((id, index) => (
                            <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                              {id}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {memory.metadata && Object.keys(memory.metadata).length > 0 && (
                        <div className="text-xs text-gray-400">
                          元数据: {JSON.stringify(memory.metadata, null, 0)}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {type.data.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      暂无{type.label}数据
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 记忆图谱渲染函数
  const renderMemoryGraph = () => {
    // 构建记忆节点和连接关系
    const memoryNodes = [
      // 中心节点
      { id: 'center', label: employee.name, type: 'center', x: 400, y: 300, color: 'bg-purple-500' },
      
      // 工作记忆节点
      { id: 'working-1', label: '订单查询', type: 'working', x: 200, y: 150, color: 'bg-blue-500' },
      { id: 'working-2', label: '退货处理', type: 'working', x: 300, y: 100, color: 'bg-blue-500' },
      
      // 情景记忆节点
      { id: 'episodic-1', label: '客户王女士', type: 'episodic', x: 600, y: 150, color: 'bg-green-500' },
      { id: 'episodic-2', label: '产品咨询事件', type: 'episodic', x: 700, y: 250, color: 'bg-green-500' },
      
      // 语义记忆节点
      { id: 'semantic-1', label: '服务原则', type: 'semantic', x: 500, y: 500, color: 'bg-purple-500' },
      { id: 'semantic-2', label: '业务流程', type: 'semantic', x: 300, y: 500, color: 'bg-purple-500' },
      
      // 程序性记忆节点
      { id: 'procedural-1', label: '查询流程', type: 'procedural', x: 100, y: 300, color: 'bg-orange-500' },
      
      // 情感记忆节点
      { id: 'emotional-1', label: '积极反馈', type: 'emotional', x: 600, y: 450, color: 'bg-red-500' }
    ];

    const memoryConnections = [
      // 中心连接
      { from: 'center', to: 'working-1', strength: 0.9 },
      { from: 'center', to: 'working-2', strength: 0.8 },
      { from: 'center', to: 'episodic-1', strength: 0.7 },
      { from: 'center', to: 'episodic-2', strength: 0.6 },
      { from: 'center', to: 'semantic-1', strength: 0.95 },
      { from: 'center', to: 'semantic-2', strength: 0.9 },
      { from: 'center', to: 'procedural-1', strength: 0.85 },
      { from: 'center', to: 'emotional-1', strength: 0.7 },
      
      // 关联连接
      { from: 'working-1', to: 'procedural-1', strength: 0.8 },
      { from: 'working-1', to: 'semantic-2', strength: 0.7 },
      { from: 'episodic-1', to: 'emotional-1', strength: 0.6 },
      { from: 'procedural-1', to: 'semantic-2', strength: 0.9 },
      { from: 'semantic-1', to: 'emotional-1', strength: 0.5 }
    ];

    const getConnectionOpacity = (strength: number) => {
      return Math.max(0.3, strength);
    };

    const getConnectionWidth = (strength: number) => {
      return Math.max(1, strength * 3);
    };

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">记忆关联图谱</h3>
            <div className="text-sm text-gray-500">
              可视化记忆节点间的关联关系
            </div>
          </div>

          {/* 图谱工具栏 */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">记忆类型:</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                  <span className="text-xs text-gray-600">工作记忆</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                  <span className="text-xs text-gray-600">情景记忆</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-purple-500 mr-1"></div>
                  <span className="text-xs text-gray-600">语义记忆</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-orange-500 mr-1"></div>
                  <span className="text-xs text-gray-600">程序性记忆</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                  <span className="text-xs text-gray-600">情感记忆</span>
                </div>
              </div>
            </div>
          </div>

          {/* 记忆图谱可视化 */}
          <div className="relative bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden" style={{ height: '600px' }}>
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 600">
              {/* 渲染连接线 */}
              {memoryConnections.map((connection, index) => {
                const fromNode = memoryNodes.find(n => n.id === connection.from);
                const toNode = memoryNodes.find(n => n.id === connection.to);
                if (!fromNode || !toNode) return null;
                
                return (
                  <line
                    key={index}
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke="#6b7280"
                    strokeWidth={getConnectionWidth(connection.strength)}
                    strokeOpacity={getConnectionOpacity(connection.strength)}
                    className="transition-all duration-300"
                  />
                );
              })}
            </svg>

            {/* 渲染记忆节点 */}
            {memoryNodes.map((node) => (
              <div
                key={node.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{ left: `${(node.x / 800) * 100}%`, top: `${(node.y / 600) * 100}%` }}
              >
                <div className={`${node.color} ${node.type === 'center' ? 'w-16 h-16' : 'w-12 h-12'} rounded-full flex items-center justify-center text-white font-medium text-sm shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                  {node.type === 'center' ? (
                    <Brain className="h-6 w-6" />
                  ) : node.type === 'working' ? (
                    <Clock className="h-4 w-4" />
                  ) : node.type === 'episodic' ? (
                    <User className="h-4 w-4" />
                  ) : node.type === 'semantic' ? (
                    <FileText className="h-4 w-4" />
                  ) : node.type === 'procedural' ? (
                    <Settings className="h-4 w-4" />
                  ) : (
                    <MessageSquare className="h-4 w-4" />
                  )}
                </div>
                
                {/* 节点标签 */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10">
                  {node.label}
                </div>
              </div>
            ))}

            {/* 图谱说明 */}
            <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 p-3 rounded-lg text-xs text-gray-600">
              <p className="font-medium mb-1">图谱说明:</p>
              <p>• 线条粗细表示关联强度</p>
              <p>• 中心节点为数字员工核心</p>
              <p>• 悬停查看节点详情</p>
            </div>
          </div>

          {/* 图谱统计 */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-lg font-bold text-gray-900">{memoryNodes.length - 1}</div>
              <div className="text-sm text-gray-600">记忆节点</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-lg font-bold text-gray-900">{memoryConnections.length}</div>
              <div className="text-sm text-gray-600">关联连接</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-lg font-bold text-gray-900">
                {(memoryConnections.reduce((sum, conn) => sum + conn.strength, 0) / memoryConnections.length).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">平均关联度</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-lg font-bold text-gray-900">
                {new Set([...mockMemoryData.workingMemory, ...mockMemoryData.episodicMemory, ...mockMemoryData.semanticMemory, ...mockMemoryData.proceduralMemory, ...mockMemoryData.emotionalMemory].flatMap(m => m.associatedIds)).size}
              </div>
              <div className="text-sm text-gray-600">关联实体</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMemoryTab = () => {
    const memorySubTabs = [
      { id: 'details', label: '记忆详情', icon: FileText },
      { id: 'graph', label: '记忆图谱', icon: Network }
    ];

    return (
      <div className="space-y-6">
        {/* 子tab导航 */}
        <div className="bg-white border-b border-gray-200">
          <nav className="flex">
            {memorySubTabs.map((subTab) => {
              const Icon = subTab.icon;
              return (
                <button
                  key={subTab.id}
                  onClick={() => setMemorySubTab(subTab.id as any)}
                  className={`flex items-center px-4 py-3 border-b-2 text-sm font-medium ${
                    memorySubTab === subTab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {subTab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* 子tab内容 */}
        {memorySubTab === 'details' && renderMemoryDetails()}
        {memorySubTab === 'graph' && renderMemoryGraph()}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/digital-employees')}
                className="mr-4 p-1 hover:bg-gray-100 rounded"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center mr-3">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{employee.name}</h1>
                  <p className="text-gray-600">#{employee.employeeNumber} · {employee.department}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(employee.status)}
            </div>
          </div>
        </div>
      </div>

      {/* 标签页导航 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex">
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
      </div>

      {/* 内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'config' && renderConfigTab()}
        {activeTab === 'knowledge' && renderKnowledgeTab()}
        {activeTab === 'memory' && renderMemoryTab()}
      </div>
    </div>
  );
};

export default DigitalEmployeeDetail;