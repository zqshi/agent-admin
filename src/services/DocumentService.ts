/**
 * 文档管理服务
 * 处理文档上传、查看、下载、删除等操作
 */

export interface DocumentFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  processedAt?: string;
  tags: string[];
  extractedContent?: string;
  url?: string;
}

export interface UploadResult {
  success: boolean;
  document?: DocumentFile;
  error?: string;
}

export interface DocumentViewData {
  id: string;
  name: string;
  content: string;
  type: string;
  metadata: {
    size: number;
    uploadedAt: string;
    tags: string[];
    extractedKeywords?: string[];
  };
}

class DocumentService {
  private baseUrl = '/api/documents';

  /**
   * 上传文档
   */
  async uploadDocument(file: File, tags: string[] = []): Promise<UploadResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tags', JSON.stringify(tags));

      // 模拟API调用，实际项目中这里会是真实的API请求
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockDocument: DocumentFile = {
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: file.name.split('.').pop()?.toLowerCase() || 'unknown',
        size: file.size,
        uploadedAt: new Date().toISOString(),
        processedAt: new Date().toISOString(),
        tags: tags,
        extractedContent: `这是从 ${file.name} 中提取的模拟内容...`,
        url: URL.createObjectURL(file)
      };

      return {
        success: true,
        document: mockDocument
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '上传失败'
      };
    }
  }

  /**
   * 获取文档内容用于查看
   */
  async getDocumentForView(documentId: string): Promise<DocumentViewData | null> {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));

      return {
        id: documentId,
        name: `文档_${documentId}.pdf`,
        content: `这是文档 ${documentId} 的内容预览。\n\n在实际应用中，这里会显示从文档中提取的真实内容，包括文本、表格等结构化数据。\n\n文档处理状态: 已完成\n提取时间: ${new Date().toLocaleString()}`,
        type: 'pdf',
        metadata: {
          size: 1024 * 256, // 256KB
          uploadedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          tags: ['技术文档', '培训材料'],
          extractedKeywords: ['API', 'React', '组件', '最佳实践']
        }
      };
    } catch (error) {
      console.error('获取文档内容失败:', error);
      return null;
    }
  }

  /**
   * 下载文档
   */
  async downloadDocument(documentId: string, fileName: string): Promise<boolean> {
    try {
      // 模拟下载过程
      await new Promise(resolve => setTimeout(resolve, 800));

      // 创建一个模拟的下载链接
      const mockContent = `这是文档 ${fileName} 的模拟内容\n创建时间: ${new Date().toLocaleString()}`;
      const blob = new Blob([mockContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);

      // 创建临时下载链接
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      // 清理
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('下载文档失败:', error);
      return false;
    }
  }

  /**
   * 删除文档
   */
  async deleteDocument(documentId: string): Promise<boolean> {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));

      // 在实际应用中，这里会调用删除API
      console.log(`删除文档: ${documentId}`);

      return true;
    } catch (error) {
      console.error('删除文档失败:', error);
      return false;
    }
  }

  /**
   * 批量删除文档
   */
  async deleteDocuments(documentIds: string[]): Promise<{ success: string[], failed: string[] }> {
    const success: string[] = [];
    const failed: string[] = [];

    for (const docId of documentIds) {
      try {
        const result = await this.deleteDocument(docId);
        if (result) {
          success.push(docId);
        } else {
          failed.push(docId);
        }
      } catch (error) {
        failed.push(docId);
      }
    }

    return { success, failed };
  }

  /**
   * 更新文档标签
   */
  async updateDocumentTags(documentId: string, tags: string[]): Promise<boolean> {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 300));

      console.log(`更新文档 ${documentId} 的标签:`, tags);
      return true;
    } catch (error) {
      console.error('更新文档标签失败:', error);
      return false;
    }
  }

  /**
   * 获取支持的文件类型
   */
  getSupportedFileTypes(): { [key: string]: string[] } {
    return {
      '文档': ['.pdf', '.doc', '.docx', '.txt', '.md'],
      '表格': ['.xlsx', '.xls', '.csv'],
      '演示': ['.ppt', '.pptx'],
      '图片': ['.jpg', '.jpeg', '.png', '.gif', '.bmp'],
      '其他': ['.zip', '.rar']
    };
  }

  /**
   * 验证文件类型
   */
  validateFileType(fileName: string): boolean {
    const supportedTypes = this.getSupportedFileTypes();
    const fileExt = '.' + fileName.split('.').pop()?.toLowerCase();

    return Object.values(supportedTypes)
      .flat()
      .includes(fileExt);
  }

  /**
   * 验证文件大小（默认最大10MB）
   */
  validateFileSize(fileSize: number, maxSize: number = 10 * 1024 * 1024): boolean {
    return fileSize <= maxSize;
  }
}

// 导出单例
export const documentService = new DocumentService();
export default documentService;