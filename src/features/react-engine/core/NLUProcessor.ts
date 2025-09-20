/**
 * 自然语言理解处理器
 * 负责分析用户输入，提取意图和实体信息
 */

import type { IntentAnalysis } from '../types';

export class NLUProcessor {
  private departments = [
    '客户服务部', '技术支持部', '销售部', '人力资源部',
    '管理层', '产品部', '运营部', '市场部', '财务部'
  ];

  private tools = [
    'order_query', 'logistics_track', 'customer_info', 'faq_search',
    'tech_diagnosis', 'solution_search', 'crm_access', 'product_catalog',
    'pricing_calc', 'report_generator', 'data_analysis', 'file_management'
  ];

  private personalityTraits = [
    '友好', '专业', '耐心', '热情', '严谨', '创新', '细心', '负责',
    '积极', '温和', '幽默', '礼貌', '高效', '可靠', '灵活', '诚信'
  ];

  private commonRoles = [
    '客服助手', '技术专家', '销售顾问', 'HR助理', '数据分析师',
    '产品经理', '运营专员', '市场分析', '财务助手', '项目协调'
  ];

  /**
   * 分析用户输入的自然语言
   */
  async analyzeIntent(input: string): Promise<IntentAnalysis> {
    const normalizedInput = this.normalizeInput(input);

    // 意图识别
    const primaryIntent = this.identifyPrimaryIntent(normalizedInput);
    const confidence = this.calculateConfidence(normalizedInput, primaryIntent);

    // 实体提取
    const entities = this.extractEntities(normalizedInput);

    // 上下文分析
    const context = this.analyzeContext(normalizedInput, entities);

    // 识别缺失信息
    const missingInfo = this.identifyMissingInfo(entities, primaryIntent);

    // 生成建议
    const suggestions = this.generateSuggestions(entities, missingInfo, context);

    return {
      primaryIntent,
      confidence,
      entities,
      context,
      missingInfo,
      suggestions
    };
  }

  /**
   * 标准化输入文本
   */
  private normalizeInput(input: string): string {
    return input
      .toLowerCase()
      .replace(/，/g, ',')
      .replace(/。/g, '.')
      .replace(/！/g, '!')
      .replace(/？/g, '?')
      .replace(/；/g, ';')
      .replace(/：/g, ':')
      .replace(/"/g, '"')
      .replace(/"/g, '"')
      .replace(/'/g, "'")
      .replace(/'/g, "'")
      .replace(/（/g, '(')
      .replace(/）/g, ')')
      .replace(/【/g, '[')
      .replace(/】/g, ']')
      .trim();
  }

  /**
   * 识别主要意图
   */
  private identifyPrimaryIntent(input: string): IntentAnalysis['primaryIntent'] {
    const createKeywords = [
      '创建', '新建', '添加', '创造', '制作', '生成', '建立',
      '我要', '我想要', '请帮我', '帮我创建', '需要一个'
    ];

    const modifyKeywords = [
      '修改', '更改', '调整', '编辑', '优化', '完善', '改进'
    ];

    const helpKeywords = [
      '如何', '怎么', '怎样', '什么是', '帮助', '指导', '教程'
    ];

    if (createKeywords.some(keyword => input.includes(keyword))) {
      return 'create_employee';
    }

    if (modifyKeywords.some(keyword => input.includes(keyword))) {
      return 'modify_employee';
    }

    if (helpKeywords.some(keyword => input.includes(keyword))) {
      return 'help';
    }

    // 如果没有明确关键词但提到了角色或部门，推断为创建意图
    if (this.departments.some(dept => input.includes(dept)) ||
        this.commonRoles.some(role => input.includes(role))) {
      return 'create_employee';
    }

    return 'unclear';
  }

  /**
   * 计算意图识别的置信度
   */
  private calculateConfidence(input: string, intent: IntentAnalysis['primaryIntent']): number {
    let confidence = 0.5; // 基础置信度

    // 关键词匹配加分
    const keywordBonus = this.calculateKeywordMatch(input, intent);
    confidence += keywordBonus * 0.3;

    // 结构完整性加分
    const structureBonus = this.calculateStructureCompleteness(input);
    confidence += structureBonus * 0.2;

    // 长度合理性
    if (input.length > 10 && input.length < 500) {
      confidence += 0.1;
    }

    // 包含具体信息加分
    if (this.containsSpecificInfo(input)) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * 提取实体信息
   */
  private extractEntities(input: string) {
    const entities: IntentAnalysis['entities'] = {};

    // 提取姓名
    const namePatterns = [
      /(?:叫|名字|称为|命名为|取名)[\s]*([A-Za-z\u4e00-\u9fa5\-]+)/,
      /([A-Za-z\u4e00-\u9fa5]+)(?:助手|助理|专员|经理|顾问)/,
      /AI[\s]*[-]?[\s]*([A-Za-z\u4e00-\u9fa5]+)/
    ];

    for (const pattern of namePatterns) {
      const match = input.match(pattern);
      if (match && match[1]) {
        entities.name = match[1].trim();
        break;
      }
    }

    // 提取部门
    entities.department = this.departments.find(dept => input.includes(dept));

    // 提取角色
    entities.role = this.commonRoles.find(role => input.includes(role));

    // 提取性格特征
    entities.personality = this.personalityTraits.filter(trait => input.includes(trait));

    // 提取职责
    entities.responsibilities = this.extractResponsibilities(input);

    // 提取工具需求
    entities.tools = this.tools.filter(tool => {
      const toolNames = {
        'order_query': ['订单', '查询订单', '订单信息'],
        'customer_info': ['客户', '客户信息', '客户资料'],
        'faq_search': ['常见问题', 'FAQ', '问答'],
        'tech_diagnosis': ['技术诊断', '故障', '诊断'],
        'crm_access': ['CRM', '客户管理'],
        'product_catalog': ['产品', '商品', '目录'],
        'pricing_calc': ['价格', '计算', '报价'],
        'data_analysis': ['数据', '分析', '报表'],
        'file_management': ['文件', '文档', '管理']
      };

      const keywords = toolNames[tool as keyof typeof toolNames] || [tool];
      return keywords.some(keyword => input.includes(keyword));
    });

    // 提取约束条件
    entities.constraints = this.extractConstraints(input);

    return entities;
  }

  /**
   * 提取职责信息
   */
  private extractResponsibilities(input: string): string[] {
    const responsibilities: string[] = [];

    const patterns = [
      /(?:负责|处理|管理|解决|回答|协助|支持|提供)([^，。！？]+)/g,
      /(?:主要|主要负责|职责包括|工作内容)[\s:：]([^，。！？]+)/g,
      /(?:能够|可以|擅长)([^，。！？]+)/g
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(input)) !== null) {
        if (match[1] && match[1].trim().length > 2) {
          responsibilities.push(match[1].trim());
        }
      }
    }

    return [...new Set(responsibilities)]; // 去重
  }

  /**
   * 提取约束条件
   */
  private extractConstraints(input: string): string[] {
    const constraints: string[] = [];

    const constraintPatterns = [
      /(?:不能|不可以|禁止|不允许|不得)([^，。！？]+)/g,
      /(?:仅限|只能|限制在|范围是)([^，。！？]+)/g,
      /(?:要求|必须|需要)([^，。！？]+)/g
    ];

    for (const pattern of constraintPatterns) {
      let match;
      while ((match = pattern.exec(input)) !== null) {
        if (match[1] && match[1].trim().length > 2) {
          constraints.push(match[1].trim());
        }
      }
    }

    return [...new Set(constraints)];
  }

  /**
   * 分析上下文信息
   */
  private analyzeContext(input: string, entities: IntentAnalysis['entities']) {
    // 分析紧急程度
    const urgencyKeywords = {
      high: ['紧急', '急需', '立即', '马上', '尽快', '着急'],
      medium: ['近期', '最近', '本周', '这几天'],
      low: ['有空', '方便时', '不急', '慢慢来']
    };

    let urgency: 'low' | 'medium' | 'high' = 'medium';
    for (const [level, keywords] of Object.entries(urgencyKeywords)) {
      if (keywords.some(keyword => input.includes(keyword))) {
        urgency = level as 'low' | 'medium' | 'high';
        break;
      }
    }

    // 分析复杂度
    let complexity: 'simple' | 'moderate' | 'complex' = 'moderate';
    const complexityIndicators = {
      simple: input.length < 50 && (!entities.tools || entities.tools.length <= 2),
      complex: input.length > 200 || (entities.tools && entities.tools.length > 5) ||
               (entities.responsibilities && entities.responsibilities.length > 3)
    };

    if (complexityIndicators.simple) complexity = 'simple';
    else if (complexityIndicators.complex) complexity = 'complex';

    // 推断领域
    const domain = entities.department || this.inferDomain(input);

    return { urgency, complexity, domain };
  }

  /**
   * 推断业务领域
   */
  private inferDomain(input: string): string {
    const domainKeywords = {
      '客户服务': ['客户', '服务', '投诉', '咨询', '支持'],
      '技术支持': ['技术', '故障', '诊断', '修复', '技术支持'],
      '销售': ['销售', '客户', '产品', '报价', '商务'],
      '人力资源': ['人事', '招聘', '员工', '薪资', '培训'],
      '产品': ['产品', '功能', '需求', '设计', '用户'],
      '运营': ['运营', '流程', '优化', '管理', '协调'],
      '数据分析': ['数据', '分析', '报表', '统计', '指标']
    };

    for (const [domain, keywords] of Object.entries(domainKeywords)) {
      if (keywords.some(keyword => input.includes(keyword))) {
        return domain;
      }
    }

    return '通用';
  }

  /**
   * 识别缺失的关键信息
   */
  private identifyMissingInfo(entities: IntentAnalysis['entities'], intent: IntentAnalysis['primaryIntent']): string[] {
    const missing: string[] = [];

    if (intent === 'create_employee') {
      if (!entities.name) missing.push('员工姓名');
      if (!entities.department) missing.push('所属部门');
      if (!entities.role && (!entities.responsibilities || entities.responsibilities.length === 0)) {
        missing.push('职责或角色定义');
      }
      if (!entities.personality || entities.personality.length === 0) {
        missing.push('性格特点');
      }
    }

    return missing;
  }

  /**
   * 生成智能建议
   */
  private generateSuggestions(
    entities: IntentAnalysis['entities'],
    missingInfo: string[],
    context: IntentAnalysis['context']
  ): string[] {
    const suggestions: string[] = [];

    // 基于缺失信息的建议
    if (missingInfo.includes('员工姓名')) {
      suggestions.push(`建议为${entities.role || '数字员工'}起一个有意义的名字，如 AI-${entities.department || '助手'}`);
    }

    if (missingInfo.includes('所属部门')) {
      suggestions.push('请明确指定数字员工的所属部门，这将影响其权限和职责配置');
    }

    if (missingInfo.includes('职责或角色定义')) {
      suggestions.push('建议详细描述数字员工的主要职责和工作内容');
    }

    // 基于部门的建议
    if (entities.department) {
      const departmentSuggestions = this.getDepartmentSpecificSuggestions(entities.department);
      suggestions.push(...departmentSuggestions);
    }

    // 基于复杂度的建议
    if (context.complexity === 'complex') {
      suggestions.push('您的需求较为复杂，建议使用高级模式进行详细配置');
    } else if (context.complexity === 'simple') {
      suggestions.push('您的需求相对简单，推荐使用快速模式一键创建');
    }

    // 基于紧急程度的建议
    if (context.urgency === 'high') {
      suggestions.push('建议先使用快速模式创建基础版本，后续可以进一步完善');
    }

    return suggestions;
  }

  /**
   * 获取特定部门的建议
   */
  private getDepartmentSpecificSuggestions(department: string): string[] {
    const departmentSuggestions: Record<string, string[]> = {
      '客户服务部': [
        '建议配置订单查询和客户信息查询工具',
        '推荐设置友好耐心的性格特点',
        '建议添加常见问题解答能力'
      ],
      '技术支持部': [
        '建议配置技术诊断和解决方案搜索工具',
        '推荐设置专业严谨的性格特点',
        '建议添加技术文档访问权限'
      ],
      '销售部': [
        '建议配置产品目录和价格计算工具',
        '推荐设置热情专业的性格特点',
        '建议添加CRM系统访问权限'
      ]
    };

    return departmentSuggestions[department] || [];
  }

  /**
   * 计算关键词匹配度
   */
  private calculateKeywordMatch(input: string, intent: IntentAnalysis['primaryIntent']): number {
    const intentKeywords = {
      create_employee: ['创建', '新建', '员工', '助手', '数字员工'],
      modify_employee: ['修改', '调整', '更新', '优化'],
      help: ['帮助', '如何', '怎么', '指导'],
      unclear: []
    };

    const keywords = intentKeywords[intent];
    const matchCount = keywords.filter(keyword => input.includes(keyword)).length;
    return matchCount / Math.max(keywords.length, 1);
  }

  /**
   * 计算结构完整性
   */
  private calculateStructureCompleteness(input: string): number {
    let score = 0;

    // 包含动词 +0.2
    if (/创建|建立|制作|需要|想要|希望/.test(input)) score += 0.2;

    // 包含对象 +0.2
    if (/助手|员工|机器人|AI|数字员工/.test(input)) score += 0.2;

    // 包含属性描述 +0.3
    if (/部门|职责|负责|专业|友好|性格/.test(input)) score += 0.3;

    // 包含具体需求 +0.3
    if (/工具|权限|能力|技能|功能/.test(input)) score += 0.3;

    return Math.min(score, 1.0);
  }

  /**
   * 检查是否包含具体信息
   */
  private containsSpecificInfo(input: string): boolean {
    return this.departments.some(dept => input.includes(dept)) ||
           this.commonRoles.some(role => input.includes(role)) ||
           this.personalityTraits.some(trait => input.includes(trait)) ||
           /[A-Za-z\u4e00-\u9fa5]+助手|[A-Za-z\u4e00-\u9fa5]+专员/.test(input);
  }
}