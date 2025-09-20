/**
 * 数字员工API服务
 */

import { apiClient, ApiResponse, PaginatedResponse } from './client';
import type {
  DigitalEmployee,
  CreateEmployeeForm,
  UpdateEmployeeForm,
  EmployeeFilter,
  EmployeeQueryParams,
  EmployeeQueryResult,
  KnowledgeDocument,
  FAQItem
} from '../../types/employee';

export class DigitalEmployeeService {
  private readonly basePath = '/digital-employees';

  /**
   * 获取数字员工列表
   */
  async getEmployees(params?: EmployeeQueryParams): Promise<ApiResponse<EmployeeQueryResult>> {
    const searchParams = new URLSearchParams();

    if (params) {
      searchParams.append('page', params.page.toString());
      searchParams.append('pageSize', params.pageSize.toString());

      if (params.filter) {
        if (params.filter.status) {
          searchParams.append('status', params.filter.status.join(','));
        }
        if (params.filter.department) {
          searchParams.append('department', params.filter.department.join(','));
        }
        if (params.filter.searchQuery) {
          searchParams.append('search', params.filter.searchQuery);
        }
        if (params.filter.dateRange) {
          searchParams.append('startDate', params.filter.dateRange.start);
          searchParams.append('endDate', params.filter.dateRange.end);
        }
      }

      if (params.sort) {
        searchParams.append('sortField', params.sort.field);
        searchParams.append('sortDirection', params.sort.direction);
      }
    }

    return apiClient.get<EmployeeQueryResult>(
      `${this.basePath}?${searchParams.toString()}`
    );
  }

  /**
   * 根据ID获取数字员工详情
   */
  async getEmployeeById(id: string): Promise<ApiResponse<DigitalEmployee>> {
    return apiClient.get<DigitalEmployee>(`${this.basePath}/${id}`);
  }

  /**
   * 创建数字员工
   */
  async createEmployee(data: CreateEmployeeForm): Promise<ApiResponse<DigitalEmployee>> {
    return apiClient.post<DigitalEmployee>(this.basePath, data);
  }

  /**
   * 更新数字员工
   */
  async updateEmployee(data: UpdateEmployeeForm): Promise<ApiResponse<DigitalEmployee>> {
    const { id, ...updateData } = data;
    return apiClient.put<DigitalEmployee>(`${this.basePath}/${id}`, updateData);
  }

  /**
   * 部分更新数字员工
   */
  async patchEmployee(id: string, data: Partial<CreateEmployeeForm>): Promise<ApiResponse<DigitalEmployee>> {
    return apiClient.patch<DigitalEmployee>(`${this.basePath}/${id}`, data);
  }

  /**
   * 删除数字员工
   */
  async deleteEmployee(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.basePath}/${id}`);
  }

  /**
   * 批量删除数字员工
   */
  async deleteEmployees(ids: string[]): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.basePath}/batch`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * 启用数字员工
   */
  async enableEmployee(id: string): Promise<ApiResponse<DigitalEmployee>> {
    return apiClient.patch<DigitalEmployee>(`${this.basePath}/${id}/enable`);
  }

  /**
   * 禁用数字员工
   */
  async disableEmployee(id: string): Promise<ApiResponse<DigitalEmployee>> {
    return apiClient.patch<DigitalEmployee>(`${this.basePath}/${id}/disable`);
  }

  /**
   * 停用数字员工
   */
  async retireEmployee(id: string): Promise<ApiResponse<DigitalEmployee>> {
    return apiClient.patch<DigitalEmployee>(`${this.basePath}/${id}/retire`);
  }

  /**
   * 克隆数字员工
   */
  async cloneEmployee(id: string, newName: string): Promise<ApiResponse<DigitalEmployee>> {
    return apiClient.post<DigitalEmployee>(`${this.basePath}/${id}/clone`, { name: newName });
  }

