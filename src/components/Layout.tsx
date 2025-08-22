import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BarChart3, 
  MessageSquare, 
  TestTube2, 
  TrendingUp,
  Brain,
  Settings,
  Users
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigationItems = [
    {
      path: '/',
      name: '监控仪表盘',
      icon: BarChart3,
      exact: true
    },
    {
      path: '/sessions',
      name: '会话查询',
      icon: MessageSquare
    },
    {
      path: '/digital-employees',
      name: '数字员工管理',
      icon: Users
    },
    {
      path: '/ab-testing',
      name: 'A/B智能实验',
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
      {/* 侧边栏 */}
      <div className="w-64 bg-white shadow-sm border-r border-gray-200">
        {/* Logo */}
        <div className="flex items-center px-6 py-4 border-b border-gray-200">
          <Brain className="h-8 w-8 text-primary-600 mr-3" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">CogVision</h1>
            <p className="text-sm text-gray-500">数字员工管理平台</p>
          </div>
        </div>
        
        {/* 导航菜单 */}
        <nav className="mt-6">
          <div className="px-3">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 mb-1 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </NavLink>
              );
            })}
          </div>
        </nav>
        
        {/* 底部设置 */}
        <div className="absolute bottom-0 left-0 w-64 p-4 border-t border-gray-200">
          <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg w-full">
            <Settings className="h-5 w-5 mr-3" />
            设置
          </button>
        </div>
      </div>
      
      {/* 主内容区域 */}
      <div className="flex-1 overflow-hidden">
        <main className="h-full overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;