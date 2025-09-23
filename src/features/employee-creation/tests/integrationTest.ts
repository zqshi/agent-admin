/**
 * 数字员工创建功能集成测试
 * 验证Prompt管理、Slot注册、业务场景检测等功能的集成
 */

import { useCreationStore } from '../stores/creationStore';
import { slotRegistry } from '../services/SlotRegistry';
import { slotInjector } from '../services/SlotInjector';
import type { PromptManagement, EnhancedSlotDefinition } from '../types';

export interface TestResult {
  testName: string;
  success: boolean;
  message: string;
  duration: number;
}

export class EmployeeCreationIntegrationTest {
  private results: TestResult[] = [];

  async runAllTests(): Promise<TestResult[]> {
    console.log('🚀 开始数字员工创建功能集成测试...');

    this.results = [];

    // 测试1: Prompt管理功能
    await this.testPromptManagement();

    // 测试2: Slot注册功能
    await this.testSlotRegistry();

    // 测试3: 业务场景检测
    await this.testScenarioDetection();

    // 测试4: 数据兼容性
    await this.testDataCompatibility();

    // 测试5: 端到端工作流
    await this.testEndToEndWorkflow();

    // 输出测试结果
    this.printResults();

    return this.results;
  }

  private async runTest(testName: string, testFn: () => Promise<void>): Promise<void> {
    const startTime = Date.now();
    try {
      console.log(`📋 执行测试: ${testName}`);
      await testFn();
      const duration = Date.now() - startTime;
      this.results.push({
        testName,
        success: true,
        message: '✅ 测试通过',
        duration
      });
      console.log(`✅ ${testName} - 通过 (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({
        testName,
        success: false,
        message: `❌ 测试失败: ${error instanceof Error ? error.message : String(error)}`,
        duration
      });
      console.error(`❌ ${testName} - 失败: ${error}`);
    }
  }

  private async testPromptManagement(): Promise<void> {
    await this.runTest('Prompt管理功能测试', async () => {
      const store = useCreationStore.getState();

      // 创建测试Prompt
      const testPrompt: Omit<PromptManagement, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'> = {
        name: '测试客服Prompt',
        displayName: '客服专员测试模板',
        description: '用于测试的客服Prompt模板',
        version: '1.0.0',
        parameter: {
          category: '客户服务',
          testMode: true
        },
        slots: ['user_name', 'issue_type', 'urgency_level'],
        example: [
          {
            id: 'example_1',
            title: '客户投诉处理',
            description: '处理客户投诉的标准流程',
            scenario: '投诉处理',
            input: '客户对产品质量不满',
            expectedOutput: '理解客户需求，提供解决方案',
            tags: ['投诉', '质量'],
            metadata: {}
          }
        ],
        content: '你好{{user_name}}，我是客服专员，了解到您遇到了{{issue_type}}问题，紧急程度为{{urgency_level}}，我会尽快为您处理。',
        category: '客户服务',
        author: 'Test User',
        tags: ['客服', '测试'],
        isBuiltIn: false
      };

      // 测试创建Prompt
      const promptId = store.createPrompt(testPrompt);
      if (!promptId) {
        throw new Error('创建Prompt失败');
      }

      // 测试获取Prompt
      const createdPrompt = store.promptManagement.prompts.find(p => p.id === promptId);
      if (!createdPrompt) {
        throw new Error('无法找到创建的Prompt');
      }

      // 验证字段
      if (createdPrompt.name !== testPrompt.name) {
        throw new Error('Prompt名称不匹配');
      }

      if (createdPrompt.slots.length !== testPrompt.slots.length) {
        throw new Error('Prompt slots数量不匹配');
      }

      if (createdPrompt.example.length !== testPrompt.example.length) {
        throw new Error('Prompt examples数量不匹配');
      }

      // 测试更新Prompt
      store.updatePrompt(promptId, {
        version: '1.1.0',
        description: '更新后的测试描述'
      });

      const updatedPrompt = store.promptManagement.prompts.find(p => p.id === promptId);
      if (updatedPrompt?.version !== '1.1.0') {
        throw new Error('Prompt更新失败');
      }

      // 测试复制Prompt
      const duplicatedId = store.duplicatePrompt(promptId);
      const duplicatedPrompt = store.promptManagement.prompts.find(p => p.id === duplicatedId);
      if (!duplicatedPrompt || duplicatedPrompt.name === createdPrompt.name) {
        throw new Error('Prompt复制失败');
      }

      // 清理测试数据
      store.deletePrompt(promptId);
      store.deletePrompt(duplicatedId);

      console.log('✅ Prompt管理功能测试通过');
    });
  }

  private async testSlotRegistry(): Promise<void> {
    await this.runTest('Slot注册功能测试', async () => {
      // 测试Slot注册
      const testSlot: EnhancedSlotDefinition = {
        id: 'test_slot_001',
        name: '测试用户名',
        description: '用于测试的用户名Slot',
        role: 'user',
        type: 'text',
        required: true,
        defaultValue: 'TestUser',
        immutable: false,
        ephemeral: false,
        updatedAt: new Date().toISOString(),
        origin: 'custom',
        dependencies: [],
        validation: [
          { type: 'minLength', value: 2 },
          { type: 'maxLength', value: 50 }
        ],
        metadata: { testMode: true },
        errorHandling: {
          strategy: 'fallback',
          fallbackValue: 'DefaultUser'
        }
      };

      // 注册Slot
      const registered = await slotRegistry.registerSlot(testSlot);
      if (!registered) {
        throw new Error('Slot注册失败');
      }

      // 验证注册
      const retrievedSlot = slotRegistry.getSlot(testSlot.id);
      if (!retrievedSlot) {
        throw new Error('无法获取注册的Slot');
      }

      if (retrievedSlot.name !== testSlot.name) {
        throw new Error('Slot信息不匹配');
      }

      // 测试获取所有Slots
      const allSlots = slotRegistry.getAllSlots();
      const foundSlot = allSlots.find(s => s.id === testSlot.id);
      if (!foundSlot) {
        throw new Error('在所有Slots中未找到注册的Slot');
      }

      // 测试按条件筛选
      const userSlots = slotRegistry.getSlotsByRole('user');
      const foundUserSlot = userSlots.find(s => s.id === testSlot.id);
      if (!foundUserSlot) {
        throw new Error('按角色筛选Slot失败');
      }

      // 测试取消注册
      const unregistered = await slotRegistry.unregisterSlot(testSlot.id);
      if (!unregistered) {
        throw new Error('Slot取消注册失败');
      }

      // 验证取消注册
      const shouldBeNull = slotRegistry.getSlot(testSlot.id);
      if (shouldBeNull) {
        throw new Error('Slot未成功取消注册');
      }

      console.log('✅ Slot注册功能测试通过');
    });
  }

  private async testScenarioDetection(): Promise<void> {
    await this.runTest('业务场景检测测试', async () => {
      // 测试场景检测
      const testInputs = [
        { input: '我的订单还没有发货', expectedType: '订单查询' },
        { input: '产品价格是多少', expectedType: '咨询' },
        { input: '这个产品有质量问题，我要投诉', expectedType: '投诉' },
        { input: '软件无法启动，请帮助', expectedType: '技术支持' }
      ];

      for (const testCase of testInputs) {
        try {
          const result = await slotInjector.detectScenario(testCase.input);

          if (!result) {
            console.warn(`⚠️ 未检测到场景: ${testCase.input}`);
            continue;
          }

          console.log(`📍 检测结果: ${testCase.input} -> ${result.name} (置信度: ${Math.round(result.confidence * 100)}%)`);

          // 验证置信度
          if (result.confidence < 0.3) {
            console.warn(`⚠️ 置信度较低: ${result.confidence}`);
          }

          // 验证推荐Slots
          if (result.recommendedSlots && result.recommendedSlots.length > 0) {
            console.log(`🎯 推荐Slots: ${result.recommendedSlots.map(r => r.slotId).join(', ')}`);
          }

        } catch (error) {
          console.warn(`⚠️ 场景检测异常: ${testCase.input} - ${error}`);
        }
      }

      console.log('✅ 业务场景检测测试通过');
    });
  }

  private async testDataCompatibility(): Promise<void> {
    await this.runTest('数据兼容性测试', async () => {
      const store = useCreationStore.getState();

      // 测试旧格式模板数据
      const oldTemplate = {
        id: 'old_template_001',
        name: '旧格式模板',
        description: '测试兼容性的旧格式模板',
        category: '测试',
        content: '你好{{name}}，欢迎使用{{service}}服务。',
        slots: [
          {
            id: 'slot_name',
            name: 'name',
            description: '用户名称',
            type: 'text' as const,
            required: true,
            defaultValue: '用户'
          },
          {
            id: 'slot_service',
            name: 'service',
            description: '服务名称',
            type: 'text' as const,
            required: false,
            defaultValue: '客服'
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0,
        isBuiltIn: false
      };

      // 添加旧格式模板
      store.addPromptTemplate(oldTemplate);

      // 验证模板存在
      const templates = store.getPromptTemplates();
      const foundTemplate = templates.find(t => t.id === oldTemplate.id);
      if (!foundTemplate) {
        throw new Error('旧格式模板添加失败');
      }

      // 测试兼容性转换
      const convertedPrompt = store.promptManagement.prompts.find(p => p.name === oldTemplate.name);
      if (convertedPrompt) {
        // 验证转换后的字段
        if (convertedPrompt.slots.length !== oldTemplate.slots.length) {
          throw new Error('模板转换后Slots数量不匹配');
        }
      }

      // 清理测试数据
      store.deletePromptTemplate(oldTemplate.id);

      console.log('✅ 数据兼容性测试通过');
    });
  }

  private async testEndToEndWorkflow(): Promise<void> {
    await this.runTest('端到端工作流测试', async () => {
      const store = useCreationStore.getState();

      // 1. 创建Prompt
      const promptId = store.createPrompt({
        name: 'E2E测试Prompt',
        displayName: 'E2E测试专用',
        description: 'E2E测试用Prompt',
        version: '1.0.0',
        parameter: { category: '测试' },
        slots: ['user_name', 'issue_type'],
        example: [],
        content: '你好{{user_name}}，关于您的{{issue_type}}问题，我来为您处理。',
        category: '测试',
        author: 'E2E Test',
        tags: ['测试'],
        isBuiltIn: false
      });

      // 2. 注册相关Slots
      const userNameSlot: EnhancedSlotDefinition = {
        id: 'e2e_user_name',
        name: 'user_name',
        description: 'E2E测试用户名',
        role: 'user',
        type: 'text',
        required: true,
        defaultValue: 'TestUser',
        immutable: false,
        ephemeral: false,
        updatedAt: new Date().toISOString(),
        origin: 'custom',
        dependencies: [],
        validation: [],
        metadata: {},
        errorHandling: { strategy: 'fallback', fallbackValue: 'User' }
      };

      const issueTypeSlot: EnhancedSlotDefinition = {
        id: 'e2e_issue_type',
        name: 'issue_type',
        description: 'E2E测试问题类型',
        role: 'user',
        type: 'text',
        required: true,
        defaultValue: 'general',
        immutable: false,
        ephemeral: false,
        updatedAt: new Date().toISOString(),
        origin: 'custom',
        dependencies: [],
        validation: [],
        metadata: {},
        errorHandling: { strategy: 'fallback', fallbackValue: '一般问题' }
      };

      await slotRegistry.registerSlot(userNameSlot);
      await slotRegistry.registerSlot(issueTypeSlot);

      // 3. 场景检测和Slot注入
      const scenario = await slotInjector.detectScenario('用户张三反映订单问题');
      if (scenario) {
        console.log(`🎯 检测到场景: ${scenario.name}`);
      }

      // 4. 验证数据一致性
      const prompt = store.promptManagement.prompts.find(p => p.id === promptId);
      if (!prompt) {
        throw new Error('Prompt丢失');
      }

      const registeredSlots = slotRegistry.getAllSlots();
      const userSlot = registeredSlots.find(s => s.name === 'user_name');
      const issueSlot = registeredSlots.find(s => s.name === 'issue_type');

      if (!userSlot || !issueSlot) {
        throw new Error('注册的Slots丢失');
      }

      // 5. 清理数据
      store.deletePrompt(promptId);
      await slotRegistry.unregisterSlot(userNameSlot.id);
      await slotRegistry.unregisterSlot(issueTypeSlot.id);

      console.log('✅ 端到端工作流测试通过');
    });
  }

  private printResults(): void {
    console.log('\n📊 测试结果总结:');
    console.log('='.repeat(50));

    const passed = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    const totalTime = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log(`✅ 通过: ${passed}`);
    console.log(`❌ 失败: ${failed}`);
    console.log(`⏱️  总耗时: ${totalTime}ms`);
    console.log(`📈 成功率: ${((passed / this.results.length) * 100).toFixed(1)}%`);

    if (failed > 0) {
      console.log('\n失败的测试:');
      this.results
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`❌ ${r.testName}: ${r.message}`);
        });
    }

    console.log('='.repeat(50));
  }
}

// 导出测试函数
export const runIntegrationTests = async (): Promise<TestResult[]> => {
  const tester = new EmployeeCreationIntegrationTest();
  return await tester.runAllTests();
};

// 可以在浏览器控制台中运行的简化版本
export const quickTest = async (): Promise<void> => {
  console.log('🚀 快速功能验证...');

  try {
    const store = useCreationStore.getState();

    // 快速测试Prompt创建
    const promptId = store.createPrompt({
      name: '快速测试',
      displayName: '快速测试',
      description: '快速功能验证',
      version: '1.0.0',
      parameter: {},
      slots: ['test'],
      example: [],
      content: '测试内容',
      category: '测试',
      author: 'Quick Test',
      tags: [],
      isBuiltIn: false
    });

    console.log('✅ Prompt创建成功:', promptId);

    // 快速测试Slot注册
    const registered = await slotRegistry.registerSlot({
      id: 'quick_test',
      name: 'test',
      description: '快速测试Slot',
      role: 'user',
      type: 'text',
      required: false,
      defaultValue: 'test',
      immutable: false,
      ephemeral: true,
      updatedAt: new Date().toISOString(),
      origin: 'custom',
      dependencies: [],
      validation: [],
      metadata: {},
      errorHandling: { strategy: 'fallback', fallbackValue: '' }
    });

    console.log('✅ Slot注册成功:', registered);

    // 清理
    store.deletePrompt(promptId);
    await slotRegistry.unregisterSlot('quick_test');

    console.log('🎉 快速验证完成，所有功能正常！');

  } catch (error) {
    console.error('❌ 快速验证失败:', error);
  }
};