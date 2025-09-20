/**
 * 增强的智能分析服务
 * 整合自然语言ReAct模式与基础信息，根据描述自动匹配各种特征
 */

import type { ReActStep } from '../../react-engine/types';

export interface PersonalityTrait {
  name: string;
  description: string;
  score: number; // 0-100
  reasoning: string;
}

export interface WorkStyle {
  type: string;
  description: string;
  characteristics: string[];
  score: number;
}

export interface CommunicationStyle {
  style: string;
  tone: string;
  formality: 'formal' | 'casual' | 'mixed';
  characteristics: string[];
  score: number;
}

export interface ToolRecommendation {
  toolName: string;
  category: string;
  description: string;
  relevanceScore: number;
  reasoning: string;
  configuration?: Record<string, any>;
}

export interface EnhancedAnalysisResult {
  // 基础分析
  responsibilities: string[];
  serviceScope: string[];
  
  // 性格特征分析
  personalityTraits: PersonalityTrait[];
  
  // 工作风格分析
  workStyle: WorkStyle;
  
  // 沟通特征分析
  communicationStyle: CommunicationStyle;
  
  // 工具推荐
  toolRecommendations: ToolRecommendation[];
  
  // ReAct推理过程
  reasoning: ReActStep[];
  
  // 置信度评分
  confidenceScore: number;
}

class EnhancedAnalysisService {
  private personalityDatabase = {
    '友好': {
      keywords: ['友好', '热情', '温暖', '亲切', '和善', '客户服务', '接待'],
      description: '表现出友善和热情的态度，善于与人交往',
      score: 85
    },
    '专业': {
      keywords: ['专业', '严谨', '准确', '技术', '精确', '规范'],
      description: '具备专业知识和严谨的工作态度',
      score: 90
    },
    '耐心': {
      keywords: ['耐心', '细致', '详细', '解答', '指导', '教学'],
      description: '能够耐心细致地处理问题和指导他人',
      score: 80
    },
    '高效': {
      keywords: ['高效', '快速', '及时', '迅速', '效率', '自动化'],
      description: '能够快速高效地完成任务',
      score: 85
    },
    '分析': {
      keywords: ['分析', '数据', '洞察', '研究', '统计', '报告'],
      description: '具备强大的分析和洞察能力',
      score: 88
    },
    '创新': {
      keywords: ['创新', '创意', '新颖', '改进', '优化', '突破'],
      description: '具有创新思维和改进能力',
      score: 75
    }
  };

  private workStyleDatabase = {
    '协作型': {
      keywords: ['团队', '协作', '配合', '沟通', '合作', '协调'],
      description: '善于团队协作，注重沟通配合',
      characteristics: ['团队意识强', '沟通能力好', '善于协调', '乐于分享']
    },
    '独立型': {
      keywords: ['独立', '自主', '个人', '专注', '深入', '研究'],
      description: '能够独立工作，专注于深度思考',
      characteristics: ['自主性强', '专注力好', '独立思考', '深度工作']
    },
    '服务型': {
      keywords: ['服务', '客户', '帮助', '支持', '解决', '满意'],
      description: '以服务为导向，关注客户需求',
      characteristics: ['服务意识强', '客户导向', '问题解决', '响应及时']
    },
    '分析型': {
      keywords: ['分析', '数据', '逻辑', '系统', '方法', '科学'],
      description: '注重数据分析和逻辑思维',
      characteristics: ['逻辑思维强', '数据敏感', '系统性思考', '科学方法']
    }
  };

  private communicationDatabase = {
    '专业正式': {
      keywords: ['专业', '正式', '规范', '标准', '官方', '严谨'],
      tone: '正式',
      formality: 'formal' as const,
      characteristics: ['用词准确', '语言规范', '逻辑清晰', '专业术语']
    },
    '友好亲切': {
      keywords: ['友好', '亲切', '温暖', '热情', '轻松', '自然'],
      tone: '友好',
      formality: 'casual' as const,
      characteristics: ['语言温暖', '表达自然', '易于理解', '情感丰富']
    },
    '简洁高效': {
      keywords: ['简洁', '高效', '直接', '快速', '要点', '精准'],
      tone: '简洁',
      formality: 'mixed' as const,
      characteristics: ['表达简洁', '重点突出', '信息密度高', '节省时间']
    },
    '详细耐心': {
      keywords: ['详细', '耐心', '解释', '指导', '教学', '细致'],
      tone: '耐心',
      formality: 'mixed' as const,
      characteristics: ['解释详细', '循序渐进', '举例说明', '反复确认']
    }
  };

  private toolDatabase = {
    '知识库管理': {
      category: '知识管理',
      keywords: ['知识', '文档', '资料', '信息', '查询', '检索'],
      description: '管理和检索企业知识库',
      baseScore: 80
    },
    '客户关系管理': {
      category: '客户服务',
      keywords: ['客户', '用户', '服务', 'CRM', '关系', '维护'],
      description: '管理客户信息和关系',
      baseScore: 85
    },
    '数据分析工具': {
      category: '数据分析',
      keywords: ['数据', '分析', '统计', '报表', '图表', '洞察'],
      description: '进行数据分析和可视化',
      baseScore: 90
    },
    '自动化流程': {
      category: '流程自动化',
      keywords: ['自动化', '流程', '工作流', '批处理', '定时', '规则'],
      description: '自动化业务流程',
      baseScore: 75
    },
    '沟通协作': {
      category: '协作工具',
      keywords: ['沟通', '协作', '团队', '会议', '讨论', '分享'],
      description: '团队沟通和协作',
      baseScore: 70
    },
    '项目管理': {
      category: '项目管理',
      keywords: ['项目', '任务', '计划', '进度', '管理', '跟踪'],
      description: '项目和任务管理',
      baseScore: 75
    }
  };

  /**
   * 增强的描述分析
   */
  async analyzeDescription(description: string): Promise<EnhancedAnalysisResult> {
    const reasoning: ReActStep[] = [];
    
    // 步骤1: 思考分析策略
    reasoning.push({
      id: '1',
      type: 'reasoning',
      phase: 'intent_analysis',
      title: '分析策略',
      content: '开始分析用户描述，我需要从中提取关键信息来推断员工的职责、性格、工作风格和沟通特征。',
      timestamp: Date.now(),
      confidence: 0.9,
      status: 'completed'
    });

    // 步骤2: 文本预处理和关键词提取
    reasoning.push({
      id: '2',
      type: 'acting',
      phase: 'requirement_derivation',
      title: '关键词提取',
      content: '提取描述中的关键词和短语',
      timestamp: Date.now(),
      confidence: 0.85,
      status: 'completed'
    });

    const keywords = this.extractKeywords(description);
    
    reasoning.push({
      id: '3',
      type: 'reasoning',
      phase: 'requirement_derivation',
      title: '关键词分析',
      content: `提取到关键词: ${keywords.join(', ')}`,
      timestamp: Date.now(),
      confidence: 0.8,
      status: 'completed'
    });

    // 步骤3: 职责分析
    reasoning.push({
      id: '4',
      type: 'reasoning',
      phase: 'config_generation',
      title: '职责分析',
      content: '基于关键词分析可能的职责范围',
      timestamp: Date.now(),
      confidence: 0.85,
      status: 'completed'
    });

    const responsibilities = this.analyzeResponsibilities(description, keywords);
    const serviceScope = this.analyzeServiceScope(description, keywords);

    reasoning.push({
      id: '5',
      type: 'acting',
      phase: 'config_generation',
      title: '职责识别',
      content: `识别出 ${responsibilities.length} 项职责和 ${serviceScope.length} 个服务范围`,
      timestamp: Date.now(),
      confidence: 0.8,
      status: 'completed'
    });

    // 步骤4: 性格特征分析
    reasoning.push({
      id: '6',
      type: 'reasoning',
      phase: 'config_generation',
      title: '性格分析',
      content: '分析描述中体现的性格特征',
      timestamp: Date.now(),
      confidence: 0.75,
      status: 'completed'
    });

    const personalityTraits = this.analyzePersonalityTraits(description, keywords);

    reasoning.push({
      id: '7',
      type: 'acting',
      phase: 'config_generation',
      title: '性格识别',
      content: `识别出 ${personalityTraits.length} 个主要性格特征`,
      timestamp: Date.now(),
      confidence: 0.8,
      status: 'completed'
    });

    // 步骤5: 工作风格分析
    reasoning.push({
      id: '8',
      type: 'reasoning',
      phase: 'config_generation',
      title: '工作风格分析',
      content: '根据职责和描述推断工作风格',
      timestamp: Date.now(),
      confidence: 0.75,
      status: 'completed'
    });

    const workStyle = this.analyzeWorkStyle(description, keywords);

    reasoning.push({
      id: '9',
      type: 'acting',
      phase: 'config_generation',
      title: '工作风格确定',
      content: `确定工作风格为: ${workStyle.type}`,
      timestamp: Date.now(),
      confidence: 0.8,
      status: 'completed'
    });

    // 步骤6: 沟通风格分析
    reasoning.push({
      id: '10',
      type: 'reasoning',
      phase: 'config_generation',
      title: '沟通风格分析',
      content: '分析适合的沟通风格和特征',
      timestamp: Date.now(),
      confidence: 0.75,
      status: 'completed'
    });

    const communicationStyle = this.analyzeCommunicationStyle(description, keywords);

    reasoning.push({
      id: '11',
      type: 'acting',
      phase: 'config_generation',
      title: '沟通风格确定',
      content: `确定沟通风格为: ${communicationStyle.style}`,
      timestamp: Date.now(),
      confidence: 0.8,
      status: 'completed'
    });

    // 步骤7: 工具推荐
    reasoning.push({
      id: '12',
      type: 'reasoning',
      phase: 'optimization',
      title: '工具推荐',
      content: '基于职责和工作特点推荐合适的工具',
      timestamp: Date.now(),
      confidence: 0.85,
      status: 'completed'
    });

    const toolRecommendations = this.recommendTools(description, keywords, responsibilities);

    reasoning.push({
      id: '13',
      type: 'acting',
      phase: 'optimization',
      title: '工具匹配',
      content: `推荐了 ${toolRecommendations.length} 个工具`,
      timestamp: Date.now(),
      confidence: 0.9,
      status: 'completed'
    });

    // 步骤8: 计算置信度
    reasoning.push({
      id: '14',
      type: 'reasoning',
      phase: 'validation',
      title: '置信度评估',
      content: '评估分析结果的置信度',
      timestamp: Date.now(),
      confidence: 0.8,
      status: 'completed'
    });

    const confidenceScore = this.calculateConfidence(description, keywords, {
      personalityTraits,
      workStyle,
      communicationStyle,
      toolRecommendations
    });

    reasoning.push({
      id: '15',
      type: 'acting',
      phase: 'validation',
      title: '分析完成',
      content: `分析完成，置信度: ${confidenceScore}%`,
      timestamp: Date.now(),
      confidence: confidenceScore / 100,
      status: 'completed'
    });

    return {
      responsibilities,
      serviceScope,
      personalityTraits,
      workStyle,
      communicationStyle,
      toolRecommendations,
      reasoning,
      confidenceScore
    };
  }

  private extractKeywords(description: string): string[] {
    // 简单的关键词提取逻辑
    const text = description.toLowerCase();
    const keywords: string[] = [];

    // 从各个数据库中匹配关键词
    Object.values(this.personalityDatabase).forEach(trait => {
      trait.keywords.forEach(keyword => {
        if (text.includes(keyword.toLowerCase())) {
          keywords.push(keyword);
        }
      });
    });

    Object.values(this.workStyleDatabase).forEach(style => {
      style.keywords.forEach(keyword => {
        if (text.includes(keyword.toLowerCase())) {
          keywords.push(keyword);
        }
      });
    });

    Object.values(this.communicationDatabase).forEach(comm => {
      comm.keywords.forEach(keyword => {
        if (text.includes(keyword.toLowerCase())) {
          keywords.push(keyword);
        }
      });
    });

    return [...new Set(keywords)]; // 去重
  }

  private analyzeResponsibilities(description: string, keywords: string[]): string[] {
    const responsibilities: string[] = [];
    const text = description.toLowerCase();

    // 基于关键词和模式匹配推断职责
    if (keywords.some(k => ['客户', '服务', '咨询'].includes(k))) {
      responsibilities.push('处理客户咨询和服务请求');
      responsibilities.push('提供专业的产品和服务信息');
    }

    if (keywords.some(k => ['数据', '分析', '报告'].includes(k))) {
      responsibilities.push('收集和分析业务数据');
      responsibilities.push('生成数据报告和洞察');
    }

    if (keywords.some(k => ['技术', '支持', '解决'].includes(k))) {
      responsibilities.push('提供技术支持和问题解决');
      responsibilities.push('维护技术文档和知识库');
    }

    if (keywords.some(k => ['销售', '推荐', '商务'].includes(k))) {
      responsibilities.push('识别客户需求并推荐解决方案');
      responsibilities.push('协助完成销售流程');
    }

    if (keywords.some(k => ['管理', '协调', '组织'].includes(k))) {
      responsibilities.push('协调和管理相关业务流程');
      responsibilities.push('组织和安排工作任务');
    }

    // 如果没有匹配到特定职责，提供通用职责
    if (responsibilities.length === 0) {
      responsibilities.push('协助处理日常业务事务');
      responsibilities.push('提供信息查询和基础服务');
    }

    return responsibilities;
  }

  private analyzeServiceScope(description: string, keywords: string[]): string[] {
    const serviceScope: string[] = [];

    if (keywords.some(k => ['客户', '用户'].includes(k))) {
      serviceScope.push('客户服务支持');
    }

    if (keywords.some(k => ['内部', '员工', '团队'].includes(k))) {
      serviceScope.push('内部员工服务');
    }

    if (keywords.some(k => ['技术', '产品'].includes(k))) {
      serviceScope.push('技术产品支持');
    }

    if (keywords.some(k => ['销售', '市场'].includes(k))) {
      serviceScope.push('销售市场支持');
    }

    if (serviceScope.length === 0) {
      serviceScope.push('综合业务支持');
    }

    return serviceScope;
  }

  private analyzePersonalityTraits(description: string, keywords: string[]): PersonalityTrait[] {
    const traits: PersonalityTrait[] = [];

    Object.entries(this.personalityDatabase).forEach(([traitName, traitData]) => {
      const matchCount = traitData.keywords.filter(keyword => 
        keywords.includes(keyword)
      ).length;

      if (matchCount > 0) {
        const score = Math.min(100, traitData.score + (matchCount - 1) * 5);
        traits.push({
          name: traitName,
          description: traitData.description,
          score,
          reasoning: `基于关键词匹配: ${traitData.keywords.filter(k => keywords.includes(k)).join(', ')}`
        });
      }
    });

    // 按分数排序，取前5个
    return traits.sort((a, b) => b.score - a.score).slice(0, 5);
  }

  private analyzeWorkStyle(description: string, keywords: string[]): WorkStyle {
    let bestMatch: { style: string; data: any; score: number } = {
      style: '协作型',
      data: this.workStyleDatabase['协作型'],
      score: 0
    };

    Object.entries(this.workStyleDatabase).forEach(([styleName, styleData]) => {
      const matchCount = styleData.keywords.filter(keyword => 
        keywords.includes(keyword)
      ).length;

      if (matchCount > bestMatch.score) {
        bestMatch = { style: styleName, data: styleData, score: matchCount };
      }
    });

    return {
      type: bestMatch.style,
      description: bestMatch.data.description,
      characteristics: bestMatch.data.characteristics,
      score: Math.min(100, 60 + bestMatch.score * 10)
    };
  }

  private analyzeCommunicationStyle(description: string, keywords: string[]): CommunicationStyle {
    let bestMatch: { style: string; data: any; score: number } = {
      style: '友好亲切',
      data: this.communicationDatabase['友好亲切'],
      score: 0
    };

    Object.entries(this.communicationDatabase).forEach(([styleName, styleData]) => {
      const matchCount = styleData.keywords.filter(keyword => 
        keywords.includes(keyword)
      ).length;

      if (matchCount > bestMatch.score) {
        bestMatch = { style: styleName, data: styleData, score: matchCount };
      }
    });

    return {
      style: bestMatch.style,
      tone: bestMatch.data.tone,
      formality: bestMatch.data.formality,
      characteristics: bestMatch.data.characteristics,
      score: Math.min(100, 60 + bestMatch.score * 10)
    };
  }

  private recommendTools(description: string, keywords: string[], responsibilities: string[]): ToolRecommendation[] {
    const recommendations: ToolRecommendation[] = [];

    Object.entries(this.toolDatabase).forEach(([toolName, toolData]) => {
      const keywordMatches = toolData.keywords.filter(keyword => 
        keywords.includes(keyword)
      ).length;

      const responsibilityMatches = responsibilities.filter(resp =>
        toolData.keywords.some(keyword => resp.toLowerCase().includes(keyword))
      ).length;

      const totalMatches = keywordMatches + responsibilityMatches;

      if (totalMatches > 0) {
        const relevanceScore = Math.min(100, toolData.baseScore + totalMatches * 5);
        
        recommendations.push({
          toolName,
          category: toolData.category,
          description: toolData.description,
          relevanceScore,
          reasoning: `基于 ${keywordMatches} 个关键词匹配和 ${responsibilityMatches} 个职责匹配`,
          configuration: this.generateToolConfiguration(toolName, keywords)
        });
      }
    });

    // 按相关性分数排序，取前6个
    return recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 6);
  }

  private generateToolConfiguration(toolName: string, keywords: string[]): Record<string, any> {
    // 根据工具类型生成基础配置
    const configs: Record<string, any> = {
      '知识库管理': {
        searchDepth: keywords.includes('详细') ? 'deep' : 'standard',
        responseFormat: keywords.includes('简洁') ? 'brief' : 'detailed'
      },
      '客户关系管理': {
        responseTime: keywords.includes('快速') ? 'immediate' : 'standard',
        personalizedService: keywords.includes('个性化') || keywords.includes('定制')
      },
      '数据分析工具': {
        analysisLevel: keywords.includes('深入') ? 'advanced' : 'basic',
        visualizationEnabled: true
      }
    };

    return configs[toolName] || {};
  }

  private calculateConfidence(
    description: string, 
    keywords: string[], 
    results: {
      personalityTraits: PersonalityTrait[];
      workStyle: WorkStyle;
      communicationStyle: CommunicationStyle;
      toolRecommendations: ToolRecommendation[];
    }
  ): number {
    let confidence = 50; // 基础置信度

    // 描述长度影响置信度
    if (description.length > 100) confidence += 10;
    if (description.length > 200) confidence += 10;

    // 关键词数量影响置信度
    confidence += Math.min(20, keywords.length * 2);

    // 匹配结果的质量影响置信度
    if (results.personalityTraits.length > 0) {
      confidence += Math.min(10, results.personalityTraits[0].score / 10);
    }

    if (results.workStyle.score > 70) confidence += 5;
    if (results.communicationStyle.score > 70) confidence += 5;

    return Math.min(100, Math.round(confidence));
  }
}

export const enhancedAnalysisService = new EnhancedAnalysisService();