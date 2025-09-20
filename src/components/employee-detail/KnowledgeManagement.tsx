/**
 * 知识库管理组件
 */

import React, { useState } from 'react';
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
  Trash2
} from 'lucide-react';
import type { DigitalEmployee } from '../../types/employee';

interface KnowledgeManagementProps {
  employee: DigitalEmployee;
}

const KnowledgeManagement: React.FC<KnowledgeManagementProps> = ({ employee }) => {
  const [activeTab, setActiveTab] = useState<'documents' | 'faq' | 'learned'>('documents');
  const [searchQuery, setSearchQuery] = useState('');

  const { knowledgeBase } = employee;

  // 过滤文档
  const filteredDocuments = knowledgeBase.documents.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // 过滤FAQ
  const filteredFAQ = knowledgeBase.faqItems.filter(faq =>
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

  const tabs = [
    { id: 'documents', label: '文档库', icon: FileText, count: knowledgeBase.documents.length },
    { id: 'faq', label: 'FAQ', icon: HelpCircle, count: knowledgeBase.faqItems.length },
    { id: 'learned', label: '自学知识', icon: BookOpen, count: knowledgeBase.autoLearnedItems?.length || 0 }
  ];

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">知识库管理</h3>
        <div className="flex items-center gap-2">
          <button className="text-blue-600 hover:text-blue-700 flex items-center gap-1 px-3 py-1 border border-blue-200 rounded-lg">
            <Upload className="h-4 w-4" />
            上传文档
          </button>
          <button className="text-green-600 hover:text-green-700 flex items-center gap-1 px-3 py-1 border border-green-200 rounded-lg">
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
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-2 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </nav>
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

      {/* 文档库 */}
      {activeTab === 'documents' && (
        <div className="space-y-3">
          {filteredDocuments.length > 0 ? (
            filteredDocuments.map((doc) => (
              <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl">{getFileTypeIcon(doc.type)}</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{doc.name}</h4>
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
                    <button className="p-1 text-gray-400 hover:text-blue-600" title="查看">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-green-600" title="下载">
                      <Download className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-red-600" title="删除">
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
            </div>
          )}
        </div>
      )}

      {/* FAQ */}
      {activeTab === 'faq' && (
        <div className="space-y-3">
          {filteredFAQ.length > 0 ? (
            filteredFAQ.map((faq) => (
              <div key={faq.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-2">{faq.question}</h4>
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
                        <button className="text-blue-600 hover:text-blue-700" title="编辑">
                          <Edit3 className="h-3 w-3" />
                        </button>
                        <button className="text-red-600 hover:text-red-700" title="删除">
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
            </div>
          )}
        </div>
      )}

      {/* 自学知识 */}
      {activeTab === 'learned' && (
        <div className="space-y-3">
          {knowledgeBase.autoLearnedItems && knowledgeBase.autoLearnedItems.length > 0 ? (
            knowledgeBase.autoLearnedItems.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-gray-900 mb-2">{item.content}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>来源: {item.source}</span>
                      <span>置信度: {(item.confidence * 100).toFixed(0)}%</span>
                      <span>状态: {item.reviewStatus}</span>
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
                        <button className="text-green-600 hover:text-green-700 text-xs px-2 py-1 border border-green-200 rounded">
                          批准
                        </button>
                        <button className="text-red-600 hover:text-red-700 text-xs px-2 py-1 border border-red-200 rounded">
                          拒绝
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>暂无自学知识</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KnowledgeManagement;