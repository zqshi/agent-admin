/**
 * Mock数据适配器 - 在没有真实API的情况下使用
 */

import { mockDigitalEmployees } from '../../data/mockDigitalEmployees';
import type {
  DigitalEmployee,
  CreateEmployeeForm,
  UpdateEmployeeForm,
  EmployeeQueryParams,
  EmployeeQueryResult,
  KnowledgeDocument,
  FAQItem
} from '../../types/employee';
import type { ApiResponse } from '../api/client';

export class MockEmployeeAdapter {
  private employees: DigitalEmployee[] = [...mockDigitalEmployees] as DigitalEmployee[];
  private nextId = Date.now();

  // 模拟网络延迟
  private async delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 创建标准API响应格式
  private createResponse<T>(data: T, success: boolean = true, message?: string): ApiResponse<T> {
    return {
      data,
      success,
      message,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 获取数字员工列表
   */
  async getEmployees(params?: EmployeeQueryParams): Promise<ApiResponse<EmployeeQueryResult>> {
    await this.delay();

    let filtered = [...this.employees];

    // 应用筛选
    if (params?.filter) {
      const { status, department, searchQuery, dateRange } = params.filter;

      if (status && status.length > 0) {
        filtered = filtered.filter(emp => status.includes(emp.status));
      }

      if (department && department.length > 0) {
        filtered = filtered.filter(emp => department.includes(emp.department));
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(emp =>
          emp.name.toLowerCase().includes(query) ||
          emp.employeeNumber.toLowerCase().includes(query) ||
          emp.description?.toLowerCase().includes(query)
        );
      }

      if (dateRange) {
        const start = new Date(dateRange.start);
        const end = new Date(dateRange.end);
        filtered = filtered.filter(emp => {
          const created = new Date(emp.createdAt);
          return created >= start && created <= end;
        });
      }
    }

    // 应用排序
    if (params?.sort) {
      filtered.sort((a, b) => {
        const field = params.sort!.field;
        const direction = params.sort!.direction === 'asc' ? 1 : -1;

        // 处理嵌套字段
        const getValue = (obj: any, path: string) => {
          return path.split('.').reduce((o, p) => o?.[p], obj);
        };

        const aValue = getValue(a, field);
        const bValue = getValue(b, field);

        if (aValue < bValue) return -1 * direction;
        if (aValue > bValue) return 1 * direction;
        return 0;
      });
    }

    // 应用分页
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filtered.slice(startIndex, endIndex);

    const result: EmployeeQueryResult = {
      employees: paginatedData,
      total: filtered.length,
      page,
      pageSize,
      hasMore: endIndex < filtered.length
    };

    return this.createResponse(result);
  }

  /**
   * 根据ID获取数字员工
   */
  async getEmployeeById(id: string): Promise<ApiResponse<DigitalEmployee>> {
    await this.delay();

    const employee = this.employees.find(emp => emp.id === id);
    if (!employee) {
      return this.createResponse(null as any, false, '员工不存在');
    }

    return this.createResponse(employee);
  }

  /**
   * 创建数字员工
   */
  async createEmployee(data: CreateEmployeeForm): Promise<ApiResponse<DigitalEmployee>> {
    await this.delay();

    const now = new Date().toISOString();
    const newEmployee: DigitalEmployee = {
      id: (++this.nextId).toString(),
      name: data.name,
      employeeNumber: data.employeeNumber,
      avatar: data.avatar ? URL.createObjectURL(data.avatar) : undefined,
      description: data.description,
      department: data.department,
      status: 'active',
      createdAt: now,
      updatedAt: now,
      persona: {
        systemPrompt: data.systemPrompt,
        personality: data.personality,
        responsibilities: data.responsibilities,
        exampleDialogues: data.exampleDialogues
      },
      promptConfig: data.promptConfig,
      permissions: {
        allowedTools: data.allowedTools,
        resourceAccess: data.resourcePermissions,
        knowledgeManagement: {
          canSelfLearn: data.canSelfLearn,
          canModifyKnowledge: false
        }
      },
      knowledgeBase: {
        documents: [],
        faqItems: data.initialFAQs,
        autoLearnedItems: []
      },
      metrics: {
        totalSessions: 0,
        successfulSessions: 0,
        avgResponseTime: 0,
        knowledgeUtilizationRate: 0,
        toolUsageStats: {}
      }
    };

    if (data.enableMentor && data.mentorId) {
      newEmployee.mentorConfig = {
        mentorId: data.mentorId,
        mentorName: 'AI-Manager',
        reportingCycle: data.reportingCycle as any || 'weekly',
        reportingMethod: data.reportingMethod || 'document'
      };
    }

    this.employees.unshift(newEmployee);
    return this.createResponse(newEmployee, true, '数字员工创建成功');
  }

  /**
   * 更新数字员工
   */
  async updateEmployee(data: UpdateEmployeeForm): Promise<ApiResponse<DigitalEmployee>> {
    await this.delay();

    const index = this.employees.findIndex(emp => emp.id === data.id);
    if (index === -1) {
      return this.createResponse(null as any, false, '员工不存在');
    }

    // 处理avatar文件转换
    const { avatar, ...restData } = data;
    const avatarUrl = avatar instanceof File ? URL.createObjectURL(avatar) : avatar;

    const updatedEmployee: DigitalEmployee = {
      ...this.employees[index],
      ...restData,
      avatar: avatarUrl,
      updatedAt: new Date().toISOString()
    };

    this.employees[index] = updatedEmployee;
    return this.createResponse(updatedEmployee, true, '员工信息更新成功');
  }

  /**
   * 删除数字员工
   */
  async deleteEmployee(id: string): Promise<ApiResponse<void>> {
    await this.delay();

    const index = this.employees.findIndex(emp => emp.id === id);
    if (index === -1) {
      return this.createResponse(undefined as any, false, '员工不存在');
    }

    this.employees.splice(index, 1);
    return this.createResponse(undefined as any, true, '员工删除成功');
  }

  /**
   * 启用/禁用/停用员工
   */
  async updateEmployeeStatus(id: string, status: 'active' | 'disabled' | 'retired'): Promise<ApiResponse<DigitalEmployee>> {
    await this.delay();

    const employee = this.employees.find(emp => emp.id === id);
    if (!employee) {
      return this.createResponse(null as any, false, '员工不存在');
    }

    employee.status = status;
    employee.updatedAt = new Date().toISOString();

    return this.createResponse(employee, true, '员工状态更新成功');
  }

  /**
   * 克隆数字员工
   */
  async cloneEmployee(id: string, newName: string): Promise<ApiResponse<DigitalEmployee>> {
    await this.delay();

    const originalEmployee = this.employees.find(emp => emp.id === id);
    if (!originalEmployee) {
      return this.createResponse(null as any, false, '原员工不存在');
    }

    const now = new Date().toISOString();
    const clonedEmployee: DigitalEmployee = {
      ...originalEmployee,
      id: (++this.nextId).toString(),
      name: newName,
      employeeNumber: `${originalEmployee.employeeNumber}_COPY`,
      createdAt: now,
      updatedAt: now,
      status: 'disabled', // 克隆的员工默认禁用
      metrics: {
        totalSessions: 0,
        successfulSessions: 0,
        avgResponseTime: 0,
        knowledgeUtilizationRate: 0,
        toolUsageStats: {}
      }
    };

    this.employees.unshift(clonedEmployee);
    return this.createResponse(clonedEmployee, true, '员工克隆成功');
  }

  /**
   * 上传文档
   */
  async uploadDocument(
    employeeId: string,
    file: File,
    metadata?: { tags?: string[]; description?: string }
  ): Promise<ApiResponse<KnowledgeDocument>> {
    await this.delay(1000); // 文件上传稍微慢一点

    const employee = this.employees.find(emp => emp.id === employeeId);
    if (!employee) {
      return this.createResponse(null as any, false, '员工不存在');
    }

    const document: KnowledgeDocument = {
      id: (++this.nextId).toString(),
      name: file.name,
      type: file.name.split('.').pop()?.toLowerCase() as any || 'unknown',
      filePath: `/uploads/${file.name}`,
      uploadedAt: new Date().toISOString(),
      size: file.size,
      processedAt: new Date().toISOString(),
      tags: metadata?.tags || [],
      metadata: {
        description: metadata?.description,
        mimeType: file.type
      }
    };

    employee.knowledgeBase.documents.push(document);
    return this.createResponse(document, true, '文档上传成功');
  }

  /**
   * 添加FAQ
   */
  async addFAQ(employeeId: string, faq: Omit<FAQItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<FAQItem>> {
    await this.delay();

    const employee = this.employees.find(emp => emp.id === employeeId);
    if (!employee) {
      return this.createResponse(null as any, false, '员工不存在');
    }

    const now = new Date().toISOString();
    const newFAQ: FAQItem = {
      ...faq,
      id: (++this.nextId).toString(),
      createdAt: now,
      updatedAt: now,
      usageCount: 0,
      confidence: faq.confidence || 0.8
    };

    employee.knowledgeBase.faqItems.push(newFAQ);
    return this.createResponse(newFAQ, true, 'FAQ添加成功');
  }

  /**
   * 获取员工统计数据
   */
  async getEmployeeMetrics(employeeId: string): Promise<ApiResponse<any>> {
    await this.delay();

    const employee = this.employees.find(emp => emp.id === employeeId);
    if (!employee) {
      return this.createResponse(null as any, false, '员工不存在');
    }

    // 模拟生成一些统计数据
    const metrics = {
      ...employee.metrics,
      dailyStats: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        sessions: Math.floor(Math.random() * 50) + 10,
        successRate: Math.random() * 0.3 + 0.7,
        avgResponseTime: Math.random() * 2 + 1
      })),
      weeklyTrend: {
        sessions: Math.random() > 0.5 ? 1 : -1,
        successRate: Math.random() > 0.5 ? 1 : -1,
        responseTime: Math.random() > 0.5 ? -1 : 1
      }
    };

    return this.createResponse(metrics);
  }

  /**
   * 测试对话
   */
  async testConversation(employeeId: string, message: string): Promise<ApiResponse<any>> {
    await this.delay(800);

    const employee = this.employees.find(emp => emp.id === employeeId);
    if (!employee) {
      return this.createResponse(null as any, false, '员工不存在');
    }

    // 模拟AI回复
    const responses = [
      `您好！我是${employee.name}，很高兴为您服务。关于您的问题："${message}"，我来为您详细解答。`,
      `感谢您的咨询。根据我的理解，您提到的"${message}"是一个很好的问题。让我为您分析一下...`,
      `我明白您的需求。针对"${message}"这个问题，我建议以下几个解决方案...`
    ];

    const result = {
      userMessage: message,
      aiResponse: responses[Math.floor(Math.random() * responses.length)],
      responseTime: Math.random() * 2 + 0.5,
      confidence: Math.random() * 0.3 + 0.7,
      usedTools: employee.permissions.allowedTools.slice(0, Math.floor(Math.random() * 3)),
      timestamp: new Date().toISOString()
    };

    return this.createResponse(result, true, '测试对话完成');
  }
}

// 创建适配器实例
export const mockEmployeeAdapter = new MockEmployeeAdapter();