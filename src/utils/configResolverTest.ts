/**
 * 配置解析器测试文件 - 验证新架构功能
 */

import type { DigitalEmployee, DomainConfig } from '../types/employee';
import { resolveEmployeeConfig, validateEmployeeConfig } from './configResolver';

// 创建测试数据
const createTestEmployee = (): DigitalEmployee => ({
  id: 'test-001',
  name: '测试数字员工',
  employeeNumber: 'EMP-001',
  department: '技术部',
  status: 'active',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',

  // 全局配置
  persona: {
    systemPrompt: '你是一个专业的技术助手',
    personality: '专业、友好、准确',
    responsibilities: ['技术咨询', '问题解答']
  },
  permissions: {
    allowedTools: ['search', 'calculator'],
    resourceAccess: [],
    knowledgeManagement: {
      canSelfLearn: true,
      canModifyKnowledge: false
    }
  },
  knowledgeBase: {
    documents: [],
    faqItems: []
  },
  metrics: {
    totalSessions: 0,
    successfulSessions: 0,
    avgResponseTime: 0,
    knowledgeUtilizationRate: 0,
    toolUsageStats: {}
  },

  // 多领域配置
  enableMultiDomain: true,
  multiDomainConfig: {
    enabled: true,
    routingStrategy: 'hybrid',
    maxConcurrentDomains: 3,
    routingConfig: {
      keywordSensitivity: 0.7,
      semanticThreshold: 0.6,
      contextWeight: 0.8
    },
    domains: [
      {
        id: 'frontend',
        name: '前端开发',
        description: '前端技术相关问题',
        icon: '🎨',
        weight: 50,
        enabled: true,
        isDefault: false,
        keywords: ['react', 'vue', 'javascript', 'css'],
        semanticTopics: ['前端框架', 'UI设计', 'Web开发'],
        domainConfig: {
          persona: {
            systemPrompt: '你是一个前端开发专家，擅长React和Vue技术栈'
          },
          permissions: {
            allowedTools: ['search', 'code-formatter', 'browser-tools']
          }
        },
        inheritanceMeta: {
          strategy: 'merge',
          priority: 1,
          inheritFromGlobal: true,
          mergeFields: ['persona', 'permissions']
        }
      },
      {
        id: 'backend',
        name: '后端开发',
        description: '后端技术相关问题',
        icon: '⚙️',
        weight: 50,
        enabled: true,
        isDefault: false,
        keywords: ['node.js', 'python', 'database', 'api'],
        semanticTopics: ['服务端开发', '数据库', 'API设计'],
        domainConfig: {
          persona: {
            systemPrompt: '你是一个后端开发专家，擅长Node.js和数据库设计'
          },
          permissions: {
            allowedTools: ['search', 'database-tools', 'api-testing']
          }
        },
        inheritanceMeta: {
          strategy: 'merge',
          priority: 1,
          inheritFromGlobal: true,
          mergeFields: ['persona', 'permissions']
        }
      }
    ]
  }
});

// 测试函数
export function testConfigResolver() {
  console.log('🧪 开始测试配置解析器...');

  const testEmployee = createTestEmployee();

  // 测试1: 解析全局配置
  console.log('\n📋 测试1: 解析全局配置');
  const globalConfig = resolveEmployeeConfig(testEmployee);
  console.log('✅ 全局配置解析完成');
  console.log('- 系统提示词:', globalConfig.persona.systemPrompt);
  console.log('- 允许工具:', globalConfig.permissions.allowedTools);

  // 测试2: 解析前端领域配置
  console.log('\n🎨 测试2: 解析前端领域配置');
  const frontendConfig = resolveEmployeeConfig(testEmployee, { domainId: 'frontend' });
  console.log('✅ 前端配置解析完成');
  console.log('- 系统提示词:', frontendConfig.persona.systemPrompt);
  console.log('- 允许工具:', frontendConfig.permissions.allowedTools);
  console.log('- 配置来源:', frontendConfig.configSource);

  // 测试3: 解析后端领域配置
  console.log('\n⚙️ 测试3: 解析后端领域配置');
  const backendConfig = resolveEmployeeConfig(testEmployee, { domainId: 'backend' });
  console.log('✅ 后端配置解析完成');
  console.log('- 系统提示词:', backendConfig.persona.systemPrompt);
  console.log('- 允许工具:', backendConfig.permissions.allowedTools);
  console.log('- 配置来源:', backendConfig.configSource);

  // 测试4: 配置验证
  console.log('\n🔍 测试4: 配置验证');
  const validationResult = validateEmployeeConfig(testEmployee, 'frontend');
  console.log('✅ 配置验证完成');
  console.log('- 验证结果:', validationResult.isValid ? '通过' : '失败');
  console.log('- 错误数量:', validationResult.errors.length);
  console.log('- 警告数量:', validationResult.warnings.length);

  console.log('\n🎉 配置解析器测试完成！');

  return {
    globalConfig,
    frontendConfig,
    backendConfig,
    validationResult
  };
}

// 如果直接运行此文件，执行测试
if (typeof window === 'undefined') {
  // Node.js 环境
  console.log('在Node.js环境中运行测试...');
  testConfigResolver();
}