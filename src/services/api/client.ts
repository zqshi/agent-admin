/**
 * API客户端基础配置
 */

export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  code?: string;
  timestamp: string;
}

export interface ApiError {
  message: string;
  code: string;
  details?: any;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
}

export class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private defaultTimeout: number;

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL.replace(/\/+$/, '');
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    this.defaultTimeout = 10000; // 10秒
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = { ...this.defaultHeaders, ...config?.headers };
    const timeout = config?.timeout || this.defaultTimeout;

    const controller = new AbortController();
    const signal = config?.signal || controller.signal;

    // 设置超时
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    try {
      const requestInit: RequestInit = {
        method,
        headers,
        signal
      };

      if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
        requestInit.body = JSON.stringify(data);
      }

      const response = await fetch(url, requestInit);
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new ApiError({
          message: `HTTP ${response.status}: ${response.statusText}`,
          code: `HTTP_${response.status}`,
          timestamp: new Date().toISOString()
        });
      }

      const result = await response.json();

      // 标准化响应格式
      if (result.success !== undefined) {
        return result;
      } else {
        return {
          data: result,
          success: true,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError({
          message: '请求超时',
          code: 'TIMEOUT',
          timestamp: new Date().toISOString()
        });
      }

      throw new ApiError({
        message: error instanceof Error ? error.message : '网络请求失败',
        code: 'NETWORK_ERROR',
        details: error,
        timestamp: new Date().toISOString()
      });
    }
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, config);
  }

  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data, config);
  }

  async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data, config);
  }

  async patch<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, data, config);
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, config);
  }

  // 文件上传
  async upload<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, JSON.stringify(value));
      });
    }

    const headers = { ...config?.headers };
    delete headers['Content-Type']; // 让浏览器自动设置multipart/form-data

    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    const signal = config?.signal || controller.signal;
    const timeout = config?.timeout || this.defaultTimeout;

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new ApiError({
          message: `HTTP ${response.status}: ${response.statusText}`,
          code: `HTTP_${response.status}`,
          timestamp: new Date().toISOString()
        });
      }

      const result = await response.json();
      return result.success !== undefined ? result : {
        data: result,
        success: true,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error instanceof ApiError ? error : new ApiError({
        message: error instanceof Error ? error.message : '文件上传失败',
        code: 'UPLOAD_ERROR',
        details: error,
        timestamp: new Date().toISOString()
      });
    }
  }

  // 设置认证token
  setAuthToken(token: string) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // 移除认证token
  removeAuthToken() {
    delete this.defaultHeaders['Authorization'];
  }

  // 更新基础URL
  setBaseURL(baseURL: string) {
    this.baseURL = baseURL.replace(/\/+$/, '');
  }
}

// 创建默认实例
export const apiClient = new ApiClient();

// API错误类
export class ApiError extends Error {
  public code: string;
  public details?: any;
  public timestamp: string;

  constructor(error: { message: string; code: string; details?: any; timestamp: string }) {
    super(error.message);
    this.name = 'ApiError';
    this.code = error.code;
    this.details = error.details;
    this.timestamp = error.timestamp;
  }
}