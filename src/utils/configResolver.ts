/**
 * 配置解析工具 - 处理全局配置与领域配置的合并
 */

import type {
  DigitalEmployee,
  DomainConfig,
  DomainSpecificConfig,
  ResolvedEmployeeConfig,
  ConfigInheritanceStrategy,
  ConfigResolverOptions,
  ConfigValidationResult,
  DeepPartial
} from '../types/employee';

/**
 * 深度合并两个对象
 */
function deepMerge<T>(target: T, source: DeepPartial<T>): T {
  const result = { ...target };

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (sourceValue !== null && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
        if (targetValue && typeof targetValue === 'object' && !Array.isArray(targetValue)) {
          result[key] = deepMerge(targetValue, sourceValue) as any;
        } else {
          result[key] = sourceValue as any;
        }
      } else {
        result[key] = sourceValue as any;
      }
    }
  }

  return result;
}

/**
 * 数组合并策略
 */
function mergeArrays<T>(globalArray: T[], domainArray: T[], strategy: 'append' | 'prepend' | 'replace' = 'append'): T[] {
  switch (strategy) {
    case 'prepend':
      return [...domainArray, ...globalArray];
    case 'replace':
      return domainArray.length > 0 ? domainArray : globalArray;
    case 'append':
    default:
      return [...globalArray, ...domainArray];
  }
}

/**
 * 解析员工配置 - 合并全局配置和领域专属配置
 */
export function resolveEmployeeConfig(
  employee: DigitalEmployee,
  options: ConfigResolverOptions = {}
): ResolvedEmployeeConfig {
  const { domainId, strategy = 'merge' } = options;

  // 基础全局配置
  const globalConfig = {
    persona: employee.persona,
    promptConfig: employee.promptConfig,
    permissions: employee.permissions,
    mentorConfig: employee.mentorConfig,
    knowledgeBase: employee.knowledgeBase,
    coreFeatures: employee.coreFeatures
  };

  let resolvedConfig = { ...globalConfig };
  const configSource = {
    global: Object.keys(globalConfig),
    domain: [] as string[],
    merged: [] as string[]
  };

  // 如果指定了领域ID且启用多领域，则进行配置合并
  if (domainId && employee.enableMultiDomain && employee.multiDomainConfig) {
    const domain = employee.multiDomainConfig.domains.find(d => d.id === domainId);

    if (domain && domain.enabled && domain.domainConfig) {
      const domainSpecificConfig = domain.domainConfig;
      const inheritanceStrategy = domain.inheritanceMeta?.strategy || strategy;

      // 根据继承策略合并配置
      switch (inheritanceStrategy) {
        case 'override':
          // 完全覆盖策略
          resolvedConfig = overrideConfig(globalConfig, domainSpecificConfig);
          configSource.domain = Object.keys(domainSpecificConfig);
          break;

        case 'extend':
          // 扩展策略 - 数组类型字段进行合并，对象类型字段进行深度合并
          resolvedConfig = extendConfig(globalConfig, domainSpecificConfig);
          configSource.merged = Object.keys(domainSpecificConfig);
          break;

        case 'merge':
        default:
          // 合并策略 - 深度合并所有配置
          resolvedConfig = mergeConfigs(globalConfig, domainSpecificConfig);
          configSource.merged = Object.keys(domainSpecificConfig);
          break;
      }
    }
  }

  return {
    ...resolvedConfig,
    configSource,
    appliedDomainId: domainId
  };
}

/**
 * 覆盖策略 - 领域配置完全覆盖全局配置
 */
function overrideConfig(
  globalConfig: any,
  domainConfig: DomainSpecificConfig
): any {
  const result = { ...globalConfig };

  // 直接用领域配置覆盖对应字段
  Object.keys(domainConfig).forEach(key => {
    if (domainConfig[key as keyof DomainSpecificConfig] !== undefined) {
      result[key] = domainConfig[key as keyof DomainSpecificConfig];
    }
  });

  return result;
}

/**
 * 扩展策略 - 智能合并，数组扩展，对象深度合并
 */
