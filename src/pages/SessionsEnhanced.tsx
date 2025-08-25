import { useState, useEffect, useRef } from 'react';
import { 
  Filter, Eye, CheckCircle, XCircle, Clock, User, MessageSquare, 
  Zap, ChevronDown, ChevronRight, ExternalLink, Code, Activity, Users,
  Brain, Layers, PlayCircle, PauseCircle, AlertCircle, TrendingUp,
  Settings, Wifi, WifiOff, Timer, ChevronUp
} from 'lucide-react';
import { mockSessions } from '../data/mockData';
import { digitalEmployees, humanEmployees, liveSessions, mockRealtimeUpdates } from '../data/realtimeData';
import { Session, DigitalEmployee, HumanEmployee, LiveSession, ReasoningStep } from '../types';
import { format } from 'date-fns';
import { PageLayout, PageHeader, PageContent, Card, CardHeader, CardBody, FilterSection, Button, Input } from '../components/ui';

type ViewMode = 'realtime' | 'historical';
type RealtimeDimension = 'digital-employees' | 'human-employees' | 'global-activity';

const SessionsEnhanced = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('realtime');
  const [realtimeDimension, setRealtimeDimension] = useState<RealtimeDimension>('global-activity');
  const [selectedSession, setSelectedSession] = useState<LiveSession | Session | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<DigitalEmployee | null>(null);
  const [expandedTraces, setExpandedTraces] = useState<Set<string>>(new Set());
  const [expandedReasoningSteps, setExpandedReasoningSteps] = useState<Set<string>>(new Set());
  
  // Helper function to get user name by user ID
  const getUserName = (userId: string) => {
    const user = humanEmployees.find(emp => emp.id === userId);
    return user ? user.name : userId; // Fallback to ID if name not found
  };
  
  // 实时数据状态
  const [liveDigitalEmployees, setLiveDigitalEmployees] = useState(digitalEmployees);
  const [liveHumanEmployees, setLiveHumanEmployees] = useState(humanEmployees);
  const [liveSessions_, setLiveSessions] = useState(liveSessions);
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'reconnecting'>('disconnected');
  
  // 使用ref来避免闭包问题
  const connectionStatusRef = useRef(connectionStatus);
  connectionStatusRef.current = connectionStatus;
  
  // 手动重连功能
  const handleManualReconnect = () => {
    console.log('🔄 手动重连...');
    setConnectionStatus('connecting');
    setIsRealTimeConnected(false);
    
    setTimeout(() => {
      setIsRealTimeConnected(true);
      setConnectionStatus('connected');
      console.log('✅ 手动重连成功');
    }, 1000);
  };

  // 高级查询状态
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [toolFilter, setToolFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [minTokens, setMinTokens] = useState('');
  const [maxTokens, setMaxTokens] = useState('');
  const [minDuration, setMinDuration] = useState('');
  const [maxDuration, setMaxDuration] = useState('');

  // 增强的实时数据更新 - 模拟WebSocket连接
  useEffect(() => {
    if (viewMode === 'realtime') {
      console.log('🔌 正在建立实时连接...');
      setConnectionStatus('connecting');
      setIsRealTimeConnected(false);
      
      // 模拟连接建立过程
      const connectTimeout = setTimeout(() => {
        setIsRealTimeConnected(true);
        setConnectionStatus('connected');
        console.log('✅ 实时连接已建立');
      }, 1500); // 稍微延长连接时间，让用户看到连接过程
      
      // 实时数据推送模拟 (模拟WebSocket事件)
      const realtimeInterval = setInterval(() => {
        // 使用ref获取最新的连接状态，避免闭包问题
        if (connectionStatusRef.current === 'connected') {
          const updateEvent = {
            type: 'realtime_update',
            timestamp: new Date().toISOString(),
            data: {
              digitalEmployees: mockRealtimeUpdates.digitalEmployeeUpdates(),
              humanEmployees: mockRealtimeUpdates.humanEmployeeUpdates(),
              sessions: mockRealtimeUpdates.sessionUpdates()
            }
          };
          
          console.log('📡 实时数据推送:', updateEvent.timestamp);
          
          setLiveDigitalEmployees(updateEvent.data.digitalEmployees);
          setLiveHumanEmployees(updateEvent.data.humanEmployees);
          setLiveSessions(updateEvent.data.sessions);
        }
      }, 3000); // 3秒更新一次
      
      // 模拟网络间歇性断连 (降低频率，延长检查周期)
      const connectionCheck = setInterval(() => {
        if (Math.random() < 0.02 && connectionStatusRef.current === 'connected') { // 2%概率模拟短暂断连
          console.log('⚠️ 模拟网络间歇性断连');
          setIsRealTimeConnected(false);
          setConnectionStatus('reconnecting');
          
          // 1.5秒后自动重连
          setTimeout(() => {
            setIsRealTimeConnected(true);
            setConnectionStatus('connected');
            console.log('🔄 实时连接已恢复');
          }, 1500);
        }
      }, 45000); // 每45秒检查一次，进一步降低断连频率

      return () => {
        clearTimeout(connectTimeout);
        clearInterval(realtimeInterval);
        clearInterval(connectionCheck);
        setIsRealTimeConnected(false);
        setConnectionStatus('disconnected');
        console.log('🔌 实时连接已断开');
      };
    } else {
      setIsRealTimeConnected(false);
      setConnectionStatus('disconnected');
    }
  }, [viewMode]); // 只依赖viewMode，避免无限循环
  
  // 独立的连接状态更新效果
  useEffect(() => {
    if (viewMode !== 'realtime') return;
    
    // 监听连接状态变化，更新UI
    if (connectionStatus === 'connected') {
      console.log('🟢 连接状态：已连接');
    } else if (connectionStatus === 'connecting') {
      console.log('🟡 连接状态：连接中');
    } else if (connectionStatus === 'reconnecting') {
      console.log('🟠 连接状态：重连中');
    } else {
      console.log('🔴 连接状态：已断开');
    }
  }, [connectionStatus, viewMode]);
  
  // 页面加载时的连接状态初始化检查
  useEffect(() => {
    if (viewMode === 'realtime') {
      console.log('📱 实时监控模式已激活');
      console.log('🔧 初始连接状态:', connectionStatus);
    }
  }, [viewMode, connectionStatus]);

  const toggleTraceExpanded = (traceId: string) => {
    const newExpanded = new Set(expandedTraces);
    if (newExpanded.has(traceId)) {
      newExpanded.delete(traceId);
    } else {
      newExpanded.add(traceId);
    }
    setExpandedTraces(newExpanded);
  };

  const toggleReasoningStep = (stepId: string) => {
    const newExpanded = new Set(expandedReasoningSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedReasoningSteps(newExpanded);
  };

  // 状态指示组件
  const StatusIndicator = ({ status, isLive = false }: { status: string; isLive?: boolean }) => {
    const getStatusConfig = () => {
      if (isLive) {
        return {
          'idle': { color: 'bg-gray-100 text-gray-600', icon: PauseCircle, pulse: false },
          'busy': { color: 'bg-green-100 text-green-700', icon: PlayCircle, pulse: true },
          'offline': { color: 'bg-red-100 text-red-700', icon: WifiOff, pulse: false },
          'active': { color: 'bg-blue-100 text-blue-700', icon: Activity, pulse: true },
          'waiting': { color: 'bg-yellow-100 text-yellow-700', icon: Timer, pulse: true }
        }[status];
      } else {
        return {
          'success': { color: 'bg-green-100 text-green-800', icon: CheckCircle, pulse: false },
          'failed': { color: 'bg-red-100 text-red-800', icon: XCircle, pulse: false },
          'running': { color: 'bg-blue-100 text-blue-800', icon: Clock, pulse: true }
        }[status];
      }
    };

    const config = getStatusConfig();
    if (!config) return null;

    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className={`h-3 w-3 mr-1 ${config.pulse ? 'animate-pulse' : ''}`} />
        {status === 'success' ? '成功' : 
         status === 'failed' ? '失败' : 
         status === 'running' ? '运行中' :
         status === 'idle' ? '空闲' :
         status === 'busy' ? '忙碌' :
         status === 'offline' ? '离线' :
         status === 'active' ? '活跃' :
         status === 'waiting' ? '等待' : status}
      </span>
    );
  };

  // 增强的推理步骤可视化组件
  const ReasoningStepsVisualization = ({ steps }: { steps: ReasoningStep[] }) => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h5 className="font-medium text-gray-700 flex items-center">
            <Brain className="h-4 w-4 mr-2" />
            推理过程详情 (Chain-of-Thought)
          </h5>
          <div className="flex items-center text-xs text-gray-500">
            <div className="flex items-center mr-4">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              已完成
            </div>
            <div className="flex items-center mr-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-1 animate-pulse"></div>
              进行中
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
              错误
            </div>
          </div>
        </div>
        
        <div className="relative">
          {/* 时间线 */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          
          {steps.map((step, index) => (
            <div key={step.id} className="relative flex items-start mb-6">
              {/* 步骤指示器 */}
              <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 shadow-sm ${
                step.status === 'completed' ? 'bg-green-500 border-green-500' :
                step.status === 'processing' ? 'bg-blue-500 border-blue-500 animate-pulse' :
                step.status === 'error' ? 'bg-red-500 border-red-500' :
                'bg-gray-300 border-gray-300'
              }`}>
                <span className="text-white text-sm font-bold">{step.step}</span>
              </div>
              
              {/* 步骤类型标识 */}
              <div className={`absolute left-14 top-3 px-2 py-1 rounded-full text-xs font-medium ${
                step.type === 'thinking' ? 'bg-purple-100 text-purple-700' :
                step.type === 'tool_decision' ? 'bg-blue-100 text-blue-700' :
                step.type === 'tool_execution' ? 'bg-green-100 text-green-700' :
                'bg-orange-100 text-orange-700'
              }`}>
                {step.type === 'thinking' ? '💭 思考' :
                 step.type === 'tool_decision' ? '🎯 决策' :
                 step.type === 'tool_execution' ? '⚡ 执行' :
                 '📝 生成'}
              </div>
              
              {/* 步骤内容 */}
              <div className="ml-6 flex-1">
                <button 
                  onClick={() => toggleReasoningStep(step.id)}
                  className="w-full text-left p-4 bg-white hover:bg-gray-50 rounded-lg border border-gray-200 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="font-semibold text-gray-900">{step.title}</span>
                      <span className="ml-3 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {format(new Date(step.timestamp), 'HH:mm:ss.SSS')}
                      </span>
                    </div>
                    <div className="flex items-center">
                      {step.status === 'processing' && (
                        <div className="flex items-center mr-2">
                          <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-500 border-t-transparent mr-1"></div>
                          <span className="text-xs text-blue-600">处理中...</span>
                        </div>
                      )}
                      {expandedReasoningSteps.has(step.id) ? 
                        <ChevronUp className="h-4 w-4 text-gray-400" /> : 
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      }
                    </div>
                  </div>
                  
                  {/* 预览内容 */}
                  <div className="text-sm text-gray-600 line-clamp-2">
                    {step.content.substring(0, 100)}{step.content.length > 100 ? '...' : ''}
                  </div>
                  
                  {expandedReasoningSteps.has(step.id) && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                      {/* 详细内容 */}
                      <div>
                        <h6 className="font-medium text-gray-700 mb-2 flex items-center">
                          <Code className="h-3 w-3 mr-1" />
                          详细推理过程
                        </h6>
                        <div className="bg-gray-50 p-3 rounded-md border">
                          <div className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
                            {step.content}
                          </div>
                        </div>
                      </div>
                      
                      {/* 元数据展示 */}
                      {step.metadata && (
                        <div>
                          <h6 className="font-medium text-gray-700 mb-2 flex items-center">
                            <Settings className="h-3 w-3 mr-1" />
                            技术元数据
                          </h6>
                          <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                              {step.metadata.model && (
                                <div className="flex justify-between">
                                  <span className="font-medium text-gray-600">使用模型:</span>
                                  <span className="text-blue-700 font-mono">{step.metadata.model}</span>
                                </div>
                              )}
                              {step.metadata.promptTokens && (
                                <div className="flex justify-between">
                                  <span className="font-medium text-gray-600">Prompt Tokens:</span>
                                  <span className="text-green-700 font-mono">{step.metadata.promptTokens}</span>
                                </div>
                              )}
                              {step.metadata.completionTokens && (
                                <div className="flex justify-between">
                                  <span className="font-medium text-gray-600">Completion Tokens:</span>
                                  <span className="text-green-700 font-mono">{step.metadata.completionTokens}</span>
                                </div>
                              )}
                              {step.metadata.temperature && (
                                <div className="flex justify-between">
                                  <span className="font-medium text-gray-600">Temperature:</span>
                                  <span className="text-purple-700 font-mono">{step.metadata.temperature}</span>
                                </div>
                              )}
                              {step.metadata.responseTime && (
                                <div className="flex justify-between">
                                  <span className="font-medium text-gray-600">响应时间:</span>
                                  <span className="text-orange-700 font-mono">{step.metadata.responseTime}ms</span>
                                </div>
                              )}
                              {step.metadata.promptTemplate && (
                                <div className="flex justify-between">
                                  <span className="font-medium text-gray-600">提示词模板:</span>
                                  <span className="text-indigo-700 font-mono">{step.metadata.promptTemplate}</span>
                                </div>
                              )}
                            </div>
                            
                            {/* 其他元数据 */}
                            {Object.keys(step.metadata).filter(key => 
                              !['model', 'promptTokens', 'completionTokens', 'temperature', 'responseTime', 'promptTemplate'].includes(key)
                            ).length > 0 && (
                              <details className="mt-3">
                                <summary className="font-medium text-gray-600 cursor-pointer hover:text-gray-800">
                                  其他元数据 ▼
                                </summary>
                                <div className="mt-2 p-2 bg-white rounded border">
                                  <pre className="text-xs text-gray-600 overflow-x-auto">
                                    {JSON.stringify(
                                      Object.fromEntries(
                                        Object.entries(step.metadata).filter(([key]) => 
                                          !['model', 'promptTokens', 'completionTokens', 'temperature', 'responseTime', 'promptTemplate'].includes(key)
                                        )
                                      ), 
                                      null, 
                                      2
                                    )}
                                  </pre>
                                </div>
                              </details>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* 推理过程统计 */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
          <h6 className="font-medium text-gray-700 mb-3 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            推理过程统计
          </h6>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-blue-600 text-lg">{steps.length}</div>
              <div className="text-gray-600">总步骤数</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-green-600 text-lg">
                {steps.filter(s => s.status === 'completed').length}
              </div>
              <div className="text-gray-600">已完成</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-orange-600 text-lg">
                {steps.filter(s => s.status === 'processing').length}
              </div>
              <div className="text-gray-600">进行中</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-red-600 text-lg">
                {steps.filter(s => s.status === 'error').length}
              </div>
              <div className="text-gray-600">错误</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 增强的全局实时活动视图 - 指挥官大屏风格
  const GlobalActivityView = () => {
    const totalSessions = liveSessions_.length;
    const activeSessions = liveSessions_.filter(s => s.status === 'success').length;
    const busyEmployees = liveDigitalEmployees.filter(de => de.status === 'busy').length;
    const waitingUsers = liveHumanEmployees.filter(he => he.sessionStatus === 'waiting').length;
    const averageWaitTime = waitingUsers > 0 ? 
      Math.round(liveHumanEmployees
        .filter(he => he.sessionStatus === 'waiting' && he.waitingTime)
        .reduce((acc, he) => acc + (he.waitingTime || 0), 0) / waitingUsers) : 0;
    
    return (
      <div className="space-y-6">
        {/* 增强的实时连接状态条 */}
        <div className={`p-4 rounded-lg border-l-4 transition-all duration-500 ${
          connectionStatus === 'connected' 
            ? 'bg-green-50 border-green-500 shadow-green-100' 
            : connectionStatus === 'connecting'
            ? 'bg-blue-50 border-blue-500 shadow-blue-100'
            : connectionStatus === 'reconnecting'
            ? 'bg-yellow-50 border-yellow-500 shadow-yellow-100'
            : 'bg-red-50 border-red-500 shadow-red-100'
        } shadow-sm`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {connectionStatus === 'connected' ? (
                <>
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    <Wifi className="h-5 w-5 text-green-600 mr-2" />
                    <span className="font-medium text-green-800">实时连接正常</span>
                  </div>
                  <span className="ml-4 text-sm text-green-600">数据每3秒自动更新</span>
                </>
              ) : connectionStatus === 'connecting' ? (
                <>
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent mr-2"></div>
                    <span className="font-medium text-blue-800">正在建立连接...</span>
                  </div>
                  <span className="ml-4 text-sm text-blue-600">初始化实时数据流</span>
                </>
              ) : connectionStatus === 'reconnecting' ? (
                <>
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-yellow-500 rounded-full mr-2 animate-pulse"></div>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-500 border-t-transparent mr-2"></div>
                    <span className="font-medium text-yellow-800">连接中断，正在重连...</span>
                  </div>
                  <span className="ml-4 text-sm text-yellow-600">自动恢复中</span>
                </>
              ) : (
                <>
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-red-500 rounded-full mr-2"></div>
                    <WifiOff className="h-5 w-5 text-red-600 mr-2" />
                    <span className="font-medium text-red-800">连接已断开</span>
                  </div>
                  <span className="ml-4 text-sm text-red-600">实时功能不可用</span>
                </>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {connectionStatus === 'connected' && (
                <div className="flex items-center text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                  <Activity className="h-3 w-3 mr-1" />
                  活跃中
                </div>
              )}
              {(connectionStatus === 'disconnected' || connectionStatus === 'reconnecting') && (
                <button
                  onClick={handleManualReconnect}
                  disabled={connectionStatus === 'connecting'}
                  className="flex items-center text-xs bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-3 py-1 rounded transition-colors"
                >
                  {connectionStatus === 'connecting' ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent mr-1"></div>
                      连接中
                    </>
                  ) : (
                    <>
                      <Wifi className="h-3 w-3 mr-1" />
                      重新连接
                    </>
                  )}
                </button>
              )}
              <div className="text-xs text-gray-500">
                更新时间: {format(new Date(), 'HH:mm:ss')}
              </div>
            </div>
          </div>
        </div>
        
        {/* 关键指标大屏 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* 活跃会话 */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <Activity className="h-8 w-8" />
                <span className="text-xs bg-blue-400 bg-opacity-50 px-2 py-1 rounded-full">实时</span>
              </div>
              <p className="text-3xl font-bold mb-1">{totalSessions}</p>
              <p className="text-blue-100 text-sm">活跃会话</p>
              <div className="text-xs text-blue-200 mt-2 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                {activeSessions}/{totalSessions} 正常运行
              </div>
            </div>
          </div>
          
          {/* 忙碌员工 */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <Brain className="h-8 w-8" />
                <span className="text-xs bg-green-400 bg-opacity-50 px-2 py-1 rounded-full">在线</span>
              </div>
              <p className="text-3xl font-bold mb-1">{busyEmployees}</p>
              <p className="text-green-100 text-sm">忙碌员工</p>
              <div className="text-xs text-green-200 mt-2 flex items-center">
                <Users className="h-3 w-3 mr-1" />
                {liveDigitalEmployees.length}个员工在线
              </div>
            </div>
          </div>
          
          {/* 等待用户 */}
          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <Timer className="h-8 w-8" />
                {waitingUsers > 0 && <div className="h-2 w-2 bg-yellow-300 rounded-full animate-pulse"></div>}
              </div>
              <p className="text-3xl font-bold mb-1">{waitingUsers}</p>
              <p className="text-yellow-100 text-sm">等待用户</p>
              <div className="text-xs text-yellow-200 mt-2 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                平均等待 {averageWaitTime}s
              </div>
            </div>
          </div>
          
          {/* 系统负载 */}
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <Settings className="h-8 w-8" />
                <span className={`text-xs px-2 py-1 rounded-full ${
                  totalSessions < 10 ? 'bg-green-400 bg-opacity-50' :
                  totalSessions < 20 ? 'bg-yellow-400 bg-opacity-50' :
                  'bg-red-400 bg-opacity-50'
                }`}>
                  {totalSessions < 10 ? '低载' : totalSessions < 20 ? '中载' : '高载'}
                </span>
              </div>
              <p className="text-3xl font-bold mb-1">{Math.round((totalSessions / 30) * 100)}%</p>
              <p className="text-purple-100 text-sm">系统负载</p>
              <div className="text-xs text-purple-200 mt-2 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                容量上限 30 会话
              </div>
            </div>
          </div>
        </div>

        {/* 增强的实时会话列表 - 支持实时状态更新 */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center">
                <Activity className="h-6 w-6 mr-3" />
                实时会话指挥中心
              </h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-green-300">
                  <div className="h-2 w-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-sm">{totalSessions} 活跃会话</span>
                </div>
                <div className="text-gray-300 text-sm">
                  最后更新: {format(new Date(), 'HH:mm:ss')}
                </div>
              </div>
            </div>
            
            {/* 快速统计 */}
            <div className="grid grid-cols-4 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{activeSessions}</div>
                <div className="text-xs text-gray-300">正常会话</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {liveSessions_.filter(s => s.currentStep === '调用工具中').length}
                </div>
                <div className="text-xs text-gray-300">工具调用</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {liveSessions_.filter(s => s.currentStep === '回复中').length}
                </div>
                <div className="text-xs text-gray-300">生成回复</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">
                  {liveSessions_.filter(s => s.currentStep === '思考中').length}
                </div>
                <div className="text-xs text-gray-300">AI思考</div>
              </div>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {liveSessions_.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>当前没有活跃的实时会话</p>
                <p className="text-sm text-gray-400 mt-1">系统处于空闲状态</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {liveSessions_.map((session) => {
                  const isSelected = selectedSession?.id === session.id;
                  const stepColor = {
                    '思考中': 'bg-orange-100 text-orange-700 border-orange-200',
                    '调用工具中': 'bg-yellow-100 text-yellow-700 border-yellow-200',
                    '回复中': 'bg-green-100 text-green-700 border-green-200',
                    '等待用户': 'bg-blue-100 text-blue-700 border-blue-200'
                  }[session.currentStep] || 'bg-gray-100 text-gray-700 border-gray-200';
                  
                  return (
                    <div
                      key={session.id}
                      className={`p-5 cursor-pointer transition-all duration-200 hover:bg-blue-50 ${
                        isSelected ? 'bg-blue-50 border-l-4 border-blue-500 shadow-inner' : 'hover:shadow-sm'
                      }`}
                      onClick={() => setSelectedSession(session)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <span className="font-mono text-sm font-medium text-gray-900 bg-gray-100 px-3 py-1 rounded">
                            {session.id.slice(-8)}
                          </span>
                          {isSelected && (
                            <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                              已选中
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <StatusIndicator status={session.status} isLive />
                          <span className={`text-xs px-3 py-1 rounded-full border ${stepColor} font-medium`}>
                            {session.currentStep}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center text-gray-600">
                          <User className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="font-medium">{getUserName(session.userId)}</span>
                          <span className="text-xs text-gray-400 ml-1">({session.userId})</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-2 text-green-500" />
                          <span>{format(new Date(session.lastActivity), 'HH:mm:ss')}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <MessageSquare className="h-4 w-4 mr-2 text-purple-500" />
                          <span>{session.totalMessages} 消息</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Zap className="h-4 w-4 mr-2 text-orange-500" />
                          <span>{session.toolCalls} 工具调用</span>
                        </div>
                      </div>
                      
                      {/* 实时活动指示器 */}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center text-xs text-gray-500">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                          实时监控中
                        </div>
                        <div className="text-xs text-gray-400">
                          Token: {session.tokens} | 响应: {session.responseTime}s
                        </div>
                      </div>
                      
                      {/* 选中会话的额外信息 */}
                      {isSelected && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="text-xs text-blue-700 font-medium mb-1">实时状态详情:</div>
                          <div className="text-xs text-blue-600">
                            • 会话开始时间: {format(new Date(session.startTime), 'HH:mm:ss')}
                            <br />
                            • 持续时间: {Math.round((new Date().getTime() - new Date(session.startTime).getTime()) / 1000)}s
                            <br />
                            • 当前操作: {session.currentStep}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 数字员工聚合视图
  const DigitalEmployeesView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {liveDigitalEmployees.map((employee) => (
          <div 
            key={employee.id}
            className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow ${
              selectedEmployee?.id === employee.id ? 'ring-2 ring-primary-500' : ''
            }`}
            onClick={() => setSelectedEmployee(selectedEmployee?.id === employee.id ? null : employee)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Brain className="h-8 w-8 text-primary-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                  <p className="text-sm text-gray-500">{employee.role}</p>
                </div>
              </div>
              <StatusIndicator status={employee.status} isLive />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{employee.currentSessions}</p>
                <p className="text-xs text-gray-500">当前服务</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{employee.todayTotal}</p>
                <p className="text-xs text-gray-500">今日总数</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">平均响应:</span>
                <span className="font-medium">{employee.avgResponseTime.toFixed(1)}s</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">成功率:</span>
                <span className="font-medium text-green-600">{employee.successRate}%</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-1">
                {employee.capabilities.slice(0, 3).map(cap => (
                  <span key={cap} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{cap}</span>
                ))}
                {employee.capabilities.length > 3 && (
                  <span className="text-xs text-gray-400">+{employee.capabilities.length - 3}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* 增强的选中员工服务列表 - 支持直接跳转到会话 */}
      {selectedEmployee && selectedEmployee.currentSessions > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
            <h4 className="font-semibold flex items-center">
              <Brain className="h-5 w-5 mr-2" />
              {selectedEmployee.name} 正在服务的用户 ({liveHumanEmployees.filter(he => he.currentDigitalEmployee === selectedEmployee.id).length})
            </h4>
            <p className="text-blue-100 text-sm mt-1">点击用户卡片查看实时会话详情</p>
          </div>
          <div className="divide-y divide-gray-200">
            {liveHumanEmployees
              .filter(he => he.currentDigitalEmployee === selectedEmployee.id)
              .map((human) => {
                // 查找对应的实时会话
                const correspondingSession = liveSessions_.find(session => session.userId === human.id);
                
                return (
                  <div 
                    key={human.id} 
                    className="p-4 hover:bg-blue-50 transition-colors cursor-pointer border-l-4 border-transparent hover:border-blue-500"
                    onClick={() => {
                      if (correspondingSession) {
                        setSelectedSession(correspondingSession);
                        // 滚动到会话详情区域
                        document.querySelector('.lg\\:col-span-1')?.scrollIntoView({ 
                          behavior: 'smooth', 
                          block: 'start' 
                        });
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="relative">
                          <User className="h-8 w-8 text-blue-500 bg-blue-100 rounded-full p-1.5" />
                          {human.sessionStatus === 'active' && (
                            <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="font-medium text-gray-900 flex items-center">
                            {human.name}
                            {correspondingSession && (
                              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center">
                                <Activity className="h-3 w-3 mr-1" />
                                活跃会话
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{human.department}</div>
                          {correspondingSession && (
                            <div className="text-xs text-blue-600 mt-1 flex items-center">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              会话 ID: {correspondingSession.id.slice(-8)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-2">
                          <StatusIndicator status={human.sessionStatus} isLive />
                          {correspondingSession && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {correspondingSession.currentStep}
                            </span>
                          )}
                        </div>
                        {human.waitingTime && (
                          <div className="text-xs text-yellow-600 flex items-center">
                            <Timer className="h-3 w-3 mr-1" />
                            等待 {human.waitingTime}s
                          </div>
                        )}
                        {correspondingSession && (
                          <div className="text-xs text-gray-500 mt-1">
                            {correspondingSession.totalMessages}条消息 | {correspondingSession.toolCalls}次工具调用
                          </div>
                        )}
                        {/* 跳转提示 */}
                        <div className="text-xs text-blue-500 mt-1 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          点击查看详情
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
          
          {/* 快速统计 */}
          <div className="bg-gray-50 p-4 border-t">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-blue-600">
                  {liveHumanEmployees.filter(he => he.currentDigitalEmployee === selectedEmployee.id && he.sessionStatus === 'active').length}
                </div>
                <div className="text-xs text-gray-600">活跃会话</div>
              </div>
              <div>
                <div className="text-lg font-bold text-yellow-600">
                  {liveHumanEmployees.filter(he => he.currentDigitalEmployee === selectedEmployee.id && he.sessionStatus === 'waiting').length}
                </div>
                <div className="text-xs text-gray-600">等待中</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-600">
                  {Math.round(liveHumanEmployees
                    .filter(he => he.currentDigitalEmployee === selectedEmployee.id && he.waitingTime)
                    .reduce((acc, he) => acc + (he.waitingTime || 0), 0) / 
                    Math.max(1, liveHumanEmployees.filter(he => he.currentDigitalEmployee === selectedEmployee.id && he.waitingTime).length))}
                </div>
                <div className="text-xs text-gray-600">平均等待(s)</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // 人类员工聚合视图
  const HumanEmployeesView = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 flex items-center">
          <Users className="h-5 w-5 mr-2" />
          活跃的人类员工 ({liveHumanEmployees.filter(he => he.sessionStatus !== 'idle').length})
        </h3>
      </div>
      <div className="divide-y divide-gray-200">
        {liveHumanEmployees
          .filter(employee => employee.sessionStatus !== 'idle')
          .map((employee) => (
          <div key={employee.id} className="p-4 hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <User className="h-6 w-6 text-gray-400 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">{employee.name}</div>
                  <div className="text-sm text-gray-500">{employee.department}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <StatusIndicator status={employee.sessionStatus} isLive />
                  {employee.currentDigitalEmployee && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      服务中: {liveDigitalEmployees.find(de => de.id === employee.currentDigitalEmployee)?.name}
                    </span>
                  )}
                </div>
                {employee.waitingTime && (
                  <div className="text-xs text-yellow-600 mt-1 flex items-center">
                    <Timer className="h-3 w-3 mr-1" />
                    等待 {employee.waitingTime}s
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <PageLayout>
      <PageHeader 
        title="会话查询" 
        subtitle="全方位监控数字员工运行状态和深度会话分析"
      >
        {/* 模式切换器 */}
        <div className="bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('realtime')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'realtime'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Activity className="h-4 w-4 inline mr-2" />
            实时监控
          </button>
          <button
            onClick={() => setViewMode('historical')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'historical'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Eye className="h-4 w-4 inline mr-2" />
            历史查询
          </button>
        </div>
      </PageHeader>

      <PageContent>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：视图选择和内容 */}
        <div className="lg:col-span-2">
          {viewMode === 'realtime' ? (
            <div className="space-y-8">
              {/* 实时模式维度选择 */}
              <Card>
                <CardBody>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700">视图维度:</span>
                    <div className="flex space-x-2">
                      {[
                        { id: 'global-activity', label: '全局活动', icon: Activity },
                        { id: 'digital-employees', label: '数字员工', icon: Brain },
                        { id: 'human-employees', label: '人类员工', icon: Users }
                      ].map(({ id, label, icon: Icon }) => (
                        <button
                          key={id}
                          onClick={() => setRealtimeDimension(id as RealtimeDimension)}
                          className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            realtimeDimension === id
                              ? 'bg-primary-100 text-primary-700'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* 实时监控内容 */}
              <div>
                {realtimeDimension === 'global-activity' && <GlobalActivityView />}
                {realtimeDimension === 'digital-employees' && <DigitalEmployeesView />}
                {realtimeDimension === 'human-employees' && <HumanEmployeesView />}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* 历史查询模式 */}
              <Card>
                <CardBody>
                  <div className="space-y-4">
                    {/* 基础搜索和筛选 */}
                    <div className="flex items-center justify-between gap-4">
                      <FilterSection
                        searchProps={{
                          value: searchQuery,
                          onChange: setSearchQuery,
                          placeholder: "搜索Session ID、用户姓名或关键词"
                        }}
                        filters={[
                          {
                            key: 'status',
                            placeholder: '所有状态',
                            value: statusFilter,
                            onChange: setStatusFilter,
                            showIcon: true,
                            options: [
                              { value: 'success', label: '成功' },
                              { value: 'failed', label: '失败' },
                              { value: 'has_errors', label: '包含错误' }
                            ]
                          }
                        ]}
                        layout="horizontal"
                        showCard={false}
                        className="flex-1"
                      />
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                      >
                        <Filter className="h-4 w-4" />
                        高级筛选
                      </Button>
                    </div>
                  
                    {/* 高级筛选器 */}
                    {showAdvancedFilters && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                        <div>
                          <label className="label">调用工具</label>
                          <select 
                            className="input w-full"
                            value={toolFilter}
                            onChange={(e) => setToolFilter(e.target.value)}
                          >
                            <option value="all">所有工具</option>
                            <option value="query_sales_data">query_sales_data</option>
                            <option value="send_email">send_email</option>
                            <option value="generate_report">generate_report</option>
                          </select>
                        </div>
                        <div>
                          <label className="label">状态</label>
                          <select 
                            className="input w-full"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                          >
                            <option value="all">所有状态</option>
                            <option value="success">成功</option>
                            <option value="failed">失败</option>
                            <option value="has_errors">包含错误</option>
                          </select>
                        </div>
                        <div>
                          <label className="label">Token范围</label>
                          <div className="flex space-x-2">
                            <Input 
                              type="number" 
                              placeholder="最小" 
                              value={minTokens}
                              onChange={(e) => setMinTokens(e.target.value)}
                              className="w-full"
                            />
                            <Input 
                              type="number" 
                              placeholder="最大"
                              value={maxTokens}
                              onChange={(e) => setMaxTokens(e.target.value)}
                              className="w-full"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="label">持续时间(s)</label>
                          <div className="flex space-x-2">
                            <Input 
                              type="number" 
                              placeholder="最小"
                              value={minDuration}
                              onChange={(e) => setMinDuration(e.target.value)}
                              className="w-full"
                            />
                            <Input 
                              type="number" 
                              placeholder="最大"
                              value={maxDuration}
                              onChange={(e) => setMaxDuration(e.target.value)}
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>

              {/* 历史会话列表 */}
              <Card>
                <CardHeader>
                  <h3 className="card-title">历史会话 ({mockSessions.length})</h3>
                </CardHeader>
                <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                  {mockSessions.map((session) => (
                    <div
                      key={session.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedSession?.id === session.id ? 'bg-primary-50 border-l-4 border-primary-500' : ''
                      }`}
                      onClick={() => setSelectedSession(session)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">{session.id}</span>
                        <div className="flex items-center space-x-2">
                          <StatusIndicator status={session.status} />
                          <span className="text-xs text-gray-500">{session.toolCalls}工具</span>
                          <span className="text-xs text-gray-500">{session.tokens}Token</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 grid grid-cols-3 gap-4">
                        <div className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {getUserName(session.userId)}
                          <span className="text-xs text-gray-400 ml-1">({session.userId})</span>
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          {session.totalMessages}条消息
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {session.responseTime}s
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* 右侧：会话详情 */}
        <div className="lg:col-span-1">
          {selectedSession ? (
            <div className="space-y-6">
              {/* 会话概要 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="card-title">会话详情</h3>
                  <div className="flex items-center space-x-2">
                    {'isLive' in selectedSession && selectedSession.isLive && (
                      <span className="flex items-center text-sm text-green-600">
                        <div className="h-2 w-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                        实时监控中
                      </span>
                    )}
                    <StatusIndicator status={selectedSession.status} />
                  </div>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium text-gray-500">会话 ID</p>
                      <p className="text-gray-900 font-mono text-xs">{selectedSession.id}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-500">用户信息</p>
                      <p className="text-gray-900">{getUserName(selectedSession.userId)}</p>
                      <p className="text-xs text-gray-500">ID: {selectedSession.userId}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-500">消息数</p>
                      <p className="text-gray-900">{selectedSession.totalMessages}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-500">响应时间</p>
                      <p className="text-gray-900">{selectedSession.responseTime}s</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-500">Token消耗</p>
                      <p className="text-gray-900">{selectedSession.tokens}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-500">工具调用</p>
                      <p className="text-gray-900">{selectedSession.toolCalls}次</p>
                    </div>
                  </div>
                  
                  {'currentStep' in selectedSession && (
                    <div className="pt-3 border-t border-gray-200">
                      <p className="font-medium text-gray-500">当前状态</p>
                      <p className="text-blue-600 font-medium">{selectedSession.currentStep}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        最后活跃: {format(new Date(selectedSession.lastActivity), 'HH:mm:ss')}
                      </p>
                    </div>
                  )}
                  </div>
                </CardBody>
              </Card>

              {/* 对话流 */}
              <Card>
                <CardHeader>
                  <h4 className="card-title">对话流</h4>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                  {selectedSession.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-sm px-4 py-2 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="text-xs font-medium mb-1 opacity-75">
                          {message.role === 'user' ? '用户' : '数字员工'}
                        </div>
                        <div className="text-sm">{message.content}</div>
                        <div className="text-xs mt-1 opacity-75">
                          {format(new Date(message.timestamp), 'HH:mm:ss')}
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>
                </CardBody>
              </Card>

              {/* 推理过程可视化 - 仅实时会话显示 */}
              {'reasoningSteps' in selectedSession && selectedSession.reasoningSteps.length > 0 && (
                <Card>
                  <CardBody>
                    <ReasoningStepsVisualization steps={selectedSession.reasoningSteps} />
                  </CardBody>
                </Card>
              )}

              {/* 工具调用追溯 */}
              {selectedSession.toolTrace.length > 0 && (
                <Card>
                  <CardHeader>
                    <h4 className="card-title flex items-center">
                      <Layers className="h-5 w-5 mr-2" />
                      工具调用追溯
                    </h4>
                  </CardHeader>
                  <CardBody>
                  <div className="space-y-3">
                    {selectedSession.toolTrace.map((trace) => (
                      <div key={trace.id} className="border border-gray-200 rounded-lg">
                        <button
                          onClick={() => toggleTraceExpanded(trace.id)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                        >
                          <div className="flex items-center">
                            {expandedTraces.has(trace.id) ? 
                              <ChevronDown className="h-4 w-4 mr-2" /> : 
                              <ChevronRight className="h-4 w-4 mr-2" />
                            }
                            <div className={`h-3 w-3 rounded-full mr-3 ${
                              trace.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                            <span className="font-medium">{trace.toolName}</span>
                            <span className="ml-2 text-sm text-gray-500">
                              {trace.responseTime}s
                            </span>
                          </div>
                        </button>
                        {expandedTraces.has(trace.id) && (
                          <div className="px-4 pb-4 space-y-3">
                            <div>
                              <h5 className="font-medium text-gray-700 mb-2">请求参数</h5>
                              <div className="bg-gray-50 p-3 rounded-md">
                                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                                  {JSON.stringify(trace.parameters, null, 2)}
                                </pre>
                              </div>
                            </div>
                            {trace.result && (
                              <div>
                                <h5 className="font-medium text-gray-700 mb-2">返回结果</h5>
                                <div className="bg-green-50 p-3 rounded-md">
                                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                                    {JSON.stringify(trace.result, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            )}
                            {trace.error && (
                              <div>
                                <h5 className="font-medium text-red-700 mb-2">错误信息</h5>
                                <div className="bg-red-50 p-3 rounded-md">
                                  <p className="text-sm text-red-700">{trace.error}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  </CardBody>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardBody className="empty-state">
                <div className="empty-icon">
                  <Eye className="h-16 w-16 text-gray-300 mx-auto" />
                </div>
                <h3 className="empty-title">
                  {viewMode === 'realtime' 
                    ? '选择会话或员工查看实时详情' 
                    : '选择一个会话开始查看'
                  }
                </h3>
                <p className="empty-description">
                  {viewMode === 'realtime' 
                    ? '点击任意会话或员工查看详细的实时状态信息' 
                    : '从左侧列表中选择一个会话来查看详细的执行过程和对话内容'
                  }
                </p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
      </PageContent>
    </PageLayout>
  );
};

export default SessionsEnhanced;