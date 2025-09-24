/**
 * 私有路由组件
 * 用于保护需要认证的页面，未登录用户自动重定向到登录页面
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // 未登录时重定向到登录页面，并保存当前位置信息
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 已登录时渲染子组件
  return <>{children}</>;
};

export default PrivateRoute;