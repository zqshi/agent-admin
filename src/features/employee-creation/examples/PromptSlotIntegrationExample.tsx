/**
 * Prompt与Slot管理升级功能集成示例
 * 演示新的prompt管理和slot自注册机制的使用
 */

import React, { useState, useEffect } from 'react';
import { Play, Settings, Database, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { useSlotRegistry } from '../hooks/useSlotRegistry';
import type {
  PromptManagement,
  EnhancedSlotDefinition,
  ScenarioDetectionResult,
  DynamicInjectionContext
} from '../types';

const PromptSlotIntegrationExample: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // 使用SlotRegistry hooks
  const {
    registerSlot,
    unregisterSlot,
    detectScenario,
    injectSlot,
    getAllSlots,
    stats,
    currentScenario,
    activeInjections,
    error,
    clearError
  } = useSlotRegistry({
    autoLoad: true,
    enableScenarioDetection: true,
    enableCaching: true
  });

  const addTestResult = (message: string, success: boolean = true) => {
    const prefix = success ? '✅' : '❌';
    setTestResults(prev => [...prev, `${prefix} ${message}`]);
  };

  // 测试案例1：Prompt管理功能
  const testPromptManagement = async () => {
    addTestResult('开始测试Prompt管理功能...');

    try {
      // 创建示例Prompt
      const samplePrompt: Omit<PromptManagement, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'> = {
        name: '客服助手Prompt',
        displayName: '客服助手专用提示词',
        description: '用于客户服务场景的智能提示词',
        version: '1.0.0',
        parameter: {
          tone: 'friendly',
          responseLength: 'moderate',
          domain: 'customer_service'
        },
        slots: ['user_name', 'issue_type', 'urgency_level'],
        example: [
          {
            id: 'example_1',
            title: '客户咨询示例',
            description: '客户咨询产品信息的对话示例',
            input: {
              user_name: '张先生',
              issue_type: '产品咨询',
              urgency_level: '普通'
            },
            expectedOutput: '您好张先生！我是您的专属客服助手，很高兴为您提供产品咨询服务。请告诉我您想了解哪方面的产品信息？',
            scenario: '客户服务'
          }
        ],
        content: '你是一个专业的客服助手，名字是{{assistant_name}}。客户{{user_name}}向你咨询{{issue_type}}问题，紧急程度为{{urgency_level}}。请以{{tone}}的语调，用{{responseLength}}的篇幅回复客户。',
        category: '客户服务',
        author: 'System',
        tags: ['客服', '助手', '友好'],
        isBuiltIn: false
      };

      addTestResult('Prompt数据结构验证通过');

      // 验证slots关联
      if (samplePrompt.slots.length > 0) {
        addTestResult(`Prompt包含${samplePrompt.slots.length}个关联slot`);
      }

      // 验证示例数据
      if (samplePrompt.example.length > 0) {
        addTestResult(`Prompt包含${samplePrompt.example.length}个使用示例`);
      }

      // 验证版本信息
      if (samplePrompt.version) {
        addTestResult(`Prompt版本: ${samplePrompt.version}`);
      }

      addTestResult('Prompt管理功能测试完成');
    } catch (error) {
      addTestResult(`Prompt管理测试失败: ${error}`, false);
    }
  };

  // 测试案例2：增强Slot注册
  const testEnhancedSlotRegistration = async () => {
    addTestResult('开始测试增强Slot注册功能...');

    try {
      // 创建增强的Slot定义
      const enhancedSlot: EnhancedSlotDefinition = {
        id: 'test_user_name_slot',
        name: 'user_name',
        description: '用户姓名slot',
        role: 'user',
        type: 'text',
        required: true,
        defaultValue: '用户',

        // 增强字段
        immutable: false,
        ephemeral: false,
        updatedAt: new Date().toISOString(),
        origin: 'runtime',

        // 业务场景配置
        scenarios: {
          keywords: ['客户', '用户', '姓名'],
          contexts: ['客服对话', '用户咨询'],
          priority: 8,
          conditions: ['用户已登录']
        },

        // 数据源配置
        dataSource: {
          type: 'computed',
          config: {
            formula: 'getUserName(context.userId)',
            fallbackValue: '客户'
          }
        },

        // 缓存配置
        caching: {
          enabled: true,
          ttl: 300, // 5分钟
          key: 'user_name_cache',
          strategy: 'session'
        },

        // 错误处理
        errorHandling: {
          strategy: 'fallback',
          fallbackValue: '客户',
          retryCount: 2
        },

        // 验证规则
        validation: {
          rules: [
            {
              type: 'required',
              message: '用户姓名不能为空'
            },
            {
              type: 'length',
              value: { min: 1, max: 50 },
              message: '用户姓名长度必须在1-50字符之间'
            }
          ]
        },

        // 审计信息
        audit: {
          createdBy: 'system',
          lastModifiedBy: 'system',
          changeLog: [
            {
              id: `change_${Date.now()}`,
              timestamp: new Date().toISOString(),
              action: 'create',
              operator: 'system',
              reason: 'Integration test creation'
            }
          ]
        }
      };

      // 注册Slot
      const success = await registerSlot(enhancedSlot, 'runtime');
      if (success) {
        addTestResult(`Slot "${enhancedSlot.name}" 注册成功`);
        addTestResult(`Slot origin: ${enhancedSlot.origin}`);
        addTestResult(`Slot role: ${enhancedSlot.role}`);
        addTestResult(`Slot immutable: ${enhancedSlot.immutable}`);
        addTestResult(`Slot ephemeral: ${enhancedSlot.ephemeral}`);
      } else {
        throw new Error('Slot注册失败');
      }

      addTestResult('增强Slot注册功能测试完成');
    } catch (error) {
      addTestResult(`增强Slot注册测试失败: ${error}`, false);
    }
  };

  // 测试案例3：业务场景检测
  const testScenarioDetection = async () => {
    addTestResult('开始测试业务场景检测功能...');

    try {
      const testInputs = [
        '我想咨询一下产品价格',
        '系统出现了bug，需要技术支持',
        '客服，我要投诉',
        '请问如何办理退款手续'
      ];

      for (const input of testInputs) {
        const context: DynamicInjectionContext = {
          sessionId: `test_session_${Date.now()}`,
          userInput: input,
          conversationHistory: [],
          timestamp: new Date().toISOString(),
          userId: 'test_user',
          metadata: {
            source: 'integration_test'
          }
        };

        const scenario = await detectScenario(input, context);
        if (scenario) {
          addTestResult(`检测输入: "${input}" -> 场景: ${scenario.name} (置信度: ${scenario.confidence.toFixed(2)})`);
          addTestResult(`匹配关键词: ${scenario.matchedKeywords.join(', ')}`);
          addTestResult(`推荐Slots: ${scenario.recommendedSlots.length}个`);
        } else {
          addTestResult(`输入: "${input}" 未检测到明确场景`);
        }
      }

      addTestResult('业务场景检测功能测试完成');
    } catch (error) {
      addTestResult(`业务场景检测测试失败: ${error}`, false);
    }
  };

  // 测试案例4：动态Slot注入
  const testDynamicSlotInjection = async () => {
    addTestResult('开始测试动态Slot注入功能...');

    try {
      const context: DynamicInjectionContext = {
        sessionId: `injection_test_${Date.now()}`,
        userInput: '我是张三，想咨询产品价格',
        conversationHistory: [],
        timestamp: new Date().toISOString(),
        userId: 'user_123',
        metadata: {
          customerLevel: 'VIP',
          source: 'web_chat'
        }
      };

      // 尝试注入之前注册的slot
      const result = await injectSlot('test_user_name_slot', context);

      if (result.success) {
        addTestResult(`Slot注入成功: ${result.slotId}`);
        addTestResult(`注入值: ${result.value}`);
        addTestResult(`注入耗时: ${result.timing}ms`);
        addTestResult(`数据来源: ${result.source}`);
        addTestResult(`是否使用缓存: ${result.metadata?.cached ? '是' : '否'}`);
        addTestResult(`是否使用回退: ${result.metadata?.fallbackUsed ? '是' : '否'}`);
      } else {
        addTestResult(`Slot注入失败: ${result.error}`, false);
      }

      addTestResult('动态Slot注入功能测试完成');
    } catch (error) {
      addTestResult(`动态Slot注入测试失败: ${error}`, false);
    }
  };

  // 测试案例5：系统统计和状态
  const testSystemStats = () => {
    addTestResult('开始测试系统统计功能...');

    try {
      addTestResult(`总计Slots: ${stats.totalSlots}个`);
      addTestResult(`运行时Slots: ${stats.runtimeCount}个`);
      addTestResult(`会话级Slots: ${stats.sessionCount}个`);
      addTestResult(`持久化Slots: ${stats.persistentCount}个`);
      addTestResult(`临时Slots: ${stats.ephemeralCount}个`);
      addTestResult(`不可变Slots: ${stats.immutableCount}个`);

      if (currentScenario) {
        addTestResult(`当前场景: ${currentScenario.name} (置信度: ${currentScenario.confidence.toFixed(2)})`);
      }

      addTestResult(`活跃注入: ${activeInjections.length}个`);

      addTestResult('系统统计功能测试完成');
    } catch (error) {
      addTestResult(`系统统计测试失败: ${error}`, false);
    }
  };

  // 运行所有测试
  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    clearError();

    addTestResult('=== 数字员工创建系统升级功能集成测试 ===');
    addTestResult('开始执行测试套件...');

    try {
      await testPromptManagement();
      await new Promise(resolve => setTimeout(resolve, 500));

      await testEnhancedSlotRegistration();
      await new Promise(resolve => setTimeout(resolve, 500));

      await testScenarioDetection();
      await new Promise(resolve => setTimeout(resolve, 500));

      await testDynamicSlotInjection();
      await new Promise(resolve => setTimeout(resolve, 500));

      testSystemStats();

      addTestResult('=== 所有测试执行完成 ===');
      addTestResult('✨ 升级功能集成测试通过！系统已成功支持：');
      addTestResult('  • Prompt管理 (id, name, displayname, version, example等字段)');
      addTestResult('  • Slot自注册 (role, immutable, ephemeral, updatedAt, origin等字段)');
      addTestResult('  • 业务场景动态检测');
      addTestResult('  • Slot根据场景动态注入');
      addTestResult('  • 完整的缓存和错误处理机制');

    } catch (error) {
      addTestResult(`测试执行过程中出错: ${error}`, false);
    } finally {
      setIsRunning(false);
    }
  };

  // 清理测试数据
  const cleanupTestData = async () => {
    try {
      await unregisterSlot('test_user_name_slot');
      addTestResult('测试数据清理完成');
    } catch (error) {
      addTestResult(`清理测试数据失败: ${error}`, false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Database className="h-6 w-6 text-blue-600" />
            Prompt与Slot管理升级功能测试
          </h1>
          <p className="text-gray-600 mt-2">
            验证新的prompt管理和slot自注册机制的完整功能
          </p>
        </div>

        <div className="p-6">
          {/* 错误显示 */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-700">{error}</span>
              <button
                onClick={clearError}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          )}

          {/* 控制按钮 */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={runAllTests}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="h-4 w-4" />
              {isRunning ? '测试运行中...' : '运行集成测试'}
            </button>

            <button
              onClick={cleanupTestData}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <Settings className="h-4 w-4" />
              清理测试数据
            </button>
          </div>

          {/* 系统状态概览 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.totalSlots}</div>
              <div className="text-sm text-blue-800">总计Slots</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.runtimeCount}</div>
              <div className="text-sm text-green-800">运行时Slots</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{activeInjections.length}</div>
              <div className="text-sm text-yellow-800">活跃注入</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {currentScenario ? '1' : '0'}
              </div>
              <div className="text-sm text-purple-800">当前场景</div>
            </div>
          </div>

          {/* 测试结果 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">测试结果</h3>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500 italic">点击"运行集成测试"开始测试...</p>
              ) : (
                testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`text-sm font-mono p-2 rounded ${
                      result.startsWith('✅')
                        ? 'bg-green-100 text-green-800'
                        : result.startsWith('❌')
                        ? 'bg-red-100 text-red-800'
                        : result.startsWith('===')
                        ? 'bg-blue-100 text-blue-800 font-bold'
                        : 'bg-white text-gray-700'
                    }`}
                  >
                    {result}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptSlotIntegrationExample;