/**
 * 系统设置页面
 * 提供完整的系统配置和个人信息管理功能
 */

import React, { useState } from 'react';
import {
  User,
  Settings as SettingsIcon,
  Database,
  Wifi,
  Shield,
  Info,
  Moon,
  Sun,
  Globe,
  Bell,
  Download,
  Upload,
  RotateCcw,
  Save,
  Camera,
  Mail,
  Lock
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  PageLayout,
  PageHeader,
  PageContent,
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge
} from '../components/ui';
import { Input } from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';

const Settings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [activeSection, setActiveSection] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [settings, setSettings] = useState({
    // 个人信息
    personal: {
      name: user?.name || '',
      email: user?.email || '',
      avatar: user?.avatar || '',
      role: user?.role || '',
    },
    // 系统配置
    system: {
      theme: 'light',
      language: 'zh-CN',
      notifications: true,
      autoSave: true,
    },
    // API配置
    api: {
      baseUrl: 'https://api.kingsoft.com',
      timeout: 30000,
      retries: 3,
    }
  });

  const handlePersonalInfoSave = () => {
    updateUser({
      name: settings.personal.name,
      email: settings.personal.email,
    });
    setIsEditing(false);
  };

  const handleSystemSettingsChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      system: {
        ...prev.system,
        [key]: value
      }
    }));
  };

  const settingsSections = [
    { id: 'personal', label: '个人信息', icon: User },
    { id: 'system', label: '系统配置', icon: SettingsIcon },
    { id: 'data', label: '数据管理', icon: Database },
    { id: 'api', label: 'API配置', icon: Wifi },
    { id: 'security', label: '权限管理', icon: Shield },
    { id: 'about', label: '关于系统', icon: Info },
  ];

  const renderPersonalSection = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">基本信息</h3>
          <p className="text-sm text-gray-500">管理您的个人资料和账户信息</p>
        </CardHeader>
        <CardBody className="space-y-4">
          {/* 头像上传 */}
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-2xl font-medium">
              {settings.personal.name.charAt(0) || 'U'}
            </div>
            <div>
              <Button variant="secondary" size="sm" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                更换头像
              </Button>
              <p className="text-xs text-gray-500 mt-1">支持 JPG、PNG 格式，建议尺寸 200x200</p>
            </div>
          </div>

          {/* 基本信息表单 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="姓名"
              value={settings.personal.name}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                personal: { ...prev.personal, name: e.target.value }
              }))}
              disabled={!isEditing}
            />
            <Input
              label="邮箱"
              type="email"
              value={settings.personal.email}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                personal: { ...prev.personal, email: e.target.value }
              }))}
              disabled={!isEditing}
            />
            <div>
              <label className="label">角色</label>
              <div className="flex items-center gap-2">
                <Badge variant="success">{settings.personal.role}</Badge>
              </div>
            </div>
            <div>
              <label className="label">用户ID</label>
              <p className="text-sm text-gray-600 py-2">{user?.id}</p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            {!isEditing ? (
              <Button
                variant="primary"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                编辑信息
              </Button>
            ) : (
              <>
                <Button
                  variant="success"
                  onClick={handlePersonalInfoSave}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  保存更改
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                >
                  取消
                </Button>
              </>
            )}
          </div>
        </CardBody>
      </Card>

      {/* 密码修改 */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">安全设置</h3>
          <p className="text-sm text-gray-500">修改密码和安全配置</p>
        </CardHeader>
        <CardBody>
          <Button variant="secondary" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            修改密码
          </Button>
        </CardBody>
      </Card>
    </div>
  );

  const renderSystemSection = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">外观设置</h3>
          <p className="text-sm text-gray-500">自定义系统外观和主题</p>
        </CardHeader>
        <CardBody className="space-y-4">
          <div>
            <label className="label">主题模式</label>
            <div className="flex gap-3">
              <Button
                variant={settings.system.theme === 'light' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => handleSystemSettingsChange('theme', 'light')}
                className="flex items-center gap-2"
              >
                <Sun className="h-4 w-4" />
                浅色模式
              </Button>
              <Button
                variant={settings.system.theme === 'dark' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => handleSystemSettingsChange('theme', 'dark')}
                className="flex items-center gap-2"
              >
                <Moon className="h-4 w-4" />
                深色模式
              </Button>
            </div>
          </div>

          <div>
            <label className="label">语言设置</label>
            <select
              className="input w-48"
              value={settings.system.language}
              onChange={(e) => handleSystemSettingsChange('language', e.target.value)}
            >
              <option value="zh-CN">简体中文</option>
              <option value="zh-TW">繁體中文</option>
              <option value="en-US">English</option>
            </select>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">通知设置</h3>
          <p className="text-sm text-gray-500">管理系统通知和提醒</p>
        </CardHeader>
        <CardBody>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">桌面通知</p>
                <p className="text-xs text-gray-500">接收系统重要通知</p>
              </div>
            </div>
            <button
              onClick={() => handleSystemSettingsChange('notifications', !settings.system.notifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.system.notifications ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.system.notifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const renderDataSection = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">数据导入导出</h3>
          <p className="text-sm text-gray-500">备份和恢复系统数据</p>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex gap-3">
            <Button variant="secondary" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              导出配置
            </Button>
            <Button variant="secondary" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              导入配置
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">数据清理</h3>
          <p className="text-sm text-gray-500">清理临时文件和缓存数据</p>
        </CardHeader>
        <CardBody>
          <Button variant="error" className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            清理缓存
          </Button>
        </CardBody>
      </Card>
    </div>
  );

  const renderApiSection = () => (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-medium text-gray-900">API 配置</h3>
        <p className="text-sm text-gray-500">配置系统API连接参数</p>
      </CardHeader>
      <CardBody className="space-y-4">
        <Input
          label="API 基础地址"
          value={settings.api.baseUrl}
          onChange={(e) => setSettings(prev => ({
            ...prev,
            api: { ...prev.api, baseUrl: e.target.value }
          }))}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="超时时间 (ms)"
            type="number"
            value={settings.api.timeout}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              api: { ...prev.api, timeout: parseInt(e.target.value) }
            }))}
          />
          <Input
            label="重试次数"
            type="number"
            value={settings.api.retries}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              api: { ...prev.api, retries: parseInt(e.target.value) }
            }))}
          />
        </div>
        <div className="pt-4">
          <Button variant="primary" className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            保存 API 配置
          </Button>
        </div>
      </CardBody>
    </Card>
  );

  const renderSecuritySection = () => (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-medium text-gray-900">权限管理</h3>
        <p className="text-sm text-gray-500">管理用户权限和访问控制</p>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">管理员权限</p>
              <p className="text-xs text-gray-500">完全访问系统所有功能</p>
            </div>
            <Badge variant="success">已启用</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">数据访问</p>
              <p className="text-xs text-gray-500">读取和修改系统数据</p>
            </div>
            <Badge variant="success">已启用</Badge>
          </div>
        </div>
      </CardBody>
    </Card>
  );

  const renderAboutSection = () => (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-medium text-gray-900">关于系统</h3>
        <p className="text-sm text-gray-500">系统版本和更新信息</p>
      </CardHeader>
      <CardBody className="space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-900">KingSoft 数字员工管理平台</p>
          <p className="text-sm text-gray-500">版本 1.0.0</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">© 2024 KingSoft. All rights reserved.</p>
        </div>
        <div className="pt-4">
          <Button variant="secondary" size="sm">
            检查更新
          </Button>
        </div>
      </CardBody>
    </Card>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'personal': return renderPersonalSection();
      case 'system': return renderSystemSection();
      case 'data': return renderDataSection();
      case 'api': return renderApiSection();
      case 'security': return renderSecuritySection();
      case 'about': return renderAboutSection();
      default: return renderPersonalSection();
    }
  };

  return (
    <PageLayout>
      <PageHeader>
        <div>
          <h1 className="page-title flex items-center gap-3">
            <SettingsIcon className="h-8 w-8 text-gray-700" />
            系统设置
          </h1>
          <p className="page-subtitle">管理个人信息、系统配置和安全选项</p>
        </div>
      </PageHeader>

      <PageContent>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 左侧导航菜单 */}
          <div className="lg:col-span-1">
            <Card>
              <div className="p-6">
                <nav className="space-y-2">
                  {settingsSections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          activeSection === section.id
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {section.label}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </Card>
          </div>

          {/* 右侧内容区域 */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default Settings;