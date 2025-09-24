/**
 * 登录页面 - 苹果风格设计
 * 提供用户认证功能，使用Mock数据进行验证
 */

import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Brain, User, Lock, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const { login, isAuthenticated } = useAuth();
  const location = useLocation();

  // 获取重定向路径，默认为 dashboard
  const from = (location.state as any)?.from?.pathname || '/';

  // 如果已登录，重定向到目标页面
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = '请输入用户名';
    }

    if (!formData.password.trim()) {
      newErrors.password = '请输入密码';
    } else if (formData.password.length < 6) {
      newErrors.password = '密码至少需要6位字符';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setLoginError('');

    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock用户验证
      const isValid = formData.username === 'admin' && formData.password === '123456';

      if (isValid) {
        const mockUser = {
          id: '1',
          username: 'admin',
          name: '系统管理员',
          role: '超级管理员',
          avatar: '',
          email: 'admin@kingsoft.com'
        };

        login(mockUser);
      } else {
        setLoginError('用户名或密码错误，请重试');
      }
    } catch (error) {
      setLoginError('登录失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* 头部Logo和标题 */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-base" style={{backgroundColor: '#0066FF'}}>
              <Brain className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-semibold text-gray-900" style={{fontWeight: 600, letterSpacing: '-0.02em'}}>
            欢迎登录
          </h2>
          <p className="mt-2 text-sm text-gray-600" style={{fontWeight: 400, letterSpacing: '-0.005em'}}>
            KingSoft 数字员工管理平台
          </p>
        </div>

        {/* 登录表单 */}
        <div className="bg-white rounded-xl shadow-base p-8" style={{backgroundColor: '#FFFFFF'}}>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* 登录错误提示 */}
            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-700">{loginError}</p>
                  <p className="text-xs text-red-600 mt-1">默认账号：admin，密码：123456</p>
                </div>
              </div>
            )}

            {/* 用户名输入 */}
            <div>
              <Input
                label="用户名"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={formData.username}
                onChange={handleInputChange}
                error={!!errors.username}
                errorText={errors.username}
                placeholder="请输入用户名"
                style={{
                  fontSize: '14px',
                  fontWeight: 400,
                  letterSpacing: '-0.005em'
                }}
              />
            </div>

            {/* 密码输入 */}
            <div>
              <Input
                label="密码"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                error={!!errors.password}
                errorText={errors.password}
                placeholder="请输入密码"
                style={{
                  fontSize: '14px',
                  fontWeight: 400,
                  letterSpacing: '-0.005em'
                }}
              />
            </div>

            {/* 登录按钮 */}
            <div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                className="w-full"
                style={{
                  background: '#0066FF',
                  color: 'white',
                  fontWeight: 500,
                  letterSpacing: '-0.005em'
                }}
              >
                {isLoading ? '登录中...' : '立即登录'}
              </Button>
            </div>
          </form>

          {/* 提示信息 */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <p className="text-xs text-gray-500" style={{fontWeight: 400, letterSpacing: '-0.005em'}}>
                演示账号信息
              </p>
              <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">
                  <span className="font-medium">用户名：</span>admin
                </p>
                <p className="text-xs text-blue-700">
                  <span className="font-medium">密码：</span>123456
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 页脚信息 */}
        <div className="text-center">
          <p className="text-xs text-gray-400" style={{fontWeight: 400, letterSpacing: '-0.005em'}}>
            © 2024 KingSoft. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;