function extendConfig(
  globalConfig: any,
  domainConfig: DomainSpecificConfig
): any {
  const result = { ...globalConfig };

  Object.keys(domainConfig).forEach(key => {
    const domainValue = domainConfig[key as keyof DomainSpecificConfig];
    const globalValue = result[key];

    if (domainValue !== undefined) {
      if (Array.isArray(globalValue) && Array.isArray(domainValue)) {
        // 数组类型：扩展
        result[key] = mergeArrays(globalValue, domainValue, 'append');
      } else if (typeof globalValue === 'object' && typeof domainValue === 'object') {
        // 对象类型：深度合并
        result[key] = deepMerge(globalValue, domainValue);
      } else {
        // 基础类型：覆盖
        result[key] = domainValue;
      }
    }
  });

  return result;
}

/**
 * 合并策略 - 深度合并所有配置
 */
function mergeConfigs(
  globalConfig: any,
  domainConfig: DomainSpecificConfig
): any {
  return deepMerge(globalConfig, domainConfig);
}

/**
 * 验证配置的有效性
 */
export function validateEmployeeConfig(
  employee: DigitalEmployee,
  domainId?: string
): ConfigValidationResult {
  const errors: any[] = [];
  const warnings: any[] = [];

  // 验证基础配置
  if (!employee.persona?.systemPrompt) {
    errors.push({
      field: 'persona.systemPrompt',
      message: '系统提示词不能为空',
      severity: 'error'
    });
  }

  if (!employee.permissions?.allowedTools || employee.permissions.allowedTools.length === 0) {
    warnings.push({
      field: 'permissions.allowedTools',
      message: '未配置任何允许的工具',
      suggestion: '至少配置一个基础工具以确保员工能正常工作'
    });
  }

  // 如果指定了领域，验证领域配置
  if (domainId && employee.multiDomainConfig) {
    const domain = employee.multiDomainConfig.domains.find(d => d.id === domainId);

    if (!domain) {
      errors.push({
        field: 'multiDomainConfig.domains',
        message: `指定的领域 ${domainId} 不存在`,
        severity: 'error'
      });
    } else if (!domain.enabled) {
      warnings.push({
        field: 'multiDomainConfig.domains',
        message: `领域 ${domain.name} 已被禁用`,
        suggestion: '启用该领域或选择其他活跃领域'
      });
    }
  }

  // 验证多领域配置的一致性
  if (employee.enableMultiDomain && employee.multiDomainConfig) {
    const totalWeight = employee.multiDomainConfig.domains
      .filter(d => d.enabled)
      .reduce((sum, d) => sum + d.weight, 0);

    if (totalWeight !== 100) {
      warnings.push({
        field: 'multiDomainConfig.domains',
        message: `启用领域的权重总和为 ${totalWeight}%，建议调整为 100%`,
        suggestion: '调整各领域权重以确保路由准确性'
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * 获取配置字段的来源信息
 */
export function getConfigFieldSource(
  employee: DigitalEmployee,
  fieldPath: string,
  domainId?: string
): 'global' | 'domain' | 'merged' | 'unknown' {
  if (!domainId || !employee.enableMultiDomain) {
    return 'global';
  }

  const domain = employee.multiDomainConfig?.domains.find(d => d.id === domainId);
  if (!domain || !domain.domainConfig) {
    return 'global';
  }

  // 简化的字段路径检查
  const fieldParts = fieldPath.split('.');
  const topLevelField = fieldParts[0];

  if (domain.domainConfig[topLevelField as keyof DomainSpecificConfig] !== undefined) {
    const inheritanceStrategy = domain.inheritanceMeta?.strategy || 'merge';
    return inheritanceStrategy === 'merge' ? 'merged' : 'domain';
  }

  return 'global';
}

/**
 * 创建领域配置模板
 */
export function createDomainConfigTemplate(
  baseEmployee: DigitalEmployee,
  domainName: string
): DomainConfig {
  return {
    id: `domain_${Date.now()}`,
    name: domainName,
    description: `${domainName}领域的专属配置`,
    icon: '🔧',
    weight: 0,
    enabled: true,
    isDefault: false,
    keywords: [],
    semanticTopics: [],
    domainConfig: {
      // 初始化空的领域配置，可根据需要添加特定配置
      persona: {},
      permissions: {},
      customConfig: {}
    },
    inheritanceMeta: {
      strategy: 'merge',
      priority: 1,
      inheritFromGlobal: true,
      overrideFields: [],
      mergeFields: ['persona', 'permissions', 'knowledgeBase']
    }
  };
}