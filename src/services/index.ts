/**
 * 服务层统一导出和配置
 */

import { digitalEmployeeService } from './api/digitalEmployeeService';
import { mockEmployeeAdapter } from './adapters/mockEmployeeAdapter';
import type {
  DigitalEmployee,
  CreateEmployeeForm,
  UpdateEmployeeForm,
  EmployeeQueryParams,
  EmployeeQueryResult,
  KnowledgeDocument,
  FAQItem
} from '../types/employee';
import type { ApiResponse } from './api/client';

// 服务配置
interface ServiceConfig {
  useMockData: boolean;
  apiBaseURL?: string;
  timeout?: number;
}

// 默认配置
const defaultConfig: ServiceConfig = {
  useMockData: true, // 默认使用Mock数据，在开发时很有用
  apiBaseURL: '/api',
  timeout: 10000
};

// 数字员工服务接口
export interface IDigitalEmployeeService {
  // 基础CRUD操作
  getEmployees(params?: EmployeeQueryParams): Promise<ApiResponse<EmployeeQueryResult>>;
  getEmployeeById(id: string): Promise<ApiResponse<DigitalEmployee>>;
  createEmployee(data: CreateEmployeeForm): Promise<ApiResponse<DigitalEmployee>>;
  updateEmployee(data: UpdateEmployeeForm): Promise<ApiResponse<DigitalEmployee>>;
  deleteEmployee(id: string): Promise<ApiResponse<void>>;

  // 状态管理
  enableEmployee?(id: string): Promise<ApiResponse<DigitalEmployee>>;
  disableEmployee?(id: string): Promise<ApiResponse<DigitalEmployee>>;
  retireEmployee?(id: string): Promise<ApiResponse<DigitalEmployee>>;

  // 高级功能
  cloneEmployee?(id: string, newName: string): Promise<ApiResponse<DigitalEmployee>>;
  uploadDocument?(employeeId: string, file: File, metadata?: any): Promise<ApiResponse<KnowledgeDocument>>;
  addFAQ?(employeeId: string, faq: any): Promise<ApiResponse<FAQItem>>;
  testConversation?(employeeId: string, message: string): Promise<ApiResponse<any>>;
  getEmployeeMetrics?(employeeId: string): Promise<ApiResponse<any>>;
}

// 服务管理器类
class ServiceManager {
  private config: ServiceConfig = defaultConfig;
  private currentService: IDigitalEmployeeService;

  constructor() {
    this.currentService = this.createService();
  }

  // 创建服务实例
  private createService(): IDigitalEmployeeService {
    if (this.config.useMockData) {
      // 包装Mock适配器以符合服务接口
      return {
        getEmployees: mockEmployeeAdapter.getEmployees.bind(mockEmployeeAdapter),
        getEmployeeById: mockEmployeeAdapter.getEmployeeById.bind(mockEmployeeAdapter),
        createEmployee: mockEmployeeAdapter.createEmployee.bind(mockEmployeeAdapter),
        updateEmployee: mockEmployeeAdapter.updateEmployee.bind(mockEmployeeAdapter),
        deleteEmployee: mockEmployeeAdapter.deleteEmployee.bind(mockEmployeeAdapter),
        enableEmployee: (id: string) => mockEmployeeAdapter.updateEmployeeStatus(id, 'active'),
        disableEmployee: (id: string) => mockEmployeeAdapter.updateEmployeeStatus(id, 'disabled'),
        retireEmployee: (id: string) => mockEmployeeAdapter.updateEmployeeStatus(id, 'retired'),
        cloneEmployee: mockEmployeeAdapter.cloneEmployee.bind(mockEmployeeAdapter),
        uploadDocument: mockEmployeeAdapter.uploadDocument.bind(mockEmployeeAdapter),
        addFAQ: mockEmployeeAdapter.addFAQ.bind(mockEmployeeAdapter),
        testConversation: mockEmployeeAdapter.testConversation.bind(mockEmployeeAdapter),
        getEmployeeMetrics: mockEmployeeAdapter.getEmployeeMetrics.bind(mockEmployeeAdapter)
      };
    } else {
      // 使用真实API服务
      return digitalEmployeeService;
    }
  }

