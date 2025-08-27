import { useState } from 'react';
import { Settings, Save, RefreshCw, User, Bot, Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { ABTestSystemConfig } from '../types';
import { PageLayout, PageHeader, PageContent, Card, CardHeader, CardBody, Button } from '../components/ui';

const ABTestConfigManagement = () => {
  const [config, setConfig] = useState<ABTestSystemConfig>({
    manualExperimentCreation: false,
    deploymentApprovalRequired: true,
    lastUpdated: new Date(),
    updatedBy: {
      userId: 'admin_001',
      userName: '系统管理员'
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error' | 'warning', message: string} | null>(null);

  const handleSaveConfig = async () => {
    setIsLoading(true);
    setSaveMessage(null);
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedConfig = {
        ...config,
        lastUpdated: new Date(),
        updatedBy: {
          userId: 'admin_001',
          userName: '系统管理员'
        }
      };
      
      setConfig(updatedConfig);
      setSaveMessage({
        type: 'success',
        message: '配置已成功保存'
      });
      
      // 3秒后清除消息
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage({
        type: 'error',
        message: '保存配置时发生错误，请重试'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getImpactDescription = () => {
    const impacts = [];
    
    if (config.manualExperimentCreation) {
      impacts.push('🤖 AI将不会自动创建实验，需要人工干预');
    } else {
      impacts.push('🤖 AI可以自动创建和管理实验');
    }
    
    if (config.deploymentApprovalRequired) {
      impacts.push('🔒 所有上线部署都需要人工审核批准');
    } else {
      impacts.push('⚡ AI可以自动决策并上线部署策略');
    }
    
    return impacts;
  };

  return (
    <PageLayout>
      <PageHeader 
        title="A/B实验系统配置" 
        subtitle="管理实验自动化级别和审核策略"
      >
        <div className="flex gap-3">
          <Button 
            variant="secondary"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4" />
            刷新
          </Button>
          <Button 
            variant="primary"
            onClick={handleSaveConfig}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isLoading ? '保存中...' : '保存配置'}
          </Button>
        </div>
      </PageHeader>

      <PageContent>
        {/* 保存状态提示 */}
        {saveMessage && (
          <div className={`mb-6 p-4 rounded-lg border flex items-center ${
            saveMessage.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            saveMessage.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            'bg-yellow-50 border-yellow-200 text-yellow-800'
          }`}>
            {saveMessage.type === 'success' && <CheckCircle className="h-5 w-5 mr-2" />}
            {saveMessage.type === 'error' && <XCircle className="h-5 w-5 mr-2" />}
            {saveMessage.type === 'warning' && <AlertTriangle className="h-5 w-5 mr-2" />}
            {saveMessage.message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 配置设置 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 实验创建配置 */}
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <Bot className="h-5 w-5 text-purple-600 mr-2" />
                  <h3 className="text-lg font-semibold">实验创建管理</h3>
                </div>
                <p className="text-sm text-gray-600 mt-2">控制AI是否可以自动创建实验任务</p>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <label className="flex items-center cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={config.manualExperimentCreation}
                            onChange={(e) => setConfig(prev => ({
                              ...prev,
                              manualExperimentCreation: e.target.checked
                            }))}
                            className="sr-only"
                          />
                          <div className={`w-12 h-6 rounded-full transition-colors ${
                            config.manualExperimentCreation ? 'bg-blue-600' : 'bg-gray-300'
                          }`}>
                            <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                              config.manualExperimentCreation ? 'translate-x-6' : 'translate-x-0.5'
                            } mt-0.5`}></div>
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="font-medium text-gray-900">
                            {config.manualExperimentCreation ? '需要人工创建实验' : 'AI自动创建实验'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {config.manualExperimentCreation 
                              ? 'AI发现机会时会提醒人类，但不会自动创建实验' 
                              : 'AI发现优化机会时可以自动创建实验任务'}
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">实验类型标识</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 border border-purple-200 rounded-full text-xs mr-2">
                          🤖 AI
                        </span>
                        <span>AI自动创建的实验</span>
                      </div>
                      <div className="flex items-center">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 border border-blue-200 rounded-full text-xs mr-2">
                          👤 人工
                        </span>
                        <span>人工创建的实验</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* 部署审核配置 */}
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="text-lg font-semibold">上线发布审核</h3>
                </div>
                <p className="text-sm text-gray-600 mt-2">控制策略上线是否需要人工审核批准</p>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <label className="flex items-center cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={config.deploymentApprovalRequired}
                            onChange={(e) => setConfig(prev => ({
                              ...prev,
                              deploymentApprovalRequired: e.target.checked
                            }))}
                            className="sr-only"
                          />
                          <div className={`w-12 h-6 rounded-full transition-colors ${
                            config.deploymentApprovalRequired ? 'bg-green-600' : 'bg-gray-300'
                          }`}>
                            <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                              config.deploymentApprovalRequired ? 'translate-x-6' : 'translate-x-0.5'
                            } mt-0.5`}></div>
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="font-medium text-gray-900">
                            {config.deploymentApprovalRequired ? '需要人工审核' : 'AI自动上线'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {config.deploymentApprovalRequired 
                              ? 'AI做出上线建议后需要人工确认才能部署' 
                              : 'AI可以根据数据自动决策并上线策略'}
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-800">重要说明</h4>
                        <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                          <li>• 人工创建的实验始终需要人工操作上线</li>
                          <li>• 此设置仅影响AI创建的实验任务</li>
                          <li>• 建议在生产环境中保持审核开启</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* 配置影响预览 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">当前配置影响</h3>
                <p className="text-sm text-gray-600 mt-2">这些配置将如何影响系统行为</p>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {getImpactDescription().map((impact, index) => (
                    <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-700">{impact}</div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">配置历史</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">最后更新:</span>
                    <span className="font-medium">{config.lastUpdated.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">更新人员:</span>
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="font-medium">{config.updatedBy.userName}</span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">系统状态</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">AI决策引擎</span>
                    <div className="flex items-center text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm font-medium">运行中</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">实验监控</span>
                    <div className="flex items-center text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm font-medium">正常</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">数据同步</span>
                    <div className="flex items-center text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm font-medium">已同步</span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default ABTestConfigManagement;