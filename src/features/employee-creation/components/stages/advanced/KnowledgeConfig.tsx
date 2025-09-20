/**
 * 知识配置组件
 */

import React, { useState } from 'react';
import { Upload, FileText, HelpCircle, Database, GitBranch, Settings, Plus, Eye, Download, Trash2, Copy, CheckCircle } from 'lucide-react';
import { useCreationStore } from '../../../stores/creationStore';

const KnowledgeConfig: React.FC = () => {
  const { advancedConfig, updateAdvancedConfig } = useCreationStore();
  const [activeTab, setActiveTab] = useState<'documents' | 'faq' | 'settings'>('documents');

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
      id: Date.now().toString(),
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
          {faqs.length > 0 && (
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
        </div>
      )}

      {/* 知识设置 */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
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
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">启用知识沉淀</span>
                  <p className="text-sm text-gray-500">自动收集和学习对话中的有价值信息</p>
                </div>
              </label>

              <div className="ml-7 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">沉淀策略</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="retention_strategy" value="internalize" className="text-blue-600" />
                      <span className="text-sm">内化学习（融入现有知识体系）</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="retention_strategy" value="externalize" className="text-blue-600" />
                      <span className="text-sm">外部存储（保存到指定路径）</span>
                    </label>
                  </div>
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
            </div>
          </div>

          {/* 知识库配置 */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Database className="h-5 w-5 text-green-600" />
              知识库配置
            </h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">知识库类型</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="kb_type" value="internal" className="text-blue-600" defaultChecked />
                    <span className="text-sm">内部知识库</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="kb_type" value="external" className="text-blue-600" />
                    <span className="text-sm">外部知识库</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="kb_type" value="hybrid" className="text-blue-600" />
                    <span className="text-sm">混合模式</span>
                  </label>
                </div>
              </div>
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
        </div>
      )}
    </div>
  );
};

export default KnowledgeConfig;