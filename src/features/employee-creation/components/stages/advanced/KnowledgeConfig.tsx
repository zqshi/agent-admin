/**
 * 知识配置组件
 */

import React, { useState } from 'react';
import { Upload, FileText, HelpCircle, Database, GitBranch, Settings, Plus, Eye, Download, Trash2, Copy, CheckCircle, AlertCircle, Loader, Shield, Info, Save, RotateCcw, Lightbulb } from 'lucide-react';
import { useCreationStore } from '../../../stores/creationStore';
import type { AdvancedConfig } from '../../../types';

// Props接口定义
interface KnowledgeConfigProps {
  config?: AdvancedConfig['knowledge'];
  onChange?: (updates: Partial<AdvancedConfig['knowledge']>) => void;
  showBatchActions?: boolean; // 控制是否显示批量操作（导出、复制等）
}

// 工具提示组件
const Tooltip: React.FC<{ content: string; children: React.ReactNode }> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute z-10 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

const KnowledgeConfig: React.FC<KnowledgeConfigProps> = ({ config, onChange, showBatchActions = false }) => {
  const store = useCreationStore();

  // 判断是领域模式还是全局模式
  const isGlobalMode = !config && !onChange;
  const actualConfig = config || store.advancedConfig?.knowledge;
  const actualOnChange = onChange || ((updates: Partial<AdvancedConfig['knowledge']>) => {
    store.updateAdvancedConfig({ knowledge: { ...store.advancedConfig?.knowledge, ...updates } });
  });
  const [activeTab, setActiveTab] = useState<'documents' | 'faq' | 'settings'>('documents');

  // 知识库配置状态 - 改为多选支持
  const [selectedKbTypes, setSelectedKbTypes] = useState<string[]>(['internal']); // 支持多选
  const [kbConfigs, setKbConfigs] = useState({
    internal: {
      storagePath: '/data/knowledge',
      indexStrategy: 'vector',
      updateFrequency: 'realtime'
    },
    external: {
      apiEndpoint: '',
      authToken: '',
      syncStrategy: 'pull',
      connectionTimeout: 30
    },
    hybrid: {
      dataSourceWeights: {
        internal: 0.7,
        external: 0.3
      },
      mergeStrategy: 'priority',
      conflictResolution: 'latest'
    }
  });

  // 知识沉淀策略状态（多选）
  const [knowledgeRetentionEnabled, setKnowledgeRetentionEnabled] = useState(false);
  const [selectedRetentionStrategies, setSelectedRetentionStrategies] = useState<string[]>([]);
  // 策略权重配置
  const [strategyWeights, setStrategyWeights] = useState<Record<string, number>>({});
  // 配置验证状态
  const [validationResults, setValidationResults] = useState<Record<string, {
    isValid: boolean;
    message: string;
    isValidating?: boolean;
  }>>({});
  // 用户体验状态
  const [showConfigPreview, setShowConfigPreview] = useState(false);
  const [showSmartSuggestions, setShowSmartSuggestions] = useState(false);

  // 各个策略的特定配置
  const [strategyConfigs, setStrategyConfigs] = useState({
    internalize: {
      learningRate: 0.01,
      modelDepth: 'medium',
      adaptationThreshold: 0.8
    },
    externalize: {
      storagePath: '/data/external_knowledge',
      fileFormat: 'json',
      compressionEnabled: true
    },
    structured: {
      categoryTemplate: 'default',
      fieldMapping: 'auto',
      hierarchyDepth: 3
    },
    contextual: {
      associationDepth: 5,
      retentionDuration: '30d',
      contextWindow: 10
    }
  });

  // 文档上传状态
  const [uploadedDocuments, setUploadedDocuments] = useState<Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    uploadedAt: string;
    status: 'uploading' | 'processing' | 'completed' | 'failed';
    progress: number;
    extractedText?: string;
    summary?: string;
  }>>([]);

  const [isDragOver, setIsDragOver] = useState(false);

  // FAQ管理状态
  const [faqs, setFaqs] = useState<Array<{
    id: string;
    question: string;
    answer: string;
    category: string;
    tags: string[];
    confidence: number;
    createdAt: string;
  }>>([
    {
      id: '1',
      question: '如何重置密码？',
      answer: '您可以在登录页面点击"忘记密码"，然后按照邮件提示重置密码。',
      category: '账户管理',
      tags: ['密码', '重置', '账户'],
      confidence: 0.95,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      question: '支持哪些支付方式？',
      answer: '我们支持微信支付、支付宝、银行卡等多种支付方式。',
      category: '支付问题',
      tags: ['支付', '方式'],
      confidence: 0.92,
      createdAt: '2024-01-02T00:00:00Z'
    }
  ]);

  // 文档上传处理
  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;

    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt', '.md'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    for (const file of Array.from(files)) {
      // 验证文件类型
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedTypes.includes(fileExtension)) {
        alert(`不支持的文件类型: ${file.name}`);
        continue;
      }

      // 验证文件大小
      if (file.size > maxSize) {
        alert(`文件过大: ${file.name} (最大10MB)`);
        continue;
      }

      // 创建上传记录
      const documentId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const newDocument = {
        id: documentId,
        name: file.name,
        type: fileExtension,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        status: 'uploading' as const,
        progress: 0
      };

      setUploadedDocuments(prev => [...prev, newDocument]);

      // 模拟上传过程
      try {
        await simulateFileUpload(documentId, file);
      } catch (error) {
        console.error('文件上传失败:', error);
        setUploadedDocuments(prev =>
          prev.map(doc =>
            doc.id === documentId
              ? { ...doc, status: 'failed', progress: 0 }
              : doc
          )
        );
      }
    }
  };

  // 模拟文件上传和处理
  const simulateFileUpload = async (documentId: string, file: File) => {
    // 模拟上传进度
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setUploadedDocuments(prev =>
        prev.map(doc =>
          doc.id === documentId
            ? { ...doc, progress }
            : doc
        )
      );
    }

    // 上传完成，开始处理
    setUploadedDocuments(prev =>
      prev.map(doc =>
        doc.id === documentId
          ? { ...doc, status: 'processing', progress: 100 }
          : doc
      )
    );

    // 模拟文档处理
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 模拟提取的文本内容
    const mockExtractedText = `这是从文件 ${file.name} 中提取的示例文本内容。在实际应用中，这里会是文档的真实内容。`;
    const mockSummary = `${file.name} 的内容摘要：包含重要的业务信息和操作指南。`;

    setUploadedDocuments(prev =>
      prev.map(doc =>
        doc.id === documentId
          ? {
              ...doc,
              status: 'completed',
              extractedText: mockExtractedText,
              summary: mockSummary
            }
          : doc
      )
    );
  };

  // 拖拽处理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  // 删除文档
  const handleDeleteDocument = (docId: string) => {
    if (confirm('确定要删除此文档吗？')) {
      setUploadedDocuments(prev => prev.filter(doc => doc.id !== docId));
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 添加FAQ
  const handleAddFAQ = () => {
    const newFAQ = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      question: '',
      answer: '',
      category: '其他',
      tags: [],
      confidence: 1.0,
      createdAt: new Date().toISOString()
    };
    setFaqs(prev => [...prev, newFAQ]);
  };

  // 删除FAQ
  const handleDeleteFAQ = (faqId: string) => {
    if (confirm('确定要删除此FAQ吗？')) {
      setFaqs(prev => prev.filter(faq => faq.id !== faqId));
    }
  };

  // 更新FAQ
  const handleUpdateFAQ = (faqId: string, field: string, value: string) => {
    setFaqs(prev =>
      prev.map(faq =>
        faq.id === faqId
          ? { ...faq, [field]: value }
          : faq
      )
    );
  };

  // 更新知识库配置
  const updateKbConfig = (type: 'internal' | 'external' | 'hybrid', field: string, value: any) => {
    setKbConfigs(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  };

  // 处理知识库类型变更（多选）
  const handleKbTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setSelectedKbTypes(prev => [...prev, type]);
    } else {
      setSelectedKbTypes(prev => prev.filter(t => t !== type));
    }
  };

  // 检查是否是混合模式（内部和外部都选中）
  const isHybridMode = selectedKbTypes.includes('internal') && selectedKbTypes.includes('external');

  // 处理知识沉淀策略变更（多选）
  const handleRetentionStrategyChange = (strategy: string, checked: boolean) => {
    let newStrategies: string[];
    if (checked) {
      newStrategies = [...selectedRetentionStrategies, strategy];
    } else {
      newStrategies = selectedRetentionStrategies.filter(s => s !== strategy);
    }

    setSelectedRetentionStrategies(newStrategies);

    // 自动分配权重（平均分配）
    if (newStrategies.length > 0) {
      const equalWeight = Math.round(100 / newStrategies.length);
      const newWeights: Record<string, number> = {};

      newStrategies.forEach((s, index) => {
        if (index === newStrategies.length - 1) {
          // 最后一个策略补齐剩余的权重，确保总和为100
          newWeights[s] = 100 - (equalWeight * (newStrategies.length - 1));
        } else {
          newWeights[s] = equalWeight;
        }
      });

      setStrategyWeights(newWeights);
    } else {
      setStrategyWeights({});
    }
  };

  // 更新策略配置
  const updateStrategyConfig = (strategy: string, field: string, value: any) => {
    setStrategyConfigs(prev => ({
      ...prev,
      [strategy]: {
        ...prev[strategy as keyof typeof prev],
        [field]: value
      }
    }));
  };

  // 处理权重变更，确保总和为100%
  const handleWeightChange = (changedStrategy: string, newWeight: number) => {
    const otherStrategies = selectedRetentionStrategies.filter(s => s !== changedStrategy);
    const otherWeightsSum = otherStrategies.reduce((sum, strategy) => sum + (strategyWeights[strategy] || 0), 0);

    // 如果新权重超过了剩余空间，调整到最大值
    const maxWeight = 100 - otherWeightsSum;
    const adjustedWeight = Math.min(Math.max(newWeight, 0), maxWeight);

    setStrategyWeights(prev => ({
      ...prev,
      [changedStrategy]: adjustedWeight
    }));

    // 如果有剩余权重，平均分配给其他策略
    const remaining = 100 - adjustedWeight;
    if (otherStrategies.length > 0) {
      const avgRemaining = Math.floor(remaining / otherStrategies.length);
      const newWeights = { ...strategyWeights, [changedStrategy]: adjustedWeight };

      otherStrategies.forEach((strategy, index) => {
        if (index === otherStrategies.length - 1) {
          // 最后一个策略补齐剩余的权重
          newWeights[strategy] = remaining - (avgRemaining * (otherStrategies.length - 1));
        } else {
          newWeights[strategy] = avgRemaining;
        }
      });

      setStrategyWeights(newWeights);
    }
  };

  // 验证API连通性
  const validateApiConnection = async (endpoint: string, token: string) => {
    const key = 'api_connection';
    setValidationResults(prev => ({
      ...prev,
      [key]: { isValid: false, message: '验证中...', isValidating: true }
    }));

    try {
      // 模拟API连接测试
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (!endpoint || !endpoint.startsWith('http')) {
        throw new Error('请提供有效的API端点URL');
      }

      if (!token) {
        throw new Error('请提供认证令牌');
      }

      // 模拟连接成功
      setValidationResults(prev => ({
        ...prev,
        [key]: { isValid: true, message: 'API连接正常', isValidating: false }
      }));
    } catch (error) {
      setValidationResults(prev => ({
        ...prev,
        [key]: {
          isValid: false,
          message: error instanceof Error ? error.message : 'API连接失败',
          isValidating: false
        }
      }));
    }
  };

  // 验证存储路径
  const validateStoragePath = async (path: string) => {
    const key = 'storage_path';
    setValidationResults(prev => ({
      ...prev,
      [key]: { isValid: false, message: '验证中...', isValidating: true }
    }));

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (!path) {
        throw new Error('请提供存储路径');
      }

      if (!path.startsWith('/')) {
        throw new Error('请提供绝对路径');
      }

      // 模拟路径检查
      setValidationResults(prev => ({
        ...prev,
        [key]: { isValid: true, message: '存储路径可用', isValidating: false }
      }));
    } catch (error) {
      setValidationResults(prev => ({
        ...prev,
        [key]: {
          isValid: false,
          message: error instanceof Error ? error.message : '路径验证失败',
          isValidating: false
        }
      }));
    }
  };

  // 验证所有配置
  const validateAllConfigs = () => {
    if (selectedKbTypes.includes('external')) {
      const config = kbConfigs.external;
      validateApiConnection(config.apiEndpoint, config.authToken);
    }

    if (selectedRetentionStrategies.includes('externalize')) {
      const config = strategyConfigs.externalize;
      validateStoragePath(config.storagePath);
    }
  };

  // 保存配置
  const saveConfiguration = () => {
    const config = {
      knowledgeTypes: selectedKbTypes,
      knowledgeConfigs: kbConfigs,
      retentionEnabled: knowledgeRetentionEnabled,
      retentionStrategies: selectedRetentionStrategies,
      strategyConfigs,
      strategyWeights,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem('knowledgeConfig', JSON.stringify(config));
    alert('配置已保存！');
  };

  // 重置配置
  const resetConfiguration = () => {
    if (confirm('确定要重置所有配置吗？这将不可撤销。')) {
      setSelectedKbTypes(['internal']);
      setKnowledgeRetentionEnabled(false);
      setSelectedRetentionStrategies([]);
      setStrategyWeights({});
      setValidationResults({});
    }
  };

  // 智能推荐配置
  const applySmartSuggestions = () => {
    // 基于常见使用场景推荐配置
    setSelectedKbTypes(['internal', 'external']); // 混合模式提供更好的灵活性
    setKnowledgeRetentionEnabled(true);
    setSelectedRetentionStrategies(['internalize', 'structured']);
    setStrategyWeights({
      internalize: 70,
      structured: 30
    });
  };

  // 标签页配置
  const tabs = [
    { id: 'documents', label: '文档管理', icon: FileText },
    { id: 'faq', label: 'FAQ管理', icon: HelpCircle },
    { id: 'settings', label: '知识设置', icon: Settings }
  ];

  return (
    <div className="space-y-6">
      {/* 标签导航 */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 pb-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 文档管理 */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">文档上传</h4>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className={`h-12 w-12 mx-auto mb-4 ${
                isDragOver ? 'text-blue-500' : 'text-gray-400'
              }`} />
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">
                  {isDragOver ? '松开以上传文件' : '拖拽文件到此处或点击上传'}
                </p>
                <p className="text-sm text-gray-500">
                  支持 PDF、DOC、DOCX、TXT、MD 格式，单个文件最大 10MB
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.md"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  选择文件
                </label>
              </div>
            </div>
          </div>

          {/* 上传进度和文档列表 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">
                已上传文档 ({uploadedDocuments.length})
              </h4>
              {uploadedDocuments.length > 0 && (
                <button
                  onClick={() => setUploadedDocuments([])}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  清空所有
                </button>
              )}
            </div>

            {uploadedDocuments.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium text-gray-900 mb-2">暂无上传的文档</p>
                <p className="text-sm">上传文档后会在这里显示，支持自动内容提取和摘要生成</p>
              </div>
            ) : (
              <div className="space-y-3">
                {uploadedDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 truncate">
                              {doc.name}
                            </h5>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>{formatFileSize(doc.size)}</span>
                              <span>{doc.type.toUpperCase()}</span>
                              <span>
                                {new Date(doc.uploadedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 状态和进度 */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              doc.status === 'completed' ? 'bg-green-100 text-green-700' :
                              doc.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                              doc.status === 'uploading' ? 'bg-blue-100 text-blue-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {doc.status === 'completed' ? '已完成' :
                               doc.status === 'processing' ? '处理中' :
                               doc.status === 'uploading' ? '上传中' : '失败'}
                            </span>
                            {doc.status === 'uploading' && (
                              <span className="text-sm text-gray-600">
                                {doc.progress}%
                              </span>
                            )}
                          </div>

                          {(doc.status === 'uploading' || doc.status === 'processing') && (
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${doc.progress}%` }}
                              />
                            </div>
                          )}

                          {/* 处理结果 */}
                          {doc.status === 'completed' && doc.summary && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <h6 className="text-sm font-medium text-gray-900 mb-1">
                                内容摘要
                              </h6>
                              <p className="text-sm text-gray-600">{doc.summary}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 操作按钮 */}
                      <div className="flex items-center gap-1 ml-4">
                        {doc.status === 'completed' && (
                          <>
                            <button
                              className="p-2 text-gray-400 hover:text-gray-600 rounded"
                              title="查看内容"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              className="p-2 text-gray-400 hover:text-gray-600 rounded"
                              title="下载"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="p-2 text-red-400 hover:text-red-600 rounded"
                          title="删除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 文档统计 */}
          {uploadedDocuments.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-blue-900 mb-2">处理统计</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">总文档数</span>
                  <div className="font-medium text-blue-900">{uploadedDocuments.length}</div>
                </div>
                <div>
                  <span className="text-blue-700">已完成</span>
                  <div className="font-medium text-blue-900">
                    {uploadedDocuments.filter(d => d.status === 'completed').length}
                  </div>
                </div>
                <div>
                  <span className="text-blue-700">处理中</span>
                  <div className="font-medium text-blue-900">
                    {uploadedDocuments.filter(d => d.status === 'processing' || d.status === 'uploading').length}
                  </div>
                </div>
                <div>
                  <span className="text-blue-700">总大小</span>
                  <div className="font-medium text-blue-900">
                    {formatFileSize(uploadedDocuments.reduce((sum, doc) => sum + doc.size, 0))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FAQ管理 */}
      {activeTab === 'faq' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">FAQ条目管理</h4>
              <p className="text-sm text-gray-600">
                管理常见问题和答案，提高数字员工回答的准确性和一致性
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddFAQ}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                添加FAQ
              </button>
              <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                <Upload className="h-4 w-4" />
                批量导入
              </button>
            </div>
          </div>

          {/* FAQ统计 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <HelpCircle className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{faqs.length}</div>
                  <div className="text-sm text-gray-600">FAQ总数</div>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {faqs.filter(f => f.confidence >= 0.9).length}
                  </div>
                  <div className="text-sm text-gray-600">高质量FAQ</div>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Database className="h-8 w-8 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Array.from(new Set(faqs.map(f => f.category))).length}
                  </div>
                  <div className="text-sm text-gray-600">分类数量</div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ列表 */}
          <div className="space-y-4">
            {faqs.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                <HelpCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium text-gray-900 mb-2">暂无FAQ条目</p>
                <p className="text-sm mb-4">添加常见问题和标准答案，提高回答准确度</p>
                <button
                  onClick={handleAddFAQ}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  添加第一个FAQ
                </button>
              </div>
            ) : (
              faqs.map((faq, index) => (
                <div key={faq.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900">FAQ #{index + 1}</h5>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span>分类：{faq.category}</span>
                          <span>置信度：{(faq.confidence * 100).toFixed(0)}%</span>
                          <span>{new Date(faq.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteFAQ(faq.id)}
                      className="p-2 text-red-400 hover:text-red-600 rounded"
                      title="删除"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* 问题 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        问题 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => handleUpdateFAQ(faq.id, 'question', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="输入常见问题..."
                      />
                    </div>

                    {/* 答案 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        答案 <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={faq.answer}
                        onChange={(e) => handleUpdateFAQ(faq.id, 'answer', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="输入标准答案..."
                      />
                    </div>

                    {/* 分类和标签 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          分类
                        </label>
                        <select
                          value={faq.category}
                          onChange={(e) => handleUpdateFAQ(faq.id, 'category', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="账户管理">账户管理</option>
                          <option value="支付问题">支付问题</option>
                          <option value="技术支持">技术支持</option>
                          <option value="产品咨询">产品咨询</option>
                          <option value="售后服务">售后服务</option>
                          <option value="其他">其他</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          标签 (用逗号分隔)
                        </label>
                        <input
                          type="text"
                          value={faq.tags.join(', ')}
                          onChange={(e) => handleUpdateFAQ(faq.id, 'tags', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="例：密码, 重置, 账户"
                        />
                      </div>
                    </div>

                    {/* 置信度 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        置信度 ({(faq.confidence * 100).toFixed(0)}%)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={faq.confidence}
                        onChange={(e) => handleUpdateFAQ(faq.id, 'confidence', e.target.value)}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>低置信度</span>
                        <span>中等置信度</span>
                        <span>高置信度</span>
                      </div>
                    </div>

                    {/* 预览效果 */}
                    {faq.question && faq.answer && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <h6 className="text-sm font-medium text-gray-900 mb-2">预览效果</h6>
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium text-blue-600">用户问：</span>
                            <span className="text-gray-700">{faq.question}</span>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium text-green-600">AI答：</span>
                            <span className="text-gray-700">{faq.answer}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 批量操作 */}
          {faqs.length > 0 && showBatchActions && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-3">批量操作</h5>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  <Download className="h-4 w-4" />
                  导出为CSV
                </button>
                <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  <Copy className="h-4 w-4" />
                  复制到其他员工
                </button>
                <button
                  onClick={() => {
                    if (confirm('确定要清空所有FAQ吗？此操作不可撤销。')) {
                      setFaqs([]);
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  清空所有
                </button>
              </div>
            </div>
          )}

          {/* 在创建数字员工场景下，显示简化的清理操作 */}
          {faqs.length > 0 && !showBatchActions && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-3">操作</h5>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (confirm('确定要清空所有FAQ吗？此操作不可撤销。')) {
                      setFaqs([]);
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  清空所有
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 知识设置 */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* 智能操作面板 */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                快速操作
              </h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowConfigPreview(!showConfigPreview)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm border border-blue-300 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  {showConfigPreview ? '隐藏' : '预览'}配置
                </button>
                <button
                  onClick={() => setShowSmartSuggestions(!showSmartSuggestions)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm border border-purple-300 text-purple-700 rounded hover:bg-purple-100 transition-colors"
                >
                  <Info className="h-4 w-4" />
                  {showSmartSuggestions ? '隐藏' : '显示'}建议
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={applySmartSuggestions}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
              >
                <Lightbulb className="h-4 w-4" />
                应用智能推荐
              </button>
              <button
                onClick={saveConfiguration}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save className="h-4 w-4" />
                保存配置
              </button>
              <button
                onClick={resetConfiguration}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                重置配置
              </button>
            </div>

            {/* 智能建议显示 */}
            {showSmartSuggestions && (
              <div className="mt-4 p-3 bg-white border border-blue-200 rounded-lg">
                <h6 className="text-sm font-medium text-blue-900 mb-2">智能建议</h6>
                <div className="space-y-2 text-sm text-blue-800">
                  <p>• 推荐使用<strong>混合模式</strong>，同时激活内部和外部知识库获得更全面的知识覆盖</p>
                  <p>• 开启<strong>知识沉淀</strong>功能，选择“内化学习”和“结构化存储”策略</p>
                  <p>• 内化学习权重设为70%，结构化存储权重设为30%</p>
                  <p>• 定期验证API连接和存储路径以确保系统稳定性</p>
                </div>
              </div>
            )}

            {/* 配置预览 */}
            {showConfigPreview && (
              <div className="mt-4 p-3 bg-white border border-purple-200 rounded-lg">
                <h6 className="text-sm font-medium text-purple-900 mb-2">当前配置概览</h6>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-gray-600">知识库类型:</span>
                    <div className="font-medium text-purple-800">
                      {selectedKbTypes.length > 0 ? selectedKbTypes.join(', ') : '未选择'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">知识沉淀:</span>
                    <div className="font-medium text-purple-800">
                      {knowledgeRetentionEnabled ? '已启用' : '未启用'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">沉淀策略:</span>
                    <div className="font-medium text-purple-800">
                      {selectedRetentionStrategies.length}个策略
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">验证状态:</span>
                    <div className="font-medium text-purple-800">
                      {Object.keys(validationResults).length}个项目
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 知识沉淀策略 */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              知识沉淀策略
            </h4>

            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={knowledgeRetentionEnabled}
                  onChange={(e) => {
                    setKnowledgeRetentionEnabled(e.target.checked);
                    if (!e.target.checked) {
                      // 关闭知识沉淀时，清空所有策略选择
                      setSelectedRetentionStrategies([]);
                    }
                  }}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">启用知识沉淀</span>
                    <Tooltip content="知识沉淀可以帮助AI学习和记忆对话中的重要信息，提高未来对话的准确性和相关性">
                      <Info className="h-3 w-3 text-gray-400 hover:text-gray-600 cursor-help" />
                    </Tooltip>
                  </div>
                  <p className="text-sm text-gray-500">自动收集和学习对话中的有价值信息</p>
                </div>
              </label>

              {knowledgeRetentionEnabled && (
                <div className="ml-7 space-y-3 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">沉淀策略 (可多选)</label>
                  <div className="space-y-3">
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedRetentionStrategies.includes('internalize')}
                        onChange={(e) => handleRetentionStrategyChange('internalize', e.target.checked)}
                        className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900">内化学习</span>
                        <p className="text-xs text-gray-500">将新知识融入现有知识体系，通过AI学习和理解</p>
                      </div>
                    </label>
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedRetentionStrategies.includes('externalize')}
                        onChange={(e) => handleRetentionStrategyChange('externalize', e.target.checked)}
                        className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900">外部存储</span>
                        <p className="text-xs text-gray-500">将知识保存到指定的外部路径或数据库</p>
                      </div>
                    </label>
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedRetentionStrategies.includes('structured')}
                        onChange={(e) => handleRetentionStrategyChange('structured', e.target.checked)}
                        className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900">结构化存储</span>
                        <p className="text-xs text-gray-500">按照预定义的结构和分类来组织和存储知识</p>
                      </div>
                    </label>
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedRetentionStrategies.includes('contextual')}
                        onChange={(e) => handleRetentionStrategyChange('contextual', e.target.checked)}
                        className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900">上下文关联</span>
                        <p className="text-xs text-gray-500">保持知识与对话上下文的关联关系</p>
                      </div>
                    </label>
                  </div>

                  {/* 策略权重配置 */}
                  {selectedRetentionStrategies.length > 1 && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <h6 className="text-sm font-medium text-blue-900 mb-2">
                        策略权重配置
                        <span className="ml-2 text-xs font-normal text-blue-700">
                          (总计: {Object.values(strategyWeights).reduce((sum, weight) => sum + weight, 0)}%)
                        </span>
                      </h6>
                      <div className="space-y-2">
                        {selectedRetentionStrategies.map(strategy => {
                          const weight = strategyWeights[strategy] || 0;
                          return (
                            <div key={strategy} className="flex items-center justify-between">
                              <span className="text-sm text-blue-800 flex-1">
                                {strategy === 'internalize' ? '内化学习' :
                                 strategy === 'externalize' ? '外部存储' :
                                 strategy === 'structured' ? '结构化存储' :
                                 '上下文关联'}
                              </span>
                              <div className="flex items-center gap-2">
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={weight}
                                  onChange={(e) => handleWeightChange(strategy, parseInt(e.target.value))}
                                  className="w-20"
                                />
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={weight}
                                  onChange={(e) => handleWeightChange(strategy, parseInt(e.target.value) || 0)}
                                  className="w-12 px-1 py-0.5 text-xs border border-blue-300 rounded text-center"
                                />
                                <span className="text-xs text-blue-600 w-4">%</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <p className="text-blue-600">
                          多策略同时使用时，系统会按照权重比例分配处理资源
                        </p>
                        <button
                          onClick={() => {
                            // 重新平均分配权重
                            const equalWeight = Math.round(100 / selectedRetentionStrategies.length);
                            const newWeights: Record<string, number> = {};
                            selectedRetentionStrategies.forEach((strategy, index) => {
                              if (index === selectedRetentionStrategies.length - 1) {
                                newWeights[strategy] = 100 - (equalWeight * (selectedRetentionStrategies.length - 1));
                              } else {
                                newWeights[strategy] = equalWeight;
                              }
                            });
                            setStrategyWeights(newWeights);
                          }}
                          className="text-blue-600 hover:text-blue-700 underline"
                        >
                          重新平均分配
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 各个策略的特定配置 */}
                  {selectedRetentionStrategies.map(strategy => (
                    <div key={strategy} className="mt-4 p-4 border border-gray-200 rounded-lg">
                      <h6 className="text-sm font-medium text-gray-900 mb-3">
                        {strategy === 'internalize' ? '内化学习配置' :
                         strategy === 'externalize' ? '外部存储配置' :
                         strategy === 'structured' ? '结构化存储配置' :
                         '上下文关联配置'}
                      </h6>

                      {strategy === 'internalize' && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">学习率</label>
                            <input
                              type="number"
                              min="0.001"
                              max="1"
                              step="0.001"
                              value={strategyConfigs.internalize.learningRate}
                              onChange={(e) => updateStrategyConfig('internalize', 'learningRate', parseFloat(e.target.value))}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">模型深度</label>
                            <select
                              value={strategyConfigs.internalize.modelDepth}
                              onChange={(e) => updateStrategyConfig('internalize', 'modelDepth', e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="shallow">浅层学习</option>
                              <option value="medium">中等深度</option>
                              <option value="deep">深度学习</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">适应阈值</label>
                            <input
                              type="number"
                              min="0"
                              max="1"
                              step="0.1"
                              value={strategyConfigs.internalize.adaptationThreshold}
                              onChange={(e) => updateStrategyConfig('internalize', 'adaptationThreshold', parseFloat(e.target.value))}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      )}

                      {strategy === 'externalize' && (
                        <div className="space-y-3">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-xs font-medium text-gray-700">存储路径</label>
                              <button
                                onClick={() => validateStoragePath(strategyConfigs.externalize.storagePath)}
                                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                disabled={validationResults.storage_path?.isValidating}
                              >
                                {validationResults.storage_path?.isValidating ? (
                                  <><Loader className="h-3 w-3 animate-spin" /> 验证中</>
                                ) : (
                                  <><Shield className="h-3 w-3" /> 验证路径</>
                                )}
                              </button>
                            </div>
                            <div className="space-y-1">
                              <input
                                type="text"
                                value={strategyConfigs.externalize.storagePath}
                                onChange={(e) => updateStrategyConfig('externalize', 'storagePath', e.target.value)}
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                placeholder="/data/external_knowledge"
                              />
                              {validationResults.storage_path && (
                                <div className={`flex items-center gap-1 text-xs ${
                                  validationResults.storage_path.isValid ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {validationResults.storage_path.isValid ? (
                                    <CheckCircle className="h-3 w-3" />
                                  ) : (
                                    <AlertCircle className="h-3 w-3" />
                                  )}
                                  {validationResults.storage_path.message}
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">文件格式</label>
                            <select
                              value={strategyConfigs.externalize.fileFormat}
                              onChange={(e) => updateStrategyConfig('externalize', 'fileFormat', e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="json">JSON</option>
                              <option value="yaml">YAML</option>
                              <option value="xml">XML</option>
                              <option value="csv">CSV</option>
                            </select>
                          </div>
                          <div>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={strategyConfigs.externalize.compressionEnabled}
                                onChange={(e) => updateStrategyConfig('externalize', 'compressionEnabled', e.target.checked)}
                                className="w-3 h-3 text-blue-600"
                              />
                              <span className="text-xs text-gray-700">启用压缩</span>
                            </label>
                          </div>
                        </div>
                      )}

                      {strategy === 'structured' && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">分类模板</label>
                            <select
                              value={strategyConfigs.structured.categoryTemplate}
                              onChange={(e) => updateStrategyConfig('structured', 'categoryTemplate', e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="default">默认模板</option>
                              <option value="business">业务模板</option>
                              <option value="technical">技术模板</option>
                              <option value="custom">自定义模板</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">字段映射</label>
                            <select
                              value={strategyConfigs.structured.fieldMapping}
                              onChange={(e) => updateStrategyConfig('structured', 'fieldMapping', e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="auto">自动映射</option>
                              <option value="manual">手动映射</option>
                              <option value="template">模板映射</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">层级深度</label>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={strategyConfigs.structured.hierarchyDepth}
                              onChange={(e) => updateStrategyConfig('structured', 'hierarchyDepth', parseInt(e.target.value))}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      )}

                      {strategy === 'contextual' && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">关联深度</label>
                            <input
                              type="number"
                              min="1"
                              max="20"
                              value={strategyConfigs.contextual.associationDepth}
                              onChange={(e) => updateStrategyConfig('contextual', 'associationDepth', parseInt(e.target.value))}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">保留时长</label>
                            <select
                              value={strategyConfigs.contextual.retentionDuration}
                              onChange={(e) => updateStrategyConfig('contextual', 'retentionDuration', e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="7d">7天</option>
                              <option value="30d">30天</option>
                              <option value="90d">90天</option>
                              <option value="365d">1年</option>
                              <option value="permanent">永久</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">上下文窗口</label>
                            <input
                              type="number"
                              min="1"
                              max="50"
                              value={strategyConfigs.contextual.contextWindow}
                              onChange={(e) => updateStrategyConfig('contextual', 'contextWindow', parseInt(e.target.value))}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">更新频率</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="realtime">实时更新</option>
                    <option value="daily">每日更新</option>
                    <option value="weekly">每周更新</option>
                  </select>
                </div>
                </div>
              )}
            </div>
          </div>

          {/* 知识库配置 */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Database className="h-5 w-5 text-green-600" />
              知识库配置
            </h4>

            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  知识库类型（可多选）
                  <Tooltip content="选择内部+外部将自动启用混合模式，提供更灵活的知识管理">
                    <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                  </Tooltip>
                </label>
                <div className="space-y-3">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      checked={selectedKbTypes.includes('internal')}
                      onChange={(e) => handleKbTypeChange('internal', e.target.checked)}
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">内部知识库</span>
                      <p className="text-xs text-gray-500">使用本地存储，完全控制数据安全</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      checked={selectedKbTypes.includes('external')}
                      onChange={(e) => handleKbTypeChange('external', e.target.checked)}
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">外部知识库</span>
                      <p className="text-xs text-gray-500">连接到外部API服务，数据实时同步</p>
                    </div>
                  </label>
                  {isHybridMode && (
                    <div className="ml-7 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm font-medium text-purple-900">混合模式已自动启用</span>
                      </div>
                      <p className="text-xs text-purple-700 mt-1">系统将智能融合内部和外部知识源</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 内部知识库配置 */}
              {selectedKbTypes.includes('internal') && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-medium text-blue-900 mb-3">内部知识库配置</h5>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">存储路径</label>
                      <input
                        type="text"
                        value={kbConfigs.internal.storagePath}
                        onChange={(e) => updateKbConfig('internal', 'storagePath', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="/data/knowledge"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">索引策略</label>
                      <select
                        value={kbConfigs.internal.indexStrategy}
                        onChange={(e) => updateKbConfig('internal', 'indexStrategy', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="vector">向量索引</option>
                        <option value="fulltext">全文索引</option>
                        <option value="semantic">语义索引</option>
                        <option value="hybrid">混合索引</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">更新频率</label>
                      <select
                        value={kbConfigs.internal.updateFrequency}
                        onChange={(e) => updateKbConfig('internal', 'updateFrequency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="realtime">实时更新</option>
                        <option value="daily">每日更新</option>
                        <option value="weekly">每周更新</option>
                        <option value="manual">手动更新</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* 外部知识库配置 */}
              {selectedKbTypes.includes('external') && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h5 className="font-medium text-green-900 mb-3">外部知识库配置</h5>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">API端点</label>
                      <input
                        type="url"
                        value={kbConfigs.external.apiEndpoint}
                        onChange={(e) => updateKbConfig('external', 'apiEndpoint', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="https://api.example.com/knowledge"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">认证令牌</label>
                      <input
                        type="password"
                        value={kbConfigs.external.authToken}
                        onChange={(e) => updateKbConfig('external', 'authToken', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="请输入API认证令牌"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">同步策略</label>
                      <select
                        value={kbConfigs.external.syncStrategy}
                        onChange={(e) => updateKbConfig('external', 'syncStrategy', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="pull">仅拉取</option>
                        <option value="push">仅推送</option>
                        <option value="bidirectional">双向同步</option>
                        <option value="realtime">实时同步</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">连接超时 (秒)</label>
                      <input
                        type="number"
                        value={kbConfigs.external.connectionTimeout}
                        onChange={(e) => updateKbConfig('external', 'connectionTimeout', parseInt(e.target.value) || 30)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        min="5"
                        max="300"
                      />
                    </div>

                    {/* API连接验证 */}
                    <div className="pt-3 border-t border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <h6 className="text-sm font-medium text-green-900">连接验证</h6>
                        <button
                          onClick={() => validateApiConnection(kbConfigs.external.apiEndpoint, kbConfigs.external.authToken)}
                          disabled={validationResults.api_connection?.isValidating}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {validationResults.api_connection?.isValidating ? (
                            <><Loader className="h-4 w-4 animate-spin" /> 验证中...</>
                          ) : (
                            <><Shield className="h-4 w-4" /> 测试连接</>
                          )}
                        </button>
                      </div>
                      {validationResults.api_connection && (
                        <div className={`flex items-center gap-2 text-sm p-2 rounded ${
                          validationResults.api_connection.isValid
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : 'bg-red-100 text-red-700 border border-red-200'
                        }`}>
                          {validationResults.api_connection.isValid ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <AlertCircle className="h-4 w-4" />
                          )}
                          {validationResults.api_connection.message}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 混合模式配置 */}
              {isHybridMode && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h5 className="font-medium text-purple-900 mb-3">混合模式配置</h5>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">数据源权重配置</label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">内部知识库权重</label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={kbConfigs.hybrid.dataSourceWeights.internal}
                            onChange={(e) => {
                              const internalWeight = parseFloat(e.target.value);
                              const externalWeight = 1 - internalWeight;
                              updateKbConfig('hybrid', 'dataSourceWeights', {
                                internal: internalWeight,
                                external: externalWeight
                              });
                            }}
                            className="w-full"
                          />
                          <div className="text-xs text-gray-600 mt-1">
                            {(kbConfigs.hybrid.dataSourceWeights.internal * 100).toFixed(0)}%
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">外部知识库权重</label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={kbConfigs.hybrid.dataSourceWeights.external}
                            onChange={(e) => {
                              const externalWeight = parseFloat(e.target.value);
                              const internalWeight = 1 - externalWeight;
                              updateKbConfig('hybrid', 'dataSourceWeights', {
                                internal: internalWeight,
                                external: externalWeight
                              });
                            }}
                            className="w-full"
                          />
                          <div className="text-xs text-gray-600 mt-1">
                            {(kbConfigs.hybrid.dataSourceWeights.external * 100).toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">融合策略</label>
                      <select
                        value={kbConfigs.hybrid.mergeStrategy}
                        onChange={(e) => updateKbConfig('hybrid', 'mergeStrategy', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="priority">优先级融合</option>
                        <option value="weighted">权重融合</option>
                        <option value="consensus">共识融合</option>
                        <option value="adaptive">自适应融合</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">冲突处理规则</label>
                      <select
                        value={kbConfigs.hybrid.conflictResolution}
                        onChange={(e) => updateKbConfig('hybrid', 'conflictResolution', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="latest">使用最新版本</option>
                        <option value="authoritative">使用权威来源</option>
                        <option value="merge">智能合并</option>
                        <option value="manual">手动处理</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 知识图谱 */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-purple-600" />
              知识图谱
            </h4>

            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">启用知识图谱</span>
                  <p className="text-sm text-gray-500">自动构建知识间的关联关系</p>
                </div>
              </label>

              <div className="ml-7 space-y-3">
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">自动生成图谱</span>
                </label>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">更新时机</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="manual">手动更新</option>
                    <option value="scheduled">定时更新</option>
                    <option value="onChange">知识变更时更新</option>
                  </select>
                </div>

                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">启用可视化界面</span>
                </label>
              </div>
            </div>
          </div>

          {/* 全局配置验证 */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              配置验证
            </h4>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                点击下方按钮验证所有已配置的知识库连接和存储路径是否正常。
              </p>

              <div className="flex items-center gap-3">
                <button
                  onClick={validateAllConfigs}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Shield className="h-4 w-4" />
                  验证所有配置
                </button>

                <div className="flex items-center gap-4 text-sm">
                  {Object.entries(validationResults).map(([key, result]) => {
                    if (!result) return null;
                    return (
                      <div
                        key={key}
                        className={`flex items-center gap-1 ${
                          result.isValidating ? 'text-blue-600' :
                          result.isValid ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {result.isValidating ? (
                          <Loader className="h-3 w-3 animate-spin" />
                        ) : result.isValid ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <AlertCircle className="h-3 w-3" />
                        )}
                        <span>
                          {key === 'api_connection' ? 'API连接' : '存储路径'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 验证结果汇总 */}
              {Object.keys(validationResults).length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <h6 className="text-sm font-medium text-gray-900 mb-2">验证结果</h6>
                  <div className="space-y-2">
                    {Object.entries(validationResults).map(([key, result]) => {
                      if (!result) return null;
                      return (
                        <div key={key} className="text-xs">
                          <span className="font-medium text-gray-700">
                            {key === 'api_connection' ? 'API连接检查' : '存储路径检查'}：
                          </span>
                          <span className={result.isValid ? 'text-green-600' : 'text-red-600'}>
                            {result.message}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeConfig;