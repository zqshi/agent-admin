/**
 * 用户认证状态管理
 * 提供登录状态、用户信息和认证相关操作
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 用户信息接口
export interface User {
  id: string;
  username: string;
  name: string;
  role: string;
  avatar?: string;
  email?: string;
}

// 认证上下文接口
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider 属性接口
interface AuthProviderProps {
  children: ReactNode;
}

// 本地存储键名
const STORAGE_KEY = 'kingsoft_admin_auth';

// AuthProvider 组件
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // 初始化认证状态
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedAuth = localStorage.getItem(STORAGE_KEY);
        if (storedAuth) {
          const authData = JSON.parse(storedAuth);

          // 验证存储数据的有效性
          if (authData.user && authData.user.id && authData.isAuthenticated) {
            setUser(authData.user);
            setIsAuthenticated(true);
          } else {
            // 清理无效数据
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error('初始化认证状态失败:', error);
        // 清理损坏的数据
        localStorage.removeItem(STORAGE_KEY);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  // 保存认证状态到本地存储
  const saveAuthToStorage = (userData: User | null, authenticated: boolean) => {
    try {
      const authData = {
        user: userData,
        isAuthenticated: authenticated,
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
    } catch (error) {
      console.error('保存认证状态失败:', error);
    }
  };

  // 登录函数
  const login = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    saveAuthToStorage(userData, true);
  };

  // 登出函数
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  // 更新用户信息
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      saveAuthToStorage(updatedUser, true);
    }
  };

  // 上下文值
  const contextValue: AuthContextType = {
    isAuthenticated,
    user,
    login,
    logout,
    updateUser
  };

  // 在初始化完成之前显示加载状态
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在初始化...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// 使用认证上下文的 Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth 必须在 AuthProvider 内部使用');
  }

  return context;
};

// 导出认证上下文用于高级用法
export { AuthContext };