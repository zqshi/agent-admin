import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BarChart3, 
  MessageSquare, 
  TestTube2, 
  TrendingUp,
  Brain,
  Settings,
  Users,
  Wrench
} from 'lucide-react';
import { cn } from '../utils/cn';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
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
    <div className="flex h-screen bg-gray-25">
      {/* 苹果风格侧边栏 */}
      <div className="w-64 bg-white shadow-apple border-r border-gray-100" style={{backdropFilter: 'blur(20px)', backgroundColor: 'rgba(255, 255, 255, 0.95)'}}>
        {/* 苹果风格 Logo */}
        <div className="flex items-center px-8 py-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 shadow-lg">
              <Brain className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900" style={{fontWeight: 600, letterSpacing: '-0.01em'}}>CogVision</h1>
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
                      ? 'bg-primary-50 text-primary-700 shadow-apple'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
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
        
        {/* 苹果风格底部设置 */}
        <div className="absolute bottom-0 left-0 w-64 p-6 border-t border-gray-100 bg-white" style={{backdropFilter: 'blur(20px)', backgroundColor: 'rgba(255, 255, 255, 0.95)'}}>
          <button className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-xl w-full transition-all duration-300" style={{fontWeight: 500, letterSpacing: '-0.005em'}}>
            <Settings className="h-5 w-5 flex-shrink-0" />
            <span>设置</span>
          </button>
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