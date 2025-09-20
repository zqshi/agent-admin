/**
 * 智能分析服务
 * 基于自然语言描述生成数字员工配置建议
 */

import { NLUProcessor } from '../../react-engine/core/NLUProcessor';
import { ConfigGenerator } from '../../react-engine/core/ConfigGenerator';
import type { ReActStep } from '../../react-engine/types';
import type { PersonalityTraits, WorkStyle, CommunicationStyle } from '../types';

export interface SmartSuggestion {
  type: 'responsibilities' | 'personality' | 'workStyle' | 'communication' | 'tools';
  title: string;
  content: any;
  confidence: number;
  reason: string;
  isRecommended: boolean;
}

export interface AnalysisResult {
  reasoning: ReActStep[];
  suggestions: SmartSuggestion[];
  extractedInfo: {
    role?: string;
    department?: string;
    personality?: string[];
    responsibilities?: string[];
    tools?: string[];
  };
  confidence: number;
}

export class SmartAnalysisService {
  private nluProcessor: NLUProcessor;
  private configGenerator: ConfigGenerator;

  constructor() {
    this.nluProcessor = new NLUProcessor();
    this.configGenerator = new ConfigGenerator();
  }

  /**
   * 分析描述并生成配置建议
   */
  async analyzeDescription(description: string): Promise<AnalysisResult> {
    if (!description?.trim()) {
      throw new Error('描述不能为空');
    }

    // 模拟ReAct推理过程
    const reasoning: ReActStep[] = [
      {
        id: '1',
        type: 'reasoning',
        phase: 'intent_analysis',
        title: '理解需求',
        content: '正在分析用户描述的员工需求和角色特征...',
        timestamp: Date.now(),
        confidence: 0.9,
        status: 'completed'
      },
      {
        id: '2',
        type: 'acting',
        phase: 'requirement_derivation',
        title: '提取关键信息',
        content: '从描述中提取部门、职责、性格特征等关键要素...',
        timestamp: Date.now() + 1000,
        confidence: 0.85,
        status: 'completed'
      },
      {
        id: '3',
        type: 'reasoning',
        phase: 'config_generation',
        title: '推理分析',
        content: '基于提取的信息，推导最适合的配置方案...',
        timestamp: Date.now() + 2000,
        confidence: 0.8,
        status: 'completed'
      },
      {
        id: '4',
        type: 'acting',
        phase: 'config_generation',
        title: '生成建议',
        content: '生成具体的配置建议和推荐参数...',
        timestamp: Date.now() + 3000,
        confidence: 0.9,
        status: 'completed'
      }
    ];

    // 使用NLU处理器分析
    const intentAnalysis = await this.nluProcessor.analyzeIntent(description);
    const { entities, confidence } = intentAnalysis;

    // 提取关键信息
    const extractedInfo = {
      role: entities.role || this.inferRoleFromDescription(description),
      department: entities.department,
      personality: entities.personality || [],
      responsibilities: entities.responsibilities || [],
      tools: entities.tools || []
    };

    // 生成智能建议
    const suggestions = this.generateSuggestions(description, extractedInfo);

    return {
      reasoning,
      suggestions,
      extractedInfo,
      confidence
    };
  }

  /**
   * 从描述中推断角色
   */
  private inferRoleFromDescription(description: string): string | undefined {
    const roleKeywords = {
      '客服专员': ['客服', '客户服务', '咨询', '投诉', '售后'],
      '数据分析师': ['数据', '分析', '统计', '报表', '指标'],
      '销售顾问': ['销售', '客户', '产品推荐', '商务', '业绩'],
      '技术支持': ['技术', '故障', '维修', '诊断', '技术支持'],
      'HR助理': ['人事', '招聘', '员工', '培训', '考勤'],
      '产品经理': ['产品', '需求', '设计', '用户体验', '功能'],
      '运营专员': ['运营', '流程', '优化', '协调', '管理']
    };

    for (const [role, keywords] of Object.entries(roleKeywords)) {
      if (keywords.some(keyword => description.includes(keyword))) {
        return role;
      }
    }

    return undefined;
  }

  /**
   * 生成智能建议
   */
  private generateSuggestions(description: string, extractedInfo: any): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = [];

    // 1. 职责建议
    if (extractedInfo.responsibilities.length === 0 && extractedInfo.role) {
      const responsibilitySuggestion = this.generateResponsibilitySuggestion(extractedInfo.role, description);
      if (responsibilitySuggestion) {
        suggestions.push(responsibilitySuggestion);
      }
    }

    // 2. 性格特征建议
    const personalitySuggestion = this.generatePersonalitySuggestion(extractedInfo.role, description);
    if (personalitySuggestion) {
      suggestions.push(personalitySuggestion);
    }

    // 3. 工作风格建议
    const workStyleSuggestion = this.generateWorkStyleSuggestion(extractedInfo.role, description);
    if (workStyleSuggestion) {
      suggestions.push(workStyleSuggestion);
    }

    // 4. 沟通特征建议
    const communicationSuggestion = this.generateCommunicationSuggestion(extractedInfo.role, description);
    if (communicationSuggestion) {
      suggestions.push(communicationSuggestion);
    }

    // 5. 工具建议
    const toolsSuggestion = this.generateToolsSuggestion(extractedInfo.role, description);
    if (toolsSuggestion) {
      suggestions.push(toolsSuggestion);
    }

    return suggestions;
  }

  /**
   * 生成职责建议
   */
  private generateResponsibilitySuggestion(role: string, description: string): SmartSuggestion | null {
    const roleResponsibilities: Record<string, string[]> = {
      '客服专员': [
        '处理客户咨询和投诉',
        '提供产品信息和使用指导',
        '跟进客户满意度调查',
        '协助解决售后问题'
      ],
      '数据分析师': [
        '收集和整理业务数据',
        '制作数据分析报表',
        '挖掘数据洞察和趋势',
        '支持业务决策分析'
      ],
      '销售顾问': [
        '了解客户需求',
        '推荐合适的产品方案',
        '处理销售流程',
        '维护客户关系'
      ],
      '技术支持': [
        '诊断技术问题',
        '提供解决方案',
        '指导产品使用',
        '维护技术文档'
      ]
    };

    const responsibilities = roleResponsibilities[role];
    if (!responsibilities) return null;

    return {
      type: 'responsibilities',
      title: '推荐职责配置',
      content: responsibilities,
      confidence: 0.85,
      reason: `基于"${role}"角色的常见职责`,
      isRecommended: true
    };
  }

  /**
   * 生成性格特征建议
   */
  private generatePersonalitySuggestion(role: string, description: string): SmartSuggestion | null {
    const rolePersonality: Record<string, PersonalityTraits> = {
      '客服专员': {
        friendliness: 9,
        professionalism: 8,
        patience: 9,
        empathy: 8
      },
      '数据分析师': {
        friendliness: 6,
        professionalism: 9,
        patience: 7,
        empathy: 5
      },
      '销售顾问': {
        friendliness: 8,
        professionalism: 8,
        patience: 7,
        empathy: 7
      },
      '技术支持': {
        friendliness: 6,
        professionalism: 9,
        patience: 8,
        empathy: 6
      }
    };

    const personality = rolePersonality[role];
    if (!personality) return null;

    return {
      type: 'personality',
      title: '推荐性格配置',
      content: personality,
      confidence: 0.8,
      reason: `${role}通常需要这样的性格特征组合`,
      isRecommended: true
    };
  }

  /**
   * 生成工作风格建议
   */
  private generateWorkStyleSuggestion(role: string, description: string): SmartSuggestion | null {
    const roleWorkStyle: Record<string, WorkStyle> = {
      '客服专员': {
        rigor: 'balanced',
        humor: 'occasional',
        proactivity: 'balanced',
        detailOrientation: 'high'
      },
      '数据分析师': {
        rigor: 'strict',
        humor: 'none',
        proactivity: 'reactive',
        detailOrientation: 'high'
      },
      '销售顾问': {
        rigor: 'balanced',
        humor: 'frequent',
        proactivity: 'proactive',
        detailOrientation: 'medium'
      },
      '技术支持': {
        rigor: 'strict',
        humor: 'none',
        proactivity: 'balanced',
        detailOrientation: 'high'
      }
    };

    const workStyle = roleWorkStyle[role];
    if (!workStyle) return null;

    return {
      type: 'workStyle',
      title: '推荐工作风格',
      content: workStyle,
      confidence: 0.75,
      reason: `${role}岗位的典型工作风格配置`,
      isRecommended: true
    };
  }

  /**
   * 生成沟通特征建议
   */
  private generateCommunicationSuggestion(role: string, description: string): SmartSuggestion | null {
    const roleCommunication: Record<string, CommunicationStyle> = {
      '客服专员': {
        responseLength: 'moderate',
        language: 'casual',
        technicality: 'simple'
      },
      '数据分析师': {
        responseLength: 'detailed',
        language: 'neutral',
        technicality: 'technical'
      },
      '销售顾问': {
        responseLength: 'moderate',
        language: 'casual',
        technicality: 'moderate'
      },
      '技术支持': {
        responseLength: 'detailed',
        language: 'neutral',
        technicality: 'technical'
      }
    };

    const communication = roleCommunication[role];
    if (!communication) return null;

    return {
      type: 'communication',
      title: '推荐沟通特征',
      content: communication,
      confidence: 0.75,
      reason: `${role}的最佳沟通方式配置`,
      isRecommended: true
    };
  }

  /**
   * 生成工具建议
   */
  private generateToolsSuggestion(role: string, description: string): SmartSuggestion | null {
    const roleTools: Record<string, string[]> = {
      '客服专员': ['order_query', 'customer_info', 'faq_search', 'email_sender'],
      '数据分析师': ['data_query', 'report_generator'],
      '销售顾问': ['crm_access', 'pricing_calc', 'customer_info', 'email_sender'],
      '技术支持': ['faq_search', 'data_query', 'email_sender']
    };

    const tools = roleTools[role];
    if (!tools) return null;

    return {
      type: 'tools',
      title: '推荐工具配置',
      content: tools,
      confidence: 0.9,
      reason: `${role}常用的工具组合`,
      isRecommended: true
    };
  }
}

export const smartAnalysisService = new SmartAnalysisService();