  /**
   * 导出数字员工配置
   */
  async exportEmployee(id: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${this.basePath}/${id}/export`);
  }

  /**
   * 导入数字员工配置
   */
  async importEmployee(config: any): Promise<ApiResponse<DigitalEmployee>> {
    return apiClient.post<DigitalEmployee>(`${this.basePath}/import`, config);
  }

  // 知识库管理相关方法

  /**
   * 获取员工知识库文档
   */
  async getEmployeeDocuments(employeeId: string): Promise<ApiResponse<KnowledgeDocument[]>> {
    return apiClient.get<KnowledgeDocument[]>(`${this.basePath}/${employeeId}/documents`);
  }

  /**
   * 上传知识库文档
   */
  async uploadDocument(
    employeeId: string,
    file: File,
    metadata?: { tags?: string[]; description?: string }
  ): Promise<ApiResponse<KnowledgeDocument>> {
    return apiClient.upload<KnowledgeDocument>(
      `${this.basePath}/${employeeId}/documents`,
      file,
      metadata
    );
  }

  /**
   * 删除知识库文档
   */
  async deleteDocument(employeeId: string, documentId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.basePath}/${employeeId}/documents/${documentId}`);
  }

  /**
   * 获取员工FAQ
   */
  async getEmployeeFAQs(employeeId: string): Promise<ApiResponse<FAQItem[]>> {
    return apiClient.get<FAQItem[]>(`${this.basePath}/${employeeId}/faq`);
  }

  /**
   * 添加FAQ
   */
  async addFAQ(employeeId: string, faq: Omit<FAQItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<FAQItem>> {
    return apiClient.post<FAQItem>(`${this.basePath}/${employeeId}/faq`, faq);
  }

  /**
   * 更新FAQ
   */
  async updateFAQ(employeeId: string, faqId: string, faq: Partial<FAQItem>): Promise<ApiResponse<FAQItem>> {
    return apiClient.put<FAQItem>(`${this.basePath}/${employeeId}/faq/${faqId}`, faq);
  }

  /**
   * 删除FAQ
   */
  async deleteFAQ(employeeId: string, faqId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.basePath}/${employeeId}/faq/${faqId}`);
  }

  /**
   * 批量导入FAQ
   */
  async importFAQs(employeeId: string, faqs: Omit<FAQItem, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<ApiResponse<FAQItem[]>> {
    return apiClient.post<FAQItem[]>(`${this.basePath}/${employeeId}/faq/batch`, { faqs });
  }

  // 统计和分析相关方法

  /**
   * 获取员工运行统计
   */
  async getEmployeeMetrics(employeeId: string, dateRange?: { start: string; end: string }): Promise<ApiResponse<any>> {
    const params = dateRange ? `?start=${dateRange.start}&end=${dateRange.end}` : '';
    return apiClient.get<any>(`${this.basePath}/${employeeId}/metrics${params}`);
  }

  /**
   * 获取员工对话记录
   */
  async getEmployeeConversations(
    employeeId: string,
    params?: { page?: number; pageSize?: number; dateRange?: { start: string; end: string } }
  ): Promise<ApiResponse<PaginatedResponse<any>>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params?.dateRange) {
      searchParams.append('start', params.dateRange.start);
      searchParams.append('end', params.dateRange.end);
    }

    return apiClient.get<PaginatedResponse<any>>(
      `${this.basePath}/${employeeId}/conversations?${searchParams.toString()}`
    );
  }

  /**
   * 获取员工性能报告
   */
  async getEmployeeReport(
    employeeId: string,
    reportType: 'daily' | 'weekly' | 'monthly',
    date: string
  ): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${this.basePath}/${employeeId}/reports/${reportType}?date=${date}`);
  }

  // 测试和验证相关方法

  /**
   * 测试员工对话
   */
  async testConversation(employeeId: string, message: string): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`${this.basePath}/${employeeId}/test`, { message });
  }

  /**
   * 验证员工配置
   */
  async validateEmployeeConfig(config: CreateEmployeeForm): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`${this.basePath}/validate`, config);
  }

  /**
   * 获取员工健康检查
   */
  async getEmployeeHealth(employeeId: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${this.basePath}/${employeeId}/health`);
  }
}

// 创建服务实例
export const digitalEmployeeService = new DigitalEmployeeService();