  // 更新配置
  updateConfig(newConfig: Partial<ServiceConfig>) {
    this.config = { ...this.config, ...newConfig };

    // 如果切换了数据源，重新创建服务
    if (newConfig.useMockData !== undefined || newConfig.apiBaseURL) {
      this.currentService = this.createService();
    }

    // 更新API客户端配置
    if (newConfig.apiBaseURL && !this.config.useMockData) {
      digitalEmployeeService['apiClient']?.setBaseURL(newConfig.apiBaseURL);
    }
  }

  // 获取当前服务实例
  getService(): IDigitalEmployeeService {
    return this.currentService;
  }

  // 检查是否使用Mock数据
  isUsingMockData(): boolean {
    return this.config.useMockData;
  }

  // 切换到真实API
  switchToRealAPI(baseURL?: string) {
    this.updateConfig({
      useMockData: false,
      apiBaseURL: baseURL || this.config.apiBaseURL
    });
  }

  // 切换到Mock数据
  switchToMockData() {
    this.updateConfig({ useMockData: true });
  }

  // 获取当前配置
  getConfig(): ServiceConfig {
    return { ...this.config };
  }
}

// 创建全局服务管理器实例
export const serviceManager = new ServiceManager();

// 便捷的服务访问方法
export const employeeService = {
  // 基础操作
  getEmployees: (params?: EmployeeQueryParams) => serviceManager.getService().getEmployees(params),
  getEmployeeById: (id: string) => serviceManager.getService().getEmployeeById(id),
  createEmployee: (data: CreateEmployeeForm) => serviceManager.getService().createEmployee(data),
  updateEmployee: (data: UpdateEmployeeForm) => serviceManager.getService().updateEmployee(data),
  deleteEmployee: (id: string) => serviceManager.getService().deleteEmployee(id),

  // 状态管理
  enableEmployee: (id: string) => serviceManager.getService().enableEmployee?.(id),
  disableEmployee: (id: string) => serviceManager.getService().disableEmployee?.(id),
  retireEmployee: (id: string) => serviceManager.getService().retireEmployee?.(id),

  // 高级功能
  cloneEmployee: (id: string, newName: string) => serviceManager.getService().cloneEmployee?.(id, newName),
  uploadDocument: (employeeId: string, file: File, metadata?: any) =>
    serviceManager.getService().uploadDocument?.(employeeId, file, metadata),
  addFAQ: (employeeId: string, faq: any) => serviceManager.getService().addFAQ?.(employeeId, faq),
  testConversation: (employeeId: string, message: string) =>
    serviceManager.getService().testConversation?.(employeeId, message),
  getEmployeeMetrics: (employeeId: string) => serviceManager.getService().getEmployeeMetrics?.(employeeId),

  // 配置管理
  isUsingMockData: () => serviceManager.isUsingMockData(),
  switchToRealAPI: (baseURL?: string) => serviceManager.switchToRealAPI(baseURL),
  switchToMockData: () => serviceManager.switchToMockData(),
  getConfig: () => serviceManager.getConfig()
};

// 错误处理工具
export class ServiceError extends Error {
  public code: string;
  public details?: any;

  constructor(message: string, code: string = 'SERVICE_ERROR', details?: any) {
    super(message);
    this.name = 'ServiceError';
    this.code = code;
    this.details = details;
  }
}

// 服务响应处理工具
export const handleServiceResponse = async <T>(
  serviceCall: () => Promise<ApiResponse<T>>
): Promise<T> => {
  try {
    const response = await serviceCall();

    if (!response.success) {
      throw new ServiceError(
        response.message || '服务调用失败',
        'SERVICE_RESPONSE_ERROR',
        response
      );
    }

    return response.data;
  } catch (error) {
    if (error instanceof ServiceError) {
      throw error;
    }

    throw new ServiceError(
      error instanceof Error ? error.message : '未知服务错误',
      'SERVICE_CALL_ERROR',
      error
    );
  }
};

// 导出常用类型和服务
export * from './api/client';
export * from './api/digitalEmployeeService';
export type { ServiceConfig };