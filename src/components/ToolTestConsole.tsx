import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Play, Square, RotateCcw, Download, Copy, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { MCPTool, TestResult, ToolTestCase } from '../types';

interface ToolTestConsoleProps {
  tool: MCPTool;
  isOpen: boolean;
  onClose: () => void;
}

interface TestExecution {
  id: string;
  testCase: ToolTestCase;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: string;
  endTime?: string;
  result?: TestResult;
  logs: LogEntry[];
}

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  data?: any;
}

const ToolTestConsole: React.FC<ToolTestConsoleProps> = ({ tool, isOpen, onClose }) => {
  const [selectedCapability, setSelectedCapability] = useState(tool.capabilities[0]?.name || '');
  const [testParameters, setTestParameters] = useState('{}');
  const [currentExecution, setCurrentExecution] = useState<TestExecution | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [autoScroll, setAutoScroll] = useState(true);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (autoScroll && logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [currentExecution?.logs, autoScroll]);

  // 初始化参数模板
  useEffect(() => {
    const capability = tool.capabilities.find(cap => cap.name === selectedCapability);
    if (capability?.schema) {
      const sampleParams = generateSampleParameters(capability.schema);
      setTestParameters(JSON.stringify(sampleParams, null, 2));
    }
  }, [selectedCapability, tool.capabilities]);

  // 生成示例参数
  const generateSampleParameters = (schema: any): any => {
    if (!schema.properties) return {};
    
    const params: any = {};
    Object.entries(schema.properties).forEach(([key, prop]: [string, any]) => {
      switch (prop.type) {
        case 'string':
          params[key] = prop.example || prop.default || `示例${key}`;
          break;
        case 'number':
          params[key] = prop.example || prop.default || 42;
          break;
        case 'boolean':
          params[key] = prop.example !== undefined ? prop.example : prop.default !== undefined ? prop.default : true;
          break;
        case 'array':
          params[key] = prop.example || prop.default || [];
          break;
        case 'object':
          params[key] = prop.example || prop.default || {};
          break;
        default:
          params[key] = prop.example || prop.default || null;
      }
    });
    
    return params;
  };

  // 连接测试
  const testConnection = async () => {
    setIsConnecting(true);
    setConnectionStatus('connecting');
    
    try {
      // 模拟连接测试
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (Math.random() > 0.2) { // 80% 成功率
        setConnectionStatus('connected');
        addLog('success', '连接测试成功', { 
          url: tool.config.network?.url || tool.config.stdio?.command,
          protocolVersion: '1.2',
          serverInfo: 'MCP Server v1.0.0'
        });
      } else {
        setConnectionStatus('error');
        addLog('error', '连接失败', { 
          error: '连接超时或服务器不可达' 
        });
      }
    } catch (error) {
      setConnectionStatus('error');
      addLog('error', '连接异常', { error: error instanceof Error ? error.message : String(error) });
    } finally {
      setIsConnecting(false);
    }
  };

  // 添加日志
  const addLog = (level: LogEntry['level'], message: string, data?: any) => {
    if (currentExecution) {
      const newLog: LogEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        data
      };
      
      setCurrentExecution(prev => ({
        ...prev!,
        logs: [...prev!.logs, newLog]
      }));
    }
  };

  // 执行测试
  const executeTest = async () => {
    if (!selectedCapability) {
      alert('请选择要测试的能力');
      return;
    }

    let parameters;
    try {
      parameters = JSON.parse(testParameters);
    } catch (error) {
      alert('参数JSON格式错误');
      return;
    }

    const execution: TestExecution = {
      id: `exec_${Date.now()}`,
      testCase: {
        id: `test_${Date.now()}`,
        name: `${selectedCapability} 测试`,
        description: '手动测试执行',
        toolName: selectedCapability,
        parameters,
        tags: ['manual'],
        createdAt: new Date().toISOString(),
        createdBy: '当前用户'
      },
      status: 'running',
      startTime: new Date().toISOString(),
      logs: []
    };

    setCurrentExecution(execution);
    addLog('info', `开始执行测试: ${selectedCapability}`, { parameters });

    try {
      // 模拟测试执行过程
      addLog('info', '验证输入参数...');
      await new Promise(resolve => setTimeout(resolve, 500));

      addLog('info', '建立MCP连接...');
      await new Promise(resolve => setTimeout(resolve, 800));

      addLog('info', '发送工具调用请求...');
      await new Promise(resolve => setTimeout(resolve, 1200));

      // 模拟不同的测试结果
      const success = Math.random() > 0.3; // 70% 成功率
      
      if (success) {
        const mockResult = {
          id: `result_${Date.now()}`,
          testCaseId: execution.testCase.id,
          toolId: tool.id,
          status: 'passed' as const,
          executedAt: new Date().toISOString(),
          executionTime: 1200 + Math.random() * 1000,
          input: parameters,
          output: generateMockOutput(selectedCapability, parameters),
          logs: execution.logs.map(log => log.message),
          metadata: {
            serverVersion: '1.0.0',
            protocolVersion: '1.2'
          }
        };

        addLog('success', '测试执行成功', { result: mockResult.output });
        
        setCurrentExecution(prev => ({
          ...prev!,
          status: 'completed',
          endTime: new Date().toISOString(),
          result: mockResult
        }));
      } else {
        const errorMessage = '工具执行失败: 参数验证错误';
        addLog('error', errorMessage);
        
        setCurrentExecution(prev => ({
          ...prev!,
          status: 'failed',
          endTime: new Date().toISOString(),
          result: {
            id: `result_${Date.now()}`,
            testCaseId: execution.testCase.id,
            toolId: tool.id,
            status: 'failed',
            executedAt: new Date().toISOString(),
            executionTime: 800,
            input: parameters,
            error: errorMessage,
            logs: execution.logs.map(log => log.message)
          }
        }));
      }
    } catch (error) {
      addLog('error', '测试执行异常', { error: error instanceof Error ? error.message : String(error) });
      setCurrentExecution(prev => ({
        ...prev!,
        status: 'failed',
        endTime: new Date().toISOString()
      }));
    }
  };

  // 生成模拟输出
  const generateMockOutput = (capabilityName: string, params: any) => {
    switch (capabilityName) {
      case 'get_current_weather':
        return {
          city: params.city || '北京',
          temperature: 25,
          weather: 'sunny',
          humidity: 60,
          windSpeed: 5,
          timestamp: new Date().toISOString()
        };
      case 'query_customer_info':
        return {
          customerId: params.customer_id || 'CUST_001',
          name: '张三',
          email: 'zhangsan@example.com',
          phone: '13800138000',
          registeredAt: '2023-01-15T08:00:00Z'
        };
      case 'send_email':
        return {
          messageId: 'msg_' + Date.now(),
          status: 'sent',
          recipients: params.to || ['test@example.com'],
          sentAt: new Date().toISOString()
        };
      default:
        return {
          success: true,
          message: '操作执行成功',
          timestamp: new Date().toISOString(),
          data: params
        };
    }
  };

  // 取消测试
  const cancelTest = () => {
    if (currentExecution?.status === 'running') {
      addLog('warn', '测试被用户取消');
      setCurrentExecution(prev => ({
        ...prev!,
        status: 'cancelled',
        endTime: new Date().toISOString()
      }));
    }
  };

  // 清空日志
  const clearLogs = () => {
    setCurrentExecution(null);
  };

  // 复制日志
  const copyLogs = () => {
    if (currentExecution) {
      const logsText = currentExecution.logs
        .map(log => `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}`)
        .join('\n');
      navigator.clipboard.writeText(logsText);
    }
  };

  // 下载日志
  const downloadLogs = () => {
    if (currentExecution) {
      const logsText = currentExecution.logs
        .map(log => `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}`)
        .join('\n');
      const blob = new Blob([logsText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `test-logs-${tool.name}-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // 获取状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'cancelled':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  // 获取日志级别颜色
  const getLogLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'warn':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay">
      <div className="modal max-w-6xl h-[90vh] flex flex-col">
        {/* 头部 */}
        <div className="modal-header">
          <div>
            <h3 className="modal-title">
              测试控制台 - {tool.displayName}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              工具能力测试与调试环境
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* 左侧控制面板 */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            {/* 连接状态 */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">连接状态</h4>
                <div className={`flex items-center gap-2 text-sm ${
                  connectionStatus === 'connected' ? 'text-green-600' :
                  connectionStatus === 'connecting' ? 'text-blue-600' :
                  connectionStatus === 'error' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    connectionStatus === 'connected' ? 'bg-green-500' :
                    connectionStatus === 'connecting' ? 'bg-blue-500 animate-pulse' :
                    connectionStatus === 'error' ? 'bg-red-500' : 'bg-gray-300'
                  }`}></div>
                  {connectionStatus === 'connected' ? '已连接' :
                   connectionStatus === 'connecting' ? '连接中' :
                   connectionStatus === 'error' ? '连接失败' : '未连接'}
                </div>
              </div>
              <button
                onClick={testConnection}
                disabled={isConnecting}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConnecting ? '测试中...' : '测试连接'}
              </button>
            </div>

            {/* 能力选择 */}
            <div className="p-4 border-b border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">选择能力</h4>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={selectedCapability}
                onChange={(e) => setSelectedCapability(e.target.value)}
              >
                {tool.capabilities.map(cap => (
                  <option key={cap.name} value={cap.name}>
                    {cap.name} ({cap.type})
                  </option>
                ))}
              </select>
              
              {selectedCapability && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm">
                    <div className="font-medium">
                      {tool.capabilities.find(cap => cap.name === selectedCapability)?.description}
                    </div>
                    <div className="text-gray-500 mt-1">
                      类型: {tool.capabilities.find(cap => cap.name === selectedCapability)?.type}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 参数配置 */}
            <div className="flex-1 p-4 flex flex-col">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-900">测试参数</h4>
                <button
                  onClick={() => {
                    const capability = tool.capabilities.find(cap => cap.name === selectedCapability);
                    if (capability?.schema) {
                      const sampleParams = generateSampleParameters(capability.schema);
                      setTestParameters(JSON.stringify(sampleParams, null, 2));
                    }
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  <RotateCcw className="h-3 w-3 inline mr-1" />
                  重置
                </button>
              </div>
              <textarea
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                value={testParameters}
                onChange={(e) => setTestParameters(e.target.value)}
                placeholder="输入JSON格式的测试参数..."
              />
              
              <div className="flex gap-2 mt-4">
                <button
                  onClick={executeTest}
                  disabled={!selectedCapability || (currentExecution?.status === 'running')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="h-4 w-4" />
                  执行测试
                </button>
                
                {currentExecution?.status === 'running' && (
                  <button
                    onClick={cancelTest}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <Square className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 右侧日志面板 */}
          <div className="flex-1 flex flex-col">
            {/* 日志头部 */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h4 className="font-medium text-gray-900">执行日志</h4>
                {currentExecution && (
                  <div className="flex items-center gap-2">
                    {getStatusIcon(currentExecution.status)}
                    <span className="text-sm text-gray-500">
                      {currentExecution.status === 'running' ? '执行中' :
                       currentExecution.status === 'completed' ? '执行完成' :
                       currentExecution.status === 'failed' ? '执行失败' : '已取消'}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={autoScroll}
                    onChange={(e) => setAutoScroll(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  自动滚动
                </label>
                <button
                  onClick={copyLogs}
                  disabled={!currentExecution}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  title="复制日志"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  onClick={downloadLogs}
                  disabled={!currentExecution}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  title="下载日志"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={clearLogs}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title="清空日志"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* 日志内容 */}
            <div 
              ref={logsContainerRef}
              className="flex-1 p-4 overflow-y-auto bg-gray-900 text-green-400 font-mono text-sm"
            >
              {!currentExecution ? (
                <div className="text-center text-gray-500 mt-8">
                  <div className="text-4xl mb-4">🧪</div>
                  <p>选择能力并执行测试以查看日志</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {currentExecution.logs.map((log, index) => (
                    <div key={index} className="flex">
                      <span className="text-gray-500 mr-3">
                        [{new Date(log.timestamp).toLocaleTimeString()}]
                      </span>
                      <span className={`mr-2 font-bold ${getLogLevelColor(log.level)}`}>
                        {log.level.toUpperCase()}:
                      </span>
                      <span className="text-gray-100">{log.message}</span>
                      {log.data && (
                        <details className="ml-4 text-gray-400">
                          <summary className="cursor-pointer">详情</summary>
                          <pre className="mt-1 text-xs">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                  
                  {/* 测试结果 */}
                  {currentExecution.result && (
                    <div className="mt-4 p-4 border border-gray-600 rounded">
                      <div className="text-yellow-400 font-bold mb-2">
                        === 测试结果 ===
                      </div>
                      <div className="text-gray-300">
                        <div>状态: <span className={currentExecution.result.status === 'passed' ? 'text-green-400' : 'text-red-400'}>
                          {currentExecution.result.status === 'passed' ? '通过' : '失败'}
                        </span></div>
                        <div>执行时间: {currentExecution.result.executionTime}ms</div>
                        {currentExecution.result.output && (
                          <div>
                            <div className="mt-2">输出结果:</div>
                            <pre className="mt-1 p-2 bg-gray-800 rounded text-xs overflow-x-auto">
                              {JSON.stringify(currentExecution.result.output, null, 2)}
                            </pre>
                          </div>
                        )}
                        {currentExecution.result.error && (
                          <div>
                            <div className="mt-2 text-red-400">错误信息:</div>
                            <div className="mt-1 p-2 bg-red-900 text-red-200 rounded text-xs">
                              {currentExecution.result.error}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ToolTestConsole;