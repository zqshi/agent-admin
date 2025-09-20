/**
 * 配置生成器
 * 基于意图分析和需求分析生成数字员工配置
 */

import type {
  IntentAnalysis,
  ConfigRequirements,
  GeneratedConfig,
  ConfigSuggestion,
  ConfigAlternative,
  ValidationResult
} from '../types';
import type { CreateDigitalEmployeeForm, PromptEngineeringConfig } from '../../../types';

export class ConfigGenerator {
  private industryTemplates = new Map([
    ['客户服务部', {
      systemPrompt: '您是一位专业的客户服务代表，专门为客户提供优质的服务体验。您需要以友好、耐心、专业的态度解答客户问题，处理客户投诉，并确保客户满意。请始终保持礼貌和同理心。',
      personality: '友好、耐心、专业、细心',
      defaultTools: ['order_query', 'customer_info', 'faq_search'],
      tone: 'friendly' as const
    }],
    ['技术支持部', {
      systemPrompt: '您是一位技术支持专家，拥有深厚的技术知识和丰富的故障排除经验。您需要快速诊断技术问题，提供准确的解决方案，并协助用户解决各种技术难题。请保持专业和耐心。',
      personality: '专业、严谨、耐心、高效',
      defaultTools: ['tech_diagnosis', 'solution_search', 'faq_search'],
      tone: 'professional' as const
    }],
    ['销售部', {
      systemPrompt: '您是一位专业的销售顾问，具备深入的产品知识和优秀的沟通技巧。您需要了解客户需求，推荐合适的产品方案，提供准确的报价，并促成交易。请保持热情和专业。',
      personality: '热情、专业、积极、可靠',
      defaultTools: ['product_catalog', 'pricing_calc', 'crm_access'],
      tone: 'professional' as const
    }],
    ['人力资源部', {
      systemPrompt: '您是一位人力资源专员，负责员工服务、政策解答和招聘支持。您需要以亲和、专业的态度处理员工咨询，协助招聘流程，并确保企业政策的有效执行。',
      personality: '友好、专业、负责、细心',
      defaultTools: ['crm_access', 'faq_search', 'file_management'],
      tone: 'friendly' as const
    }],
    ['产品部', {
      systemPrompt: '您是一位产品经理助手，负责需求分析、功能设计和用户研究支持。您需要深入理解用户需求，协助产品规划，并提供专业的产品建议。',
      personality: '创新、严谨、积极、洞察力强',
      defaultTools: ['data_analysis', 'product_catalog', 'report_generator'],
      tone: 'professional' as const
    }],
    ['运营部', {
      systemPrompt: '您是一位运营专员，负责流程优化、资源协调和运营分析。您需要高效处理各类运营事务，优化业务流程，并提供运营决策支持。',
      personality: '高效、细心、负责、灵活',
      defaultTools: ['data_analysis', 'report_generator', 'file_management'],
      tone: 'professional' as const
    }]
  ]);

  /**
   * 分析配置需求
   */
  async deriveRequirements(analysis: IntentAnalysis): Promise<ConfigRequirements> {
    const { entities, context } = analysis;

    // 基础信息需求
    const basic = {
      name: entities.name || this.generateDefaultName(entities.department, entities.role),
      department: entities.department || '通用部门',
      description: this.generateDescription(entities),
      priority: context.urgency
    };

    // 人设需求
    const persona = this.generatePersonaRequirements(entities, context);

    // 能力需求
    const capabilities = this.generateCapabilityRequirements(entities, context);

    // 高级需求
    const advanced = this.generateAdvancedRequirements(entities, context);

    return { basic, persona, capabilities, advanced };
  }

  /**
   * 生成配置
   */
  async generateConfig(requirements: ConfigRequirements): Promise<GeneratedConfig> {
    // 生成基础表单数据
    const form = this.generateFormData(requirements);

    // 计算配置质量指标
    const { confidence, completeness, quality } = this.calculateQualityMetrics(form, requirements);

    // 生成建议
    const suggestions = this.generateSuggestions(form, requirements);

    // 生成替代方案
    const alternatives = this.generateAlternatives(form, requirements);

    // 验证配置
    const validation = this.validateConfig(form);

    return {
      form,
      confidence,
      completeness,
      quality,
      suggestions,
      alternatives,
      validation
    };
  }

  /**
   * 生成表单数据
   */
  private generateFormData(requirements: ConfigRequirements): Partial<CreateDigitalEmployeeForm> {
    const { basic, persona, capabilities } = requirements;

    // 生成员工编号
    const employeeNumber = this.generateEmployeeNumber(basic.department);

    // 生成 Prompt 工程配置
    const promptConfig = this.generatePromptConfig(persona, requirements);

    return {
      name: basic.name,
      employeeNumber,
      description: basic.description,
      department: basic.department,
      systemPrompt: persona.systemPrompt,
      personality: persona.personality,
      responsibilities: persona.responsibilities,
      exampleDialogues: [],
      enableMentor: false,
      allowedTools: capabilities.allowedTools,
      resourcePermissions: [],
      canSelfLearn: true,
      initialFAQs: [],
      promptConfig
    };
  }

  /**
   * 生成默认名称
   */
  private generateDefaultName(department?: string, role?: string): string {
    if (role) {
      return `AI-${role}`;
    }

    const departmentMap: Record<string, string> = {
      '客户服务部': 'AI-客服',
      '技术支持部': 'AI-技术专家',
      '销售部': 'AI-销售顾问',
      '人力资源部': 'AI-HR助理',
      '产品部': 'AI-产品经理',
      '运营部': 'AI-运营专员'
    };

    return departmentMap[department || ''] || 'AI-助手';
  }

  /**
   * 生成描述
   */
  private generateDescription(entities: IntentAnalysis['entities']): string {
    const parts: string[] = [];

    if (entities.department) {
      parts.push(`专为${entities.department}设计`);
    }

    if (entities.role) {
      parts.push(`担任${entities.role}角色`);
    }

    if (entities.responsibilities && entities.responsibilities.length > 0) {
      parts.push(`主要负责${entities.responsibilities.slice(0, 2).join('、')}`);
    }

    if (entities.personality && entities.personality.length > 0) {
      parts.push(`具有${entities.personality.slice(0, 2).join('、')}的特点`);
    }

    return parts.join('，') || '智能数字员工助手';
  }

  /**
   * 生成人设需求
   */
  private generatePersonaRequirements(
    entities: IntentAnalysis['entities'],
    context: IntentAnalysis['context']
  ) {
    const department = entities.department || '通用部门';
    const template = this.industryTemplates.get(department);

    let systemPrompt = template?.systemPrompt || '您是一位专业的AI助手，能够高效完成各种任务。';

    // 根据具体职责定制 systemPrompt
    if (entities.responsibilities && entities.responsibilities.length > 0) {
      systemPrompt += `\n\n您的主要职责包括：${entities.responsibilities.map(r => `\n• ${r}`).join('')}`;
    }

    // 根据约束条件调整
    if (entities.constraints && entities.constraints.length > 0) {
      systemPrompt += `\n\n请注意以下约束：${entities.constraints.map(c => `\n• ${c}`).join('')}`;
    }

    return {
      systemPrompt,
      personality: template?.personality || entities.personality?.join('、') || '专业、友好、高效',
      responsibilities: entities.responsibilities || this.getDefaultResponsibilities(department),
      tone: template?.tone || 'professional',
      expertise: this.getSpecialSkills(entities)
    };
  }

  /**
   * 生成能力需求
   */
  private generateCapabilityRequirements(
    entities: IntentAnalysis['entities'],
    context: IntentAnalysis['context']
  ) {
    const department = entities.department || '通用部门';
    const template = this.industryTemplates.get(department);

    // 基础工具
    let allowedTools = template?.defaultTools || ['faq_search'];

    // 合并用户指定的工具
    if (entities.tools && entities.tools.length > 0) {
      allowedTools = [...new Set([...allowedTools, ...entities.tools])];
    }

    // 根据职责推断工具需求
    const inferredTools = this.inferToolsFromResponsibilities(entities.responsibilities || []);
    allowedTools = [...new Set([...allowedTools, ...inferredTools])];

    return {
      allowedTools,
      permissions: this.generatePermissions(department, context.complexity),
      knowledgeDomains: this.getKnowledgeDomains(department),
      specialSkills: this.getSpecialSkills(entities)
    };
  }

  /**
   * 生成高级需求
   */
  private generateAdvancedRequirements(
    entities: IntentAnalysis['entities'],
    context: IntentAnalysis['context']
  ) {
    return {
      compressionNeeded: context.complexity === 'complex',
      slotRequirements: this.generateSlotRequirements(entities),
      memoryStrategy: this.getMemoryStrategy(context.complexity),
      learningEnabled: true
    };
  }

  /**
   * 生成 Prompt 工程配置
   */
  private generatePromptConfig(
    persona: ConfigRequirements['persona'],
    requirements: ConfigRequirements
  ): PromptEngineeringConfig {
    const isComplex = requirements.advanced.compressionNeeded;

    return {
      mode: isComplex ? 'advanced' : 'simple',
      basePrompt: persona.systemPrompt,
      slots: [],
      quickSettings: {
        tone: persona.tone,
        responseLength: 'moderate',
        creativity: 'balanced'
      },
      ...(isComplex && {
        compressionConfig: {
          enabled: true,
          strategy: 'adaptive',
          triggerThreshold: 4000,
          preserveQuality: true,
          maxCompressionRatio: 0.5
        },
        contextConfig: {
          maxLength: 8000,
          memoryStrategy: requirements.advanced.memoryStrategy,
          cleanupRules: []
        }
      })
    };
  }

  /**
   * 生成员工编号
   */
  private generateEmployeeNumber(department: string): string {
    const departmentCodes: Record<string, string> = {
      '客户服务部': 'CS',
      '技术支持部': 'TS',
      '销售部': 'SA',
      '人力资源部': 'HR',
      '产品部': 'PD',
      '运营部': 'OP',
      '管理层': 'MG'
    };

    const code = departmentCodes[department] || 'DE';
    const timestamp = Date.now().toString().slice(-4);
    return `${code}${timestamp}`;
  }

  /**
   * 计算质量指标
   */
  private calculateQualityMetrics(
    form: Partial<CreateDigitalEmployeeForm>,
    requirements: ConfigRequirements
  ) {
    let confidence = 0.7; // 基础置信度
    let completeness = 0;
    let quality = 0;

    // 计算完整性
    const requiredFields = ['name', 'department', 'systemPrompt', 'personality'];
    const filledFields = requiredFields.filter(field => form[field as keyof typeof form]);
    completeness = filledFields.length / requiredFields.length;

    // 计算质量分
    if (form.systemPrompt && form.systemPrompt.length > 100) quality += 0.3;
    if (form.responsibilities && form.responsibilities.length > 0) quality += 0.2;
    if (form.allowedTools && form.allowedTools.length > 0) quality += 0.2;
    if (form.personality && form.personality.length > 5) quality += 0.15;
    if (form.description && form.description.length > 10) quality += 0.15;

    // 基于需求匹配度调整置信度
    if (requirements.basic.priority === 'high') confidence += 0.1;
    if (requirements.capabilities.allowedTools.length > 2) confidence += 0.1;

    return {
      confidence: Math.min(confidence, 1.0),
      completeness: Math.min(completeness, 1.0),
      quality: Math.min(quality, 1.0)
    };
  }

  /**
   * 生成建议
   */
  private generateSuggestions(
    form: Partial<CreateDigitalEmployeeForm>,
    requirements: ConfigRequirements
  ): ConfigSuggestion[] {
    const suggestions: ConfigSuggestion[] = [];

    // 检查 systemPrompt 长度
    if (!form.systemPrompt || form.systemPrompt.length < 50) {
      suggestions.push({
        type: 'improvement',
        field: 'systemPrompt',
        title: '系统提示词过短',
        description: '建议丰富系统提示词内容，以提升AI的表现效果',
        severity: 'medium',
        autoApplicable: false
      });
    }

    // 检查工具配置
    if (!form.allowedTools || form.allowedTools.length === 0) {
      suggestions.push({
        type: 'enhancement',
        field: 'allowedTools',
        title: '未配置工具',
        description: '建议为数字员工配置相关工具以提升工作效率',
        severity: 'medium',
        autoApplicable: true
      });
    }

    // 检查职责定义
    if (!form.responsibilities || form.responsibilities.length === 0) {
      suggestions.push({
        type: 'improvement',
        field: 'responsibilities',
        title: '职责定义不明确',
        description: '建议明确定义数字员工的主要职责',
        severity: 'high',
        autoApplicable: false
      });
    }

    // 复杂度建议
    if (requirements.advanced.compressionNeeded) {
      suggestions.push({
        type: 'optimization',
        field: 'promptConfig',
        title: '启用高级配置',
        description: '检测到复杂需求，建议启用高级配置模式',
        severity: 'low',
        autoApplicable: true
      });
    }

    return suggestions;
  }

  /**
   * 生成替代方案
   */
  private generateAlternatives(
    form: Partial<CreateDigitalEmployeeForm>,
    requirements: ConfigRequirements
  ): ConfigAlternative[] {
    const alternatives: ConfigAlternative[] = [];

    // 简化版本
    if (requirements.advanced.compressionNeeded) {
      alternatives.push({
        id: 'simplified',
        name: '简化版本',
        description: '减少复杂功能，专注核心能力',
        changes: {
          allowedTools: form.allowedTools?.slice(0, 3),
          promptConfig: { ...form.promptConfig, mode: 'simple' }
        },
        pros: ['配置简单', '响应快速', '易于维护'],
        cons: ['功能有限', '扩展性较差'],
        score: 0.7
      });
    }

    // 增强版本
    alternatives.push({
      id: 'enhanced',
      name: '增强版本',
      description: '添加更多工具和高级功能',
      changes: {
        allowedTools: [...(form.allowedTools || []), 'data_analysis', 'report_generator'],
        canSelfLearn: true,
        promptConfig: { ...form.promptConfig, mode: 'advanced' }
      },
      pros: ['功能丰富', '智能化程度高', '适应性强'],
      cons: ['配置复杂', '资源消耗较大'],
      score: 0.85
    });

    return alternatives;
  }

  /**
   * 验证配置
   */
  private validateConfig(form: Partial<CreateDigitalEmployeeForm>): ValidationResult {
    const errors: ValidationResult['errors'] = [];
    const warnings: ValidationResult['warnings'] = [];

    // 必填字段验证
    if (!form.name) {
      errors.push({
        field: 'name',
        message: '员工姓名不能为空',
        severity: 'error',
        fixSuggestion: '请输入员工姓名'
      });
    }

    if (!form.department) {
      errors.push({
        field: 'department',
        message: '所属部门不能为空',
        severity: 'error',
        fixSuggestion: '请选择所属部门'
      });
    }

    if (!form.systemPrompt) {
      errors.push({
        field: 'systemPrompt',
        message: '系统提示词不能为空',
        severity: 'error',
        fixSuggestion: '请输入系统提示词'
      });
    }

    // 警告检查
    if (form.systemPrompt && form.systemPrompt.length > 4000) {
      warnings.push({
        field: 'systemPrompt',
        message: '系统提示词过长，可能影响性能',
        impact: 'medium',
        suggestion: '建议启用压缩策略或简化内容'
      });
    }

    if (!form.allowedTools || form.allowedTools.length === 0) {
      warnings.push({
        field: 'allowedTools',
        message: '未配置任何工具',
        impact: 'low',
        suggestion: '建议配置相关工具提升能力'
      });
    }

    // 计算评分
    const errorCount = errors.filter(e => e.severity === 'error').length;
    const warningCount = warnings.length;
    const score = Math.max(0, 100 - errorCount * 30 - warningCount * 10);

    // 计算完整性
    const requiredFields = ['name', 'department', 'systemPrompt', 'personality'];
    const filledFields = requiredFields.filter(field => form[field as keyof typeof form]);
    const completeness = (filledFields.length / requiredFields.length) * 100;

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score,
      completeness,
      recommendations: this.generateRecommendations(form, errors, warnings)
    };
  }

  // 辅助方法
  private getDefaultResponsibilities(department: string): string[] {
    const defaultResponsibilities: Record<string, string[]> = {
      '客户服务部': ['回答客户咨询', '处理客户投诉', '提供技术支持'],
      '技术支持部': ['技术故障诊断', '提供解决方案', '技术文档维护'],
      '销售部': ['客户需求分析', '产品介绍推荐', '报价和合同协助'],
      '人力资源部': ['员工政策咨询', '招聘流程协助', '培训资料管理'],
      '产品部': ['需求收集分析', '产品功能设计', '用户体验优化'],
      '运营部': ['流程优化分析', '数据统计汇总', '资源协调管理']
    };

    return defaultResponsibilities[department] || ['提供专业咨询服务', '协助处理日常事务'];
  }

  private inferToolsFromResponsibilities(responsibilities: string[]): string[] {
    const toolMap: Record<string, string[]> = {
      '订单': ['order_query'],
      '客户': ['customer_info', 'crm_access'],
      '技术': ['tech_diagnosis', 'solution_search'],
      '产品': ['product_catalog'],
      '数据': ['data_analysis', 'report_generator'],
      '文档': ['file_management'],
      '价格': ['pricing_calc']
    };

    const tools: string[] = [];
    responsibilities.forEach(resp => {
      Object.entries(toolMap).forEach(([keyword, toolList]) => {
        if (resp.includes(keyword)) {
          tools.push(...toolList);
        }
      });
    });

    return [...new Set(tools)];
  }

  private generatePermissions(department: string, complexity: string): string[] {
    const basePermissions = ['read_basic_info'];

    if (complexity === 'complex') {
      basePermissions.push('read_advanced_info', 'write_reports');
    }

    const departmentPermissions: Record<string, string[]> = {
      '客户服务部': ['read_customer_info', 'read_order_info'],
      '技术支持部': ['read_system_logs', 'read_tech_docs'],
      '销售部': ['read_product_info', 'read_pricing_info'],
      '人力资源部': ['read_hr_policies', 'read_employee_basic']
    };

    return [...basePermissions, ...(departmentPermissions[department] || [])];
  }

  private getKnowledgeDomains(department: string): string[] {
    const domains: Record<string, string[]> = {
      '客户服务部': ['产品知识', '服务流程', '常见问题'],
      '技术支持部': ['技术文档', '故障处理', '系统知识'],
      '销售部': ['产品特性', '市场信息', '竞品分析'],
      '人力资源部': ['人事政策', '招聘流程', '员工手册'],
      '产品部': ['用户需求', '产品规划', '竞品分析'],
      '运营部': ['业务流程', '数据分析', '运营策略']
    };

    return domains[department] || ['通用知识'];
  }

  private getSpecialSkills(entities: IntentAnalysis['entities']): string[] {
    const skills: string[] = [];

    if (entities.tools?.includes('data_analysis')) {
      skills.push('数据分析');
    }
    if (entities.tools?.includes('tech_diagnosis')) {
      skills.push('技术诊断');
    }
    if (entities.responsibilities?.some(r => r.includes('创新'))) {
      skills.push('创新思维');
    }

    return skills;
  }

  private generateSlotRequirements(entities: IntentAnalysis['entities']): string[] {
    const slots: string[] = ['user_name', 'current_time'];

    if (entities.department) {
      slots.push('department_info');
    }
    if (entities.tools?.includes('customer_info')) {
      slots.push('customer_context');
    }

    return slots;
  }

  private getMemoryStrategy(complexity: string): 'short' | 'long' | 'adaptive' {
    switch (complexity) {
      case 'simple': return 'short';
      case 'complex': return 'long';
      default: return 'adaptive';
    }
  }

  private generateRecommendations(
    form: Partial<CreateDigitalEmployeeForm>,
    errors: ValidationResult['errors'],
    warnings: ValidationResult['warnings']
  ): string[] {
    const recommendations: string[] = [];

    if (errors.length > 0) {
      recommendations.push('请先修复所有错误项再提交配置');
    }

    if (warnings.length > 0) {
      recommendations.push('建议关注警告项以获得更好的性能表现');
    }

    if (!form.exampleDialogues || form.exampleDialogues.length === 0) {
      recommendations.push('建议添加一些示例对话以提升AI表现');
    }

    if (!form.initialFAQs || form.initialFAQs.length === 0) {
      recommendations.push('建议预设一些常见问题以提升响应效率');
    }

    return recommendations;
  }
}