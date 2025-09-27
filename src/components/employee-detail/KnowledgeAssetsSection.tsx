/**
 * 知识资产组件 - 重构版本
 * 整合初始知识、文档管理、FAQ管理、知识图谱和积累知识
 * 支持独立编辑模式
 */

import React, { useState } from 'react';
import {
  Database,
  Edit3,
  Save,
  X,
  FileText,
  HelpCircle,
  Sparkles,
  TrendingUp,
  Plus,
  Minus,
  Upload,
  Eye,
  Trash2,
  Search,
  Filter,
  Brain,
  Network
} from 'lucide-react';
import type { DigitalEmployee, KnowledgeDocument, FAQItem, LearnedKnowledge } from '../../types/employee';
import { DataSourceIndicator } from '../common';
import { KnowledgeGraphViewer } from '../knowledge';

interface KnowledgeAssetsSectionProps {
  employee: DigitalEmployee;
  onNodeClick?: (node: any) => void;
  onEdgeClick?: (edge: any) => void;
}

const KnowledgeAssetsSection: React.FC<KnowledgeAssetsSectionProps> = ({
  employee,
  onNodeClick,
  onEdgeClick
}) => {
  // 独立编辑状态管理
  const [isInternalEditing, setIsInternalEditing] = useState(false);
  const [internalEditedEmployee, setInternalEditedEmployee] = useState<DigitalEmployee | null>(null);

  // 当前活跃的知识Tab
  const [activeKnowledgeTab, setActiveKnowledgeTab] = useState<string>('documents');
  const [searchQuery, setSearchQuery] = useState('');

  // 内部编辑控制方法
  const handleInternalEdit = () => {
    setIsInternalEditing(true);
    setInternalEditedEmployee({ ...employee });
  };

  const handleInternalSave = () => {
    if (internalEditedEmployee) {
      console.log('保存知识资产:', internalEditedEmployee);
      // 这里应该调用API保存数据
      setIsInternalEditing(false);
      setInternalEditedEmployee(null);
    }
  };

  const handleInternalCancel = () => {
    setIsInternalEditing(false);
    setInternalEditedEmployee(null);
  };

  // 获取当前显示的员工数据
  const getCurrentEmployee = (): DigitalEmployee => {
    return internalEditedEmployee || employee;
  };

  const currentEmployee = getCurrentEmployee();

  // 更新嵌套字段值
  const updateNestedField = (parentField: keyof DigitalEmployee, childField: string, value: any) => {
    if (internalEditedEmployee) {
      setInternalEditedEmployee({
        ...internalEditedEmployee,
        [parentField]: {
          ...(internalEditedEmployee[parentField] as any),
          [childField]: value
        }
      });
    }
  };

  // 知识资产Tab定义
  const knowledgeTabs = [
    {
      id: 'documents',
      title: '文档管理',
      icon: FileText,
      description: '初始文档、上传文件、文档处理',
      count: currentEmployee.knowledgeBase?.documents?.length || 0
    },
    {
      id: 'faq',
      title: 'FAQ管理',
      icon: HelpCircle,
      description: '常见问题、智能问答、FAQ优化',
      count: currentEmployee.knowledgeBase?.faqItems?.length || 0
    },
    {
      id: 'learned',
      title: '积累知识',
      icon: Brain,
      description: '自主学习、对话积累、知识沉淀',
      count: currentEmployee.knowledgeBase?.autoLearnedItems?.length || 0
    },
    {
      id: 'graph',
      title: '知识图谱',
      icon: Network,
      description: '知识关联、实体关系、图谱可视化',
      count: currentEmployee.knowledgeBase?.knowledgeGraph?.entities?.length || 0
    }
  ];

  // 渲染文档管理
  const renderDocumentManagement = () => {
    const documents = currentEmployee.knowledgeBase?.documents || [];
    const filteredDocuments = documents.filter(doc =>
      !searchQuery || doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="space-y-6">
        {/* 文档操作栏 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索文档..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          {isInternalEditing && (
            <button
              onClick={() => {
                // 模拟添加文档
                const newDoc: KnowledgeDocument = {
                  id: `doc_${Date.now()}`,
                  name: '新文档.pdf',
                  type: 'pdf',
                  uploadedAt: new Date().toISOString(),
                  size: 0,
                  tags: []
                };
                const newDocs = [...documents, newDoc];
                updateNestedField('knowledgeBase', 'documents', newDocs);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              上传文档
            </button>
          )}
        </div>

        {/* 文档列表 */}
        <div className="grid gap-4">
          {filteredDocuments.length > 0 ? (
            filteredDocuments.map((doc, index) => (
              <div key={doc.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className={`h-5 w-5 ${
                      doc.type === 'pdf' ? 'text-red-500' :
                      doc.type === 'txt' ? 'text-gray-500' :
                      doc.type === 'md' ? 'text-blue-500' : 'text-green-500'
                    }`} />
                    <div>
                      {isInternalEditing ? (
                        <input
                          type="text"
                          value={doc.name}
                          onChange={(e) => {
                            const updatedDocs = [...documents];
                            updatedDocs[index] = { ...doc, name: e.target.value };
                            updateNestedField('knowledgeBase', 'documents', updatedDocs);
                          }}
                          className="font-medium text-gray-900 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                        />
                      ) : (
                        <h4 className="font-medium text-gray-900">{doc.name}</h4>
                      )}
                      <p className="text-sm text-gray-500">
                        {doc.size > 0 ? `${(doc.size / 1024).toFixed(1)} KB` : '未知大小'} •
                        上传于 {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isInternalEditing && (
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                        <Eye className="h-4 w-4" />
                      </button>
                    )}
                    {isInternalEditing && (
                      <button
                        onClick={() => {
                          const updatedDocs = documents.filter((_, i) => i !== index);
                          updateNestedField('knowledgeBase', 'documents', updatedDocs);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 文档标签 */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {doc.tags.map((tag, tagIndex) => (
                    <span key={tagIndex} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                  {isInternalEditing && (
                    <button
                      onClick={() => {
                        // 简单的标签添加逻辑
                        const newTag = prompt('请输入标签名称：');
                        if (newTag) {
                          const updatedDocs = [...documents];
                          updatedDocs[index] = { ...doc, tags: [...doc.tags, newTag] };
                          updateNestedField('knowledgeBase', 'documents', updatedDocs);
                        }
                      }}
                      className="px-2 py-1 border border-dashed border-gray-300 text-gray-500 text-xs rounded hover:border-blue-300 hover:text-blue-600"
                    >
                      + 标签
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>暂无文档资源</p>
              {isInternalEditing && <p className="text-sm mt-1">点击上传文档按钮添加文档</p>}
            </div>
          )}
        </div>
      </div>
    );
  };

  // 渲染FAQ管理
  const renderFAQManagement = () => {
    const faqs = currentEmployee.knowledgeBase?.faqItems || [];
    const filteredFAQs = faqs.filter(faq =>
      !searchQuery ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="space-y-6">
        {/* FAQ操作栏 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索FAQ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          {isInternalEditing && (
            <button
              onClick={() => {
                const newFAQ: FAQItem = {
                  id: `faq_${Date.now()}`,
                  question: '新问题',
                  answer: '新答案',
                  tags: [],
                  confidence: 0.8,
                  usageCount: 0,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                };
                const newFAQs = [...faqs, newFAQ];
                updateNestedField('knowledgeBase', 'faqItems', newFAQs);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="h-4 w-4" />
              添加FAQ
            </button>
          )}
        </div>

        {/* FAQ列表 */}
        <div className="space-y-4">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq, index) => (
              <div key={faq.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <HelpCircle className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium text-orange-700">问题</span>
                    </div>
                    {isInternalEditing ? (
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => {
                          const updatedFAQs = [...faqs];
                          updatedFAQs[index] = { ...faq, question: e.target.value };
                          updateNestedField('knowledgeBase', 'faqItems', updatedFAQs);
                        }}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{faq.question}</p>
                    )}
                  </div>
                  {isInternalEditing && (
                    <button
                      onClick={() => {
                        const updatedFAQs = faqs.filter((_, i) => i !== index);
                        updateNestedField('knowledgeBase', 'faqItems', updatedFAQs);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-700">答案</span>
                  </div>
                  {isInternalEditing ? (
                    <textarea
                      value={faq.answer}
                      onChange={(e) => {
                        const updatedFAQs = [...faqs];
                        updatedFAQs[index] = { ...faq, answer: e.target.value };
                        updateNestedField('knowledgeBase', 'faqItems', updatedFAQs);
                      }}
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-700">{faq.answer}</p>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <span>置信度: {(faq.confidence * 100).toFixed(1)}%</span>
                    <span>使用次数: {faq.usageCount}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {faq.tags.map((tag, tagIndex) => (
                      <span key={tagIndex} className="px-1 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <HelpCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>暂无FAQ内容</p>
              {isInternalEditing && <p className="text-sm mt-1">点击添加FAQ按钮创建问答对</p>}
            </div>
          )}
        </div>
      </div>
    );
  };

  // 渲染积累知识
  const renderLearnedKnowledge = () => {
    const learnedItems = currentEmployee.knowledgeBase?.autoLearnedItems || [];
    const filteredItems = learnedItems.filter(item =>
      !searchQuery || item.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="space-y-6">
        {/* 积累知识说明 */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-900">智能学习积累</span>
          </div>
          <p className="text-blue-800 text-sm">
            数字员工在对话过程中自主学习和积累的知识，需要人工审核后才能正式纳入知识库。
          </p>
        </div>

        {/* 搜索栏 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索积累知识..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 积累知识列表 */}
        <div className="space-y-4">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      item.reviewStatus === 'approved' ? 'bg-green-500' :
                      item.reviewStatus === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                    <span className="text-sm font-medium text-gray-900">
                      {item.source === 'conversation' ? '对话学习' :
                       item.source === 'feedback' ? '反馈学习' : '外部学习'}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded ${
                      item.reviewStatus === 'approved' ? 'bg-green-100 text-green-700' :
                      item.reviewStatus === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {item.reviewStatus === 'approved' ? '已审核' :
                       item.reviewStatus === 'rejected' ? '已拒绝' : '待审核'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    置信度: {(item.confidence * 100).toFixed(1)}%
                  </div>
                </div>

                <p className="text-gray-700 mb-3">{item.content}</p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <span>学习时间: {new Date(item.learnedAt).toLocaleDateString()}</span>
                    {item.reviewedAt && (
                      <span>审核时间: {new Date(item.reviewedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag, tagIndex) => (
                      <span key={tagIndex} className="px-1 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {isInternalEditing && item.reviewStatus === 'pending' && (
                  <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2">
                    <button
                      onClick={() => {
                        const updatedItems = [...learnedItems];
                        updatedItems[index] = {
                          ...item,
                          reviewStatus: 'approved',
                          reviewedAt: new Date().toISOString(),
                          reviewedBy: 'current-user'
                        };
                        updateNestedField('knowledgeBase', 'autoLearnedItems', updatedItems);
                      }}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      批准
                    </button>
                    <button
                      onClick={() => {
                        const updatedItems = [...learnedItems];
                        updatedItems[index] = {
                          ...item,
                          reviewStatus: 'rejected',
                          reviewedAt: new Date().toISOString(),
                          reviewedBy: 'current-user'
                        };
                        updateNestedField('knowledgeBase', 'autoLearnedItems', updatedItems);
                      }}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      拒绝
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>暂无积累知识</p>
              <p className="text-sm mt-1">数字员工会在对话过程中自动积累知识</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 渲染知识图谱
  const renderKnowledgeGraph = () => {
    const knowledgeGraph = currentEmployee.knowledgeBase?.knowledgeGraph;

    if (!knowledgeGraph) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Network className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>暂未生成知识图谱</p>
          <p className="text-sm mt-1">需要先添加文档和FAQ才能生成知识图谱</p>
          {isInternalEditing && (
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              生成知识图谱
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* 知识图谱统计 */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <div className="text-2xl font-bold text-blue-600">{knowledgeGraph.entities.length}</div>
            <div className="text-sm text-gray-600">实体节点</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <div className="text-2xl font-bold text-green-600">{knowledgeGraph.relations.length}</div>
            <div className="text-sm text-gray-600">关系连接</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {knowledgeGraph.statistics.avgConnectivity.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">平均连接度</div>
          </div>
        </div>

        {/* 知识图谱可视化 */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              知识图谱可视化
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              可视化展示知识实体间的关联关系，最后更新于 {new Date(knowledgeGraph.lastUpdated).toLocaleString()}
            </p>
          </div>
          <KnowledgeGraphViewer
            data={{
              nodes: knowledgeGraph.entities.map(entity => ({
                id: entity.id,
                name: entity.name,
                type: entity.type as any,
                x: Math.random() * 600 + 100,
                y: Math.random() * 400 + 100,
                size: 20 + Math.random() * 15,
                confidence: entity.confidence || 0.8,
                properties: entity.properties
              })),
              edges: knowledgeGraph.relations.map(relation => ({
                id: relation.id,
                source: relation.sourceId,
                target: relation.targetId,
                type: relation.type as any,
                weight: relation.strength || 0.5,
                label: relation.label
              })),
              metadata: {
                totalNodes: knowledgeGraph.entities.length,
                totalEdges: knowledgeGraph.relations.length,
                lastUpdated: knowledgeGraph.lastUpdated
              }
            }}
            height={400}
            interactive={true}
            showControls={true}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
          />
        </div>
      </div>
    );
  };

  // 渲染Tab内容
  const renderTabContent = () => {
    switch (activeKnowledgeTab) {
      case 'documents':
        return renderDocumentManagement();
      case 'faq':
        return renderFAQManagement();
      case 'learned':
        return renderLearnedKnowledge();
      case 'graph':
        return renderKnowledgeGraph();
      default:
        return renderDocumentManagement();
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      {/* 标题和编辑按钮 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Database className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">知识资产</h3>
          <DataSourceIndicator type="mixed" variant="dot" size="sm" />
          {isInternalEditing && (
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
              编辑模式
            </span>
          )}
        </div>

        {!isInternalEditing ? (
          <button
            onClick={handleInternalEdit}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-1 px-3 py-2 border border-blue-200 rounded-lg hover:bg-blue-50"
          >
            <Edit3 className="h-4 w-4" />
            编辑
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleInternalCancel}
              className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              取消
            </button>
            <button
              onClick={handleInternalSave}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
            >
              <Save className="h-4 w-4" />
              保存
            </button>
          </div>
        )}
      </div>

      <p className="text-gray-600 mb-6">
        统一管理数字员工的所有知识资产，包括初始文档、FAQ问答、积累知识和知识图谱。
      </p>

      {/* 知识资产Tab导航 */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-0">
          {knowledgeTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeKnowledgeTab;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveKnowledgeTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{tab.title}</span>
                    {tab.count > 0 && (
                      <span className="bg-gray-200 text-gray-700 px-1.5 py-0.5 text-xs rounded-full">
                        {tab.count}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 hidden sm:block">{tab.description}</div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab内容 */}
      <div>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default KnowledgeAssetsSection;