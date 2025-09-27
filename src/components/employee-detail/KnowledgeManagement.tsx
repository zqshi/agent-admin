/**
 * 知识库管理组件
 * 集成记忆系统，提供知识与记忆的深度融合管理
 */

import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  FileText,
  HelpCircle,
  Plus,
  Upload,
  Search,
  Filter,
  Download,
  Eye,
  Edit3,
  Trash2,
  Brain,
  Network,
  TrendingUp,
  Link,
  Zap
} from 'lucide-react';
import { useMemorySystem } from '../../features/memory-engine/hooks';
import { MemoryDashboard, SemanticMemory, WorkingMemory } from '../../features/memory-engine/components';
import documentService, { type DocumentFile, type DocumentViewData } from '../../services/DocumentService';
import faqService, { type FAQItem, type CreateFAQRequest } from '../../services/FAQService';
import { useToast, ToastContainer, DataSourceIndicator } from '../common';
import type { DigitalEmployee } from '../../types/employee';
import type { EnhancedMemoryEntry } from '../../features/memory-engine/types';

interface KnowledgeManagementProps {
  employee: DigitalEmployee;
}

const KnowledgeManagement: React.FC<KnowledgeManagementProps> = ({ employee }) => {
  const [activeTab, setActiveTab] = useState<'static-knowledge' | 'dynamic-knowledge' | 'memory-system' | 'knowledge-flow'>('static-knowledge');
  const [staticKnowledgeView, setStaticKnowledgeView] = useState<'documents' | 'faq'>('documents');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKnowledge, setSelectedKnowledge] = useState<any>(null);
  const [memoryViewMode, setMemoryViewMode] = useState<'semantic' | 'working' | 'dashboard'>('semantic');

  // 新增状态管理
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentViewData | null>(null);
  const [editingFAQ, setEditingFAQ] = useState<FAQItem | null>(null);
  const [documents, setDocuments] = useState(employee.knowledgeBase.documents);
  const [faqs, setFaqs] = useState(employee.knowledgeBase.faqItems);
  const { messages, toast, removeToast } = useToast();

  // 集成记忆系统
  const {
    memorySystem,
    systemState,
    layerStates,
    isLoading: memoryLoading,
    storeMemory,
    searchMemories,
    transferMemory,
    deleteMemory,
    refreshMemories
  } = useMemorySystem(employee.id);

  const { knowledgeBase } = employee;

  // 过滤文档
  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // 过滤FAQ
  const filteredFAQ = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 获取文件类型图标
  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return '📄';
      case 'doc':
        return '📝';
      case 'txt':
        return '📋';
      case 'md':
        return '📖';
      case 'url':
        return '🔗';
      default:
        return '📁';
    }
  };

  // 计算知识与记忆的关联统计
  const knowledgeMemoryStats = useMemo(() => {
    const semanticMemories = memorySystem?.semantic || [];
    const workingMemories = memorySystem?.working || [];

    return {
      semanticCount: semanticMemories.length,
      workingCount: workingMemories.length,
      totalRelated: semanticMemories.filter(m =>
        m.tags.some(tag =>
          knowledgeBase.documents.some(doc => doc.tags.includes(tag))
        )
      ).length,
      knowledgeToMemoryMap: new Map()
    };
  }, [memorySystem, knowledgeBase]);

  const tabs = [
    {
      id: 'static-knowledge',
      label: '静态知识',
      icon: FileText,
      count: documents.length + faqs.length,
      type: 'config',
      description: '文档库和手动创建的FAQ，属于创建时配置的知识'
    },
    {
      id: 'dynamic-knowledge',
      label: '动态知识',
      icon: BookOpen,
      count: knowledgeBase.autoLearnedItems?.length || 0,
      type: 'operational',
      description: '自学知识和AI生成内容，属于运营时沉淀的知识'
    },
    {
      id: 'memory-system',
      label: '记忆系统',
      icon: Brain,
      count: knowledgeMemoryStats.semanticCount,
      type: 'operational',
      description: '五层记忆架构中存储的知识和经验'
    },
    {
      id: 'knowledge-flow',
      label: '知识流转',
      icon: Network,
      count: 0,
      type: 'analytical',
      description: '知识之间的转换关系和流转过程可视化'
    }
  ];

  // 处理文档到记忆的转换
  const handleDocumentToMemory = async (doc: any) => {
    try {
      const memoryEntry = {
        layer: 'semantic' as const,
        type: 'knowledge_document',
        content: `文档知识: ${doc.name} - ${doc.extractedContent || '暂无内容'}`,
        contentType: 'text' as const,
        metadata: {
          documentId: doc.id,
          documentName: doc.name,
          documentType: doc.type,
          originalTags: doc.tags
        },
        confidence: 0.9,
        importance: 0.8,
        clarity: 0.85,
        stability: 0.9,
        emotionalValence: 0,
        emotionalIntensity: 0,
        emotionalTags: [],
        accessCount: 1,
        activationCount: 0,
        reinforcementCount: 0,
        decayRate: 0.05,
        associations: [],
        contextIds: [],
        derivedFrom: [],
        influences: [],
        source: 'document' as const,
        sourceDetails: {
          originalSource: 'knowledge_base',
          timestamp: new Date()
        },
        state: 'active' as const,
        tags: ['知识文档', ...doc.tags],
        categories: ['文档知识'],
        domainKnowledge: [doc.type]
      };

      await storeMemory(memoryEntry);
      console.log(`文档 ${doc.name} 已转换为语义记忆`);
    } catch (error) {
      console.error('文档转换失败:', error);
    }
  };

  // 处理FAQ到记忆的转换
  const handleFAQToMemory = async (faq: any) => {
    try {
      const memoryEntry = {
        layer: 'semantic' as const,
        type: 'faq_knowledge',
        content: `FAQ知识: Q: ${faq.question} A: ${faq.answer}`,
        contentType: 'structured' as const,
        metadata: {
          faqId: faq.id,
          question: faq.question,
          answer: faq.answer,
          confidence: faq.confidence,
          usageCount: faq.usageCount
        },
        confidence: faq.confidence,
        importance: 0.7,
        clarity: 0.9,
        stability: 0.8,
        emotionalValence: 0,
        emotionalIntensity: 0,
        emotionalTags: [],
        accessCount: faq.usageCount,
        activationCount: 0,
        reinforcementCount: 0,
        decayRate: 0.03,
        associations: [],
        contextIds: [],
        derivedFrom: [],
        influences: [],
        source: 'training' as const,
        sourceDetails: {
          originalSource: 'faq_system',
          timestamp: new Date()
        },
        state: 'active' as const,
        tags: ['FAQ知识', ...faq.tags],
        categories: ['问答知识'],
        domainKnowledge: ['FAQ']
      };

      await storeMemory(memoryEntry);
      console.log(`FAQ ${faq.question} 已转换为语义记忆`);
    } catch (error) {
      console.error('FAQ转换失败:', error);
    }
  };

  // 处理记忆选择
  const handleMemorySelect = (memory: EnhancedMemoryEntry) => {
    setSelectedKnowledge({
      type: 'memory',
      data: memory
    });
  };


  // 文档上传处理
  const handleDocumentUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.pdf,.doc,.docx,.txt,.md,.xlsx,.xls,.csv,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.bmp,.zip,.rar';

    input.onchange = async (event) => {
      const files = (event.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;

      setIsUploading(true);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // 验证文件类型和大小
        if (!documentService.validateFileType(file.name)) {
          toast.error('文件类型不支持', `文件 ${file.name} 类型不支持`);
          continue;
        }

        if (!documentService.validateFileSize(file.size)) {
          toast.error('文件大小超限', `文件 ${file.name} 大小超出限制（最大10MB）`);
          continue;
        }

        try {
          const result = await documentService.uploadDocument(file, ['新上传']);
          if (result.success && result.document) {
            setDocuments(prev => [...prev, result.document!]);
            toast.success('上传成功', `文档 ${file.name} 上传成功`);
          } else {
            toast.error('上传失败', `文档 ${file.name} 上传失败: ${result.error}`);
          }
        } catch (error) {
          toast.error('上传失败', `文档 ${file.name} 上传失败`);
        }
      }

      setIsUploading(false);
    };

    input.click();
  };

  // 查看文档
  const handleViewDocument = async (docId: string) => {
    setIsLoading(true);
    try {
      const docData = await documentService.getDocumentForView(docId);
      if (docData) {
        setSelectedDocument(docData);
        setShowDocumentModal(true);
      } else {
        toast.error('加载失败', '无法加载文档内容');
      }
    } catch (error) {
      toast.error('加载失败', '加载文档失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 下载文档
  const handleDownloadDocument = async (doc: any) => {
    setIsLoading(true);
    try {
      const success = await documentService.downloadDocument(doc.id, doc.name);
      if (success) {
        toast.success('下载开始', '文档下载已开始');
      } else {
        toast.error('下载失败', '文档下载失败');
      }
    } catch (error) {
      toast.error('下载失败', '文档下载失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 删除文档
  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('确定要删除这个文档吗？')) return;

    setIsLoading(true);
    try {
      const success = await documentService.deleteDocument(docId);
      if (success) {
        setDocuments(prev => prev.filter(doc => doc.id !== docId));
        toast.success('删除成功', '文档已成功删除');
      } else {
        toast.error('删除失败', '文档删除失败');
      }
    } catch (error) {
      toast.error('删除失败', '文档删除失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 添加FAQ
  const handleAddFAQ = () => {
    setEditingFAQ(null);
    setShowFAQModal(true);
  };

  // 编辑FAQ
  const handleEditFAQ = (faq: any) => {
    setEditingFAQ(faq);
    setShowFAQModal(true);
  };

  // 保存FAQ
  const handleSaveFAQ = async (faqData: CreateFAQRequest) => {
    setIsLoading(true);
    try {
      if (editingFAQ) {
        // 更新现有FAQ
        const success = await faqService.updateFAQ({ ...faqData, id: editingFAQ.id });
        if (success) {
          setFaqs(prev => prev.map(faq =>
            faq.id === editingFAQ.id
              ? { ...faq, ...faqData, updatedAt: new Date().toISOString() }
              : faq
          ));
          toast.success('更新成功', 'FAQ已成功更新');
        } else {
          toast.error('更新失败', 'FAQ更新失败');
        }
      } else {
        // 创建新FAQ
        const newFAQ = await faqService.createFAQ(faqData);
        if (newFAQ) {
          setFaqs(prev => [...prev, newFAQ]);
          toast.success('添加成功', 'FAQ已成功添加');
        } else {
          toast.error('添加失败', 'FAQ添加失败');
        }
      }
      setShowFAQModal(false);
      setEditingFAQ(null);
    } catch (error) {
      toast.error('操作失败', '操作过程中出现错误');
    } finally {
      setIsLoading(false);
    }
  };

  // 删除FAQ
  const handleDeleteFAQ = async (faqId: string) => {
    if (!confirm('确定要删除这个FAQ吗？')) return;

    setIsLoading(true);
    try {
      const success = await faqService.deleteFAQ(faqId);
      if (success) {
        setFaqs(prev => prev.filter(faq => faq.id !== faqId));
        toast.success('删除成功', 'FAQ已成功删除');
      } else {
        toast.error('删除失败', 'FAQ删除失败');
      }
    } catch (error) {
      toast.error('删除失败', 'FAQ删除失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 批准自学知识
  const handleApproveAutoLearned = async (item: any) => {
    setIsLoading(true);
    try {
      const approvedFAQ = await faqService.approveAutoLearnedItem(item.id);
      if (approvedFAQ) {
        setFaqs(prev => [...prev, approvedFAQ]);
        // 从自学知识列表中移除（实际项目中需要更新employee数据）
        toast.success('批准成功', '自学知识已批准并转换为FAQ');
      } else {
        toast.error('批准失败', '批准操作失败');
      }
    } catch (error) {
      toast.error('批准失败', '批准操作失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 拒绝自学知识
  const handleRejectAutoLearned = async (item: any) => {
    if (!confirm('确定要拒绝这个自学知识吗？')) return;

    setIsLoading(true);
    try {
      const success = await faqService.rejectAutoLearnedItem(item.id, '质量不符合要求');
      if (success) {
        // 从自学知识列表中移除（实际项目中需要更新employee数据）
        toast.success('操作完成', '自学知识已拒绝');
      } else {
        toast.error('操作失败', '拒绝操作失败');
      }
    } catch (error) {
      toast.error('操作失败', '操作过程中出现错误');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">知识库管理</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDocumentUpload}
            disabled={isUploading}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-1 px-3 py-1 border border-blue-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="h-4 w-4" />
            {isUploading ? '上传中...' : '上传文档'}
          </button>
          <button
            onClick={handleAddFAQ}
            className="text-green-600 hover:text-green-700 flex items-center gap-1 px-3 py-1 border border-green-200 rounded-lg"
          >
            <Plus className="h-4 w-4" />
            添加FAQ
          </button>
        </div>
      </div>

      {/* Tab导航 */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-2 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                title={tab.description}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {tab.count}
                </span>
                <DataSourceIndicator
                  type={
                    tab.type === 'config' ? 'config' :
                    tab.type === 'operational' ? 'operational' :
                    tab.type === 'analytical' ? 'ai-generated' : 'mixed'
                  }
                  size="sm"
                  variant="tooltip"
                  showIcon={true}
                />
              </button>
            );
          })}
        </nav>

        {/* Tab描述 */}
        <div className="mt-3 mb-1">
          <p className="text-sm text-gray-600">
            {tabs.find(tab => tab.id === activeTab)?.description}
          </p>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="搜索知识库..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
          <Filter className="h-4 w-4" />
          筛选
        </button>
      </div>

      {/* 静态知识（配置类知识） */}
      {activeTab === 'static-knowledge' && (
        <div className="space-y-4">
          {/* 静态知识子分类导航 */}
          <div className="flex items-center justify-between">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setStaticKnowledgeView('documents')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  staticKnowledgeView === 'documents'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                文档库 ({documents.length})
              </button>
              <button
                onClick={() => setStaticKnowledgeView('faq')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  staticKnowledgeView === 'faq'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                FAQ ({faqs.length})
              </button>
            </div>
            <div className="flex items-center gap-2">
              <DataSourceIndicator
                type="config"
                size="sm"
                variant="badge"
                label="静态配置"
              />
            </div>
          </div>

          {/* 文档库内容 */}
          {staticKnowledgeView === 'documents' && (
            <div className="space-y-3">
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc) => (
                  <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <span className="text-2xl">{getFileTypeIcon(doc.type)}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900">{doc.name}</h4>
                            <DataSourceIndicator
                              type="config"
                              size="sm"
                              variant="inline"
                              showIcon={false}
                              lastUpdated={doc.uploadedAt}
                            />
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            <span>大小: {formatFileSize(doc.size)}</span>
                            <span className="mx-2">•</span>
                            <span>上传: {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                            {doc.processedAt && (
                              <>
                                <span className="mx-2">•</span>
                                <span className="text-green-600">已处理</span>
                              </>
                            )}
                          </div>
                          {doc.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {doc.tags.map((tag, index) => (
                                <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDocument(doc.id)}
                          disabled={isLoading}
                          className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-50"
                          title="查看"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadDocument(doc)}
                          disabled={isLoading}
                          className="p-1 text-gray-400 hover:text-green-600 disabled:opacity-50"
                          title="下载"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          className="p-1 text-gray-400 hover:text-purple-600"
                          title="转换为记忆"
                          onClick={() => handleDocumentToMemory(doc)}
                        >
                          <Brain className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          disabled={isLoading}
                          className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"
                          title="删除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>暂无文档</p>
                  <p className="text-sm mt-1">点击右上角"上传文档"添加知识文档</p>
                </div>
              )}
            </div>
          )}

          {/* FAQ内容 */}
          {staticKnowledgeView === 'faq' && (
            <div className="space-y-3">
              {filteredFAQ.length > 0 ? (
                filteredFAQ.map((faq) => (
                  <div key={faq.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-gray-900">{faq.question}</h4>
                          <DataSourceIndicator
                            type="config"
                            size="sm"
                            variant="inline"
                            showIcon={false}
                            lastUpdated={faq.createdAt || faq.updatedAt}
                          />
                        </div>
                        <p className="text-gray-700 text-sm mb-3">{faq.answer}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-4">
                            <span>置信度: {(faq.confidence * 100).toFixed(0)}%</span>
                            <span>使用次数: {faq.usageCount}</span>
                            {faq.lastUsed && (
                              <span>最后使用: {new Date(faq.lastUsed).toLocaleDateString()}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditFAQ(faq)}
                              className="text-blue-600 hover:text-blue-700"
                              title="编辑"
                            >
                              <Edit3 className="h-3 w-3" />
                            </button>
                            <button
                              className="text-purple-600 hover:text-purple-700"
                              title="转换为记忆"
                              onClick={() => handleFAQToMemory(faq)}
                            >
                              <Brain className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteFAQ(faq.id)}
                              disabled={isLoading}
                              className="text-red-600 hover:text-red-700 disabled:opacity-50"
                              title="删除"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        {faq.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {faq.tags.map((tag, index) => (
                              <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <HelpCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>暂无FAQ</p>
                  <p className="text-sm mt-1">点击右上角"添加FAQ"创建常见问题</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 动态知识（运营沉淀） */}
      {activeTab === 'dynamic-knowledge' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium text-gray-900">自学知识管理</h4>
              <DataSourceIndicator
                type="operational"
                size="sm"
                variant="badge"
                label="运营沉淀"
              />
            </div>
            <div className="text-sm text-gray-600">
              共 {knowledgeBase.autoLearnedItems?.length || 0} 条待审核知识
            </div>
          </div>

          <div className="space-y-3">
            {knowledgeBase.autoLearnedItems && knowledgeBase.autoLearnedItems.length > 0 ? (
              knowledgeBase.autoLearnedItems.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-gray-900 font-medium">{item.content}</p>
                        <DataSourceIndicator
                          type="ai-generated"
                          size="sm"
                          variant="inline"
                          showIcon={false}
                          lastUpdated={item.learnedAt}
                        />
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                        <span>来源: {item.source}</span>
                        <span>置信度: {(item.confidence * 100).toFixed(0)}%</span>
                        <span className={`px-2 py-1 rounded-full ${
                          item.reviewStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          item.reviewStatus === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.reviewStatus === 'pending' ? '待审核' :
                           item.reviewStatus === 'approved' ? '已批准' : '已拒绝'}
                        </span>
                        <span>学习时间: {new Date(item.learnedAt).toLocaleDateString()}</span>
                      </div>
                      {item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.tags.map((tag, index) => (
                            <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {item.reviewStatus === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveAutoLearned(item)}
                            disabled={isLoading}
                            className="text-green-600 hover:text-green-700 text-xs px-2 py-1 border border-green-200 rounded disabled:opacity-50"
                          >
                            批准
                          </button>
                          <button
                            onClick={() => handleRejectAutoLearned(item)}
                            disabled={isLoading}
                            className="text-red-600 hover:text-red-700 text-xs px-2 py-1 border border-red-200 rounded disabled:opacity-50"
                          >
                            拒绝
                          </button>
                        </>
                      )}
                      <button
                        className="p-1 text-gray-400 hover:text-purple-600"
                        title="转换为记忆"
                        onClick={() => handleFAQToMemory(item)}
                      >
                        <Brain className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>暂无自学知识</p>
                <p className="text-sm mt-1">系统在运营过程中自动学习的知识将在此显示</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 记忆系统 */}
      {activeTab === 'memory-system' && (
        <div className="space-y-4">
          {/* 记忆视图切换 */}
          <div className="flex items-center justify-between">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setMemoryViewMode('semantic')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  memoryViewMode === 'semantic'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                语义记忆
              </button>
              <button
                onClick={() => setMemoryViewMode('working')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  memoryViewMode === 'working'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                工作记忆
              </button>
              <button
                onClick={() => setMemoryViewMode('dashboard')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  memoryViewMode === 'dashboard'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                系统概览
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>记忆状态:</span>
                <div className={`w-2 h-2 rounded-full ${
                  memoryLoading ? 'bg-yellow-400' :
                  systemState?.isHealthy ? 'bg-green-400' : 'bg-red-400'
                }`}></div>
                <span>{memoryLoading ? '同步中' : systemState?.isHealthy ? '正常' : '异常'}</span>
              </div>
              <DataSourceIndicator
                type="operational"
                size="sm"
                variant="badge"
                label="运营数据"
              />
            </div>
          </div>

          {/* 记忆系统内容区域 */}
          <div className="min-h-96">
            {memoryViewMode === 'semantic' && (
              <SemanticMemory
                employeeId={employee.id}
                memories={memorySystem?.semantic || []}
                layerState={layerStates?.semantic || null}
                onMemorySelect={handleMemorySelect}
                onMemoryTransfer={transferMemory}
                onConceptExplore={(conceptId) => console.log('探索概念:', conceptId)}
              />
            )}

            {memoryViewMode === 'working' && (
              <WorkingMemory
                employeeId={employee.id}
                memories={memorySystem?.working || []}
                layerState={layerStates?.working || null}
                onMemorySelect={handleMemorySelect}
                onMemoryTransfer={transferMemory}
                onMemoryDelete={(memoryId) => deleteMemory(memoryId)}
                onRefresh={refreshMemories}
              />
            )}

            {memoryViewMode === 'dashboard' && (
              <MemoryDashboard
                employeeId={employee.id}
                onMemorySelect={handleMemorySelect}
                onMemoryTransfer={transferMemory}
                onSkillExecute={(skillId) => console.log('执行技能:', skillId)}
                onConceptExplore={(conceptId) => console.log('探索概念:', conceptId)}
                onEmotionalInsightView={(insightId) => console.log('情感洞察:', insightId)}
              />
            )}
          </div>
        </div>
      )}

      {/* 知识流转可视化 */}
      {activeTab === 'knowledge-flow' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium text-gray-900">知识流转可视化</h4>
              <DataSourceIndicator
                type="ai-generated"
                size="sm"
                variant="badge"
                label="智能分析"
              />
            </div>
          </div>

          {/* 知识流转统计 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600 font-medium">文档 → 记忆</p>
                  <p className="text-lg font-bold text-blue-900">12</p>
                  <p className="text-xs text-blue-700">本月转换</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-green-600 font-medium">FAQ → 记忆</p>
                  <p className="text-lg font-bold text-green-900">8</p>
                  <p className="text-xs text-green-700">本月转换</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-purple-600 font-medium">自学 → FAQ</p>
                  <p className="text-lg font-bold text-purple-900">5</p>
                  <p className="text-xs text-purple-700">本月批准</p>
                </div>
              </div>
            </div>
          </div>

          {/* 知识流转图 */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 min-h-64">
            <div className="text-center text-gray-500">
              <Network className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">知识流转关系图</h3>
              <p className="text-sm">显示知识在不同存储形式间的转换和流转过程</p>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>静态知识</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>动态知识</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded"></div>
                  <span>记忆系统</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded"></div>
                  <span>知识流转</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* 文档查看模态框 */}
      {showDocumentModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-5/6 w-full m-4 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">{selectedDocument.name}</h3>
              <button
                onClick={() => setShowDocumentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="flex-1 p-4 overflow-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-700">
                {selectedDocument.content}
              </pre>
              <div className="mt-4 pt-4 border-t">
                <div className="text-sm text-gray-500 space-y-1">
                  <p>文件大小: {(selectedDocument.metadata.size / 1024).toFixed(1)} KB</p>
                  <p>上传时间: {new Date(selectedDocument.metadata.uploadedAt).toLocaleString()}</p>
                  <p>标签: {selectedDocument.metadata.tags.join(', ')}</p>
                  {selectedDocument.metadata.extractedKeywords && (
                    <p>关键词: {selectedDocument.metadata.extractedKeywords.join(', ')}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAQ添加/编辑模态框 */}
      {showFAQModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full m-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                {editingFAQ ? '编辑FAQ' : '添加FAQ'}
              </h3>
              <button
                onClick={() => setShowFAQModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <FAQForm
              initialData={editingFAQ}
              onSave={handleSaveFAQ}
              onCancel={() => setShowFAQModal(false)}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}

      {/* Toast通知容器 */}
      <ToastContainer messages={messages} onClose={removeToast} />
    </div>
  );
};

// FAQ表单组件
interface FAQFormProps {
  initialData?: FAQItem | null;
  onSave: (data: CreateFAQRequest) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const FAQForm: React.FC<FAQFormProps> = ({ initialData, onSave, onCancel, isLoading }) => {
  const [question, setQuestion] = useState(initialData?.question || '');
  const [answer, setAnswer] = useState(initialData?.answer || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [tags, setTags] = useState(initialData?.tags?.join(', ') || '');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(initialData?.priority || 'medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      // 这里无法直接使用toast，所以仍然使用alert
      alert('请填写问题和答案');
      return;
    }

    onSave({
      question: question.trim(),
      answer: answer.trim(),
      category: category.trim() || '其他',
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      priority
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">问题 *</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="请输入问题"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">答案 *</label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={4}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="请输入答案"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="如：技术支持"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">优先级</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">标签</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="多个标签用逗号分隔"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '保存中...' : '保存'}
        </button>
      </div>
    </form>
  );
};

export default KnowledgeManagement;