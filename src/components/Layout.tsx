import { ReactNode, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  MessageSquare,
  TestTube2,
  TrendingUp,
  Brain,
  Settings,
  Users,
  Wrench,
  User,
  LogOut,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  const handleNavigateToSettings = () => {
    navigate('/settings');
    setIsUserMenuOpen(false);
  };

  const navigationItems = [
    {
      path: '/',
      name: '仪表盘',
      icon: BarChart3,
      exact: true
    },
    {
      path: '/digital-employees',
      name: '员工管理',
      icon: Users
    },
    {
      path: '/tools',
      name: '工具管理',
      icon: Wrench
    },
    {
      path: '/sessions',
      name: '会话查询',
      icon: MessageSquare
    },
    {
      path: '/ab-testing',
      name: 'A/B实验',
      icon: TestTube2
    },
    {
      path: '/analytics',
      name: '数据分析',
      icon: TrendingUp
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 苹果风格侧边栏 */}
      <div className="w-64 bg-white shadow-base" style={{backgroundColor: '#FFFFFF'}}>
        {/* 苹果风格 Logo */}
        <div className="flex items-center px-8 py-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl shadow-base" style={{backgroundColor: '#0066FF'}}>
              <Brain className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900" style={{fontWeight: 600, letterSpacing: '-0.01em'}}>KingSoft</h1>
              <p className="text-xs text-gray-500" style={{fontWeight: 400, letterSpacing: '-0.005em'}}>数字员工管理平台</p>
            </div>
          </div>
        </div>
        
        {/* 苹果风格导航菜单 */}
        <nav className="mt-8 px-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300',
                    isActive
                      ? 'bg-gray-100 text-gray-900 shadow-base'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )
                }
                style={{
                  fontWeight: 500,
                  letterSpacing: '-0.005em'
                }}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
        
        {/* 用户信息和设置区域 */}
        <div className="absolute bottom-0 left-0 w-64 p-6 border-t border-gray-100 bg-white">
          {/* 用户信息 */}
          <div className="mb-4">
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white text-sm font-medium">
                {user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate" style={{fontWeight: 500, letterSpacing: '-0.005em'}}>
                  {user?.name || user?.username || '未知用户'}
                </p>
                <p className="text-xs text-gray-500 truncate" style={{fontWeight: 400, letterSpacing: '-0.005em'}}>
                  {user?.role || '用户'}
                </p>
              </div>
            </div>
          </div>

          {/* 设置菜单 */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-xl w-full transition-all duration-300"
              style={{fontWeight: 500, letterSpacing: '-0.005em'}}
            >
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 flex-shrink-0" />
                <span>设置</span>
              </div>
              {isUserMenuOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {/* 下拉菜单 */}
            {isUserMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-100 py-2">
                <button
                  onClick={handleNavigateToSettings}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>个人信息</span>
                </button>
                <button
                  onClick={handleNavigateToSettings}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  <span>系统设置</span>
                </button>
                <hr className="my-2 mx-2 border-gray-100" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>退出登录</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 主内容区域 */}
      <div className="flex-1 overflow-hidden">
        <main className="h-full overflow-y-auto scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;