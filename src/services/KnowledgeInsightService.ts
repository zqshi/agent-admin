/**
 * 知识洞察分析服务
 * 实现创新意识和能力缺失的深度分析
 */

import type {
  KnowledgeInsightReport,
  InnovationInsight,
  CapabilityGapAnalysis,
  KnowledgePatternInsight,
  InsightAnalysisConfig,
  KnowledgeQualityAssessment,
  SmartRecommendation,
  InsightAnalysisState,
  InnovationType,
  CapabilityGapType,
  ConfidenceLevel,
  ImpactLevel,
  UrgencyLevel
} from '../types/knowledge-insights';
import type { DigitalEmployee, KnowledgeDocument, FAQItem, LearnedKnowledge } from '../types/employee';

// 文本分析工具类
class TextAnalyzer {
  // 提取关键词 (简化的TF-IDF实现)
  static extractKeywords(text: string, maxKeywords: number = 10): { word: string; score: number }[] {
    const words = text.toLowerCase()
      .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 1);

    const termFreq: Record<string, number> = {};
    words.forEach(word => {
      termFreq[word] = (termFreq[word] || 0) + 1;
    });

    // 简化的IDF计算（实际应用中需要更大的语料库）
    const totalWords = words.length;
    const keywords = Object.entries(termFreq)
      .map(([word, freq]) => ({
        word,
        score: (freq / totalWords) * Math.log(totalWords / freq)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, maxKeywords);

    return keywords;
  }

  // 计算文本相似度 (基于Jaccard相似度)
  static calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  // 检测创新相关词汇
  static detectInnovationKeywords(text: string): { type: InnovationType; score: number }[] {
    const innovationPatterns: Record<InnovationType, string[]> = {
      tech_innovation: ['技术', '算法', '人工智能', 'AI', '机器学习', '深度学习', '自动化', '数字化'],
      process_innovation: ['流程', '优化', '改进', '效率', '自动化', '标准化', '精简', '重构'],
      service_innovation: ['服务', '体验', '客户', '用户', '界面', '交互', '个性化', '定制'],
      business_innovation: ['商业模式', '盈利', '市场', '策略', '商机', '价值', '创收', '变现'],
      cross_domain: ['跨领域', '融合', '整合', '协同', '结合', '多元', '综合', '交叉'],
      creative_thinking: ['创意', '创新', '创造', '想象', '灵感', '突破', '颠覆', '原创']
    };

    const results: { type: InnovationType; score: number }[] = [];
    const textLower = text.toLowerCase();

    for (const [type, keywords] of Object.entries(innovationPatterns)) {
      let score = 0;
      keywords.forEach(keyword => {
        const matches = (textLower.match(new RegExp(keyword, 'g')) || []).length;
        score += matches * (keyword.length / text.length) * 100;
      });

      if (score > 0) {
        results.push({ type: type as InnovationType, score });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  // 检测能力缺失指标
  static detectCapabilityGaps(content: string, interactions: any[] = []): { type: CapabilityGapType; indicators: string[] }[] {
    const gapPatterns: Record<CapabilityGapType, { keywords: string[]; contextKeywords: string[] }> = {
      knowledge_gap: {
        keywords: ['不知道', '不清楚', '不了解', '没听说过', '不熟悉'],
        contextKeywords: ['概念', '知识', '理论', '原理', '定义']
      },
      skill_gap: {
        keywords: ['不会', '不能', '无法', '做不到', '没学过'],
        contextKeywords: ['操作', '使用', '执行', '实现', '处理']
      },
      information_access: {
        keywords: ['找不到', '没有资料', '缺少信息', '无法获取', '资源不足'],
        contextKeywords: ['文档', '资料', '信息', '数据', '参考']
      },
      learning_ability: {
        keywords: ['学不会', '理解困难', '掌握慢', '记不住', '容易忘记'],
        contextKeywords: ['学习', '掌握', '理解', '记忆', '应用']
      },
      analytical_thinking: {
        keywords: ['分析不出', '想不明白', '搞不清楚', '理不清', '判断不了'],
        contextKeywords: ['分析', '推理', '判断', '逻辑', '思考']
      },
      problem_solving: {
        keywords: ['解决不了', '没办法', '束手无策', '困难重重', '无从下手'],
        contextKeywords: ['问题', '解决', '方案', '办法', '策略']
      }
    };

    const results: { type: CapabilityGapType; indicators: string[] }[] = [];

    for (const [type, patterns] of Object.entries(gapPatterns)) {
      const indicators: string[] = [];

      patterns.keywords.forEach(keyword => {
        if (content.includes(keyword)) {
          indicators.push(`检测到关键词: ${keyword}`);
        }
      });

      // 检查上下文相关性
      let contextRelevance = 0;
      patterns.contextKeywords.forEach(contextKeyword => {
        if (content.includes(contextKeyword)) {
          contextRelevance++;
        }
      });

      if (indicators.length > 0 && contextRelevance > 0) {
        indicators.push(`上下文相关度: ${contextRelevance}/${patterns.contextKeywords.length}`);
        results.push({ type: type as CapabilityGapType, indicators });
      }
    }

    return results;
  }
}

// 模式识别引擎
class PatternRecognizer {
  // 识别使用模式
  static identifyUsagePatterns(documents: KnowledgeDocument[], faqs: FAQItem[]): KnowledgePatternInsight[] {
    const patterns: KnowledgePatternInsight[] = [];

    // 分析文档类型分布模式
    const typeDistribution = documents.reduce((acc, doc) => {
      acc[doc.type] = (acc[doc.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    if (Object.keys(typeDistribution).length > 1) {
      patterns.push({
        id: `pattern-${Date.now()}-doc-types`,
        patternType: 'usage',
        title: '文档类型多样化模式',
        description: `识别到${Object.keys(typeDistribution).length}种不同类型的文档，显示知识来源的多元化`,
        patternCharacteristics: {
          frequency: Math.max(...Object.values(typeDistribution)),
          consistency: this.calculateConsistency(Object.values(typeDistribution)),
          strength: Object.keys(typeDistribution).length / 10, // 标准化到0-1
          stability: 0.8 // 假设值
        },
        relatedEntities: {
          documents: documents.map(d => d.id),
          faqs: [],
          concepts: Object.keys(typeDistribution),
          timeRanges: [{
            start: new Date(Math.min(...documents.map(d => new Date(d.uploadedAt).getTime()))),
            end: new Date()
          }]
        },
        trendData: {
          direction: 'increasing',
          magnitude: 0.7,
          acceleration: 0.5,
          predictedContinuation: 75
        },
        implications: [
          '知识来源渠道丰富',
          '信息获取方式多样化',
          '学习资源配置合理'
        ],
        recommendations: [
          '保持多元化的知识输入',
          '建立不同类型文档的标准化处理流程',
          '优化各类型文档的利用效率'
        ],
        confidence: 'high',
        generatedAt: new Date()
      });
    }

    // 分析FAQ使用频率模式
    const faqUsagePattern = this.analyzeFAQUsagePattern(faqs);
    if (faqUsagePattern) {
      patterns.push(faqUsagePattern);
    }

    return patterns;
  }

  private static calculateConsistency(values: number[]): number {
    if (values.length <= 1) return 1;

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);

    // 标准化一致性分数 (CV的倒数)
    const coefficientOfVariation = standardDeviation / mean;
    return Math.max(0, 1 - coefficientOfVariation);
  }

  private static analyzeFAQUsagePattern(faqs: FAQItem[]): KnowledgePatternInsight | null {
    if (faqs.length === 0) return null;

    const usageCounts = faqs.map(f => f.usageCount);
    const totalUsage = usageCounts.reduce((sum, count) => sum + count, 0);
    const avgUsage = totalUsage / faqs.length;

    const highUsageFaqs = faqs.filter(f => f.usageCount > avgUsage * 1.5);
    const lowUsageFaqs = faqs.filter(f => f.usageCount < avgUsage * 0.5);

    return {
      id: `pattern-${Date.now()}-faq-usage`,
      patternType: 'usage',
      title: 'FAQ使用分布模式',
      description: `识别到明显的FAQ使用偏好，${highUsageFaqs.length}个高频FAQ，${lowUsageFaqs.length}个低频FAQ`,
      patternCharacteristics: {
        frequency: Math.max(...usageCounts),
        consistency: this.calculateConsistency(usageCounts),
        strength: (highUsageFaqs.length + lowUsageFaqs.length) / faqs.length,
        stability: 0.7
      },
      relatedEntities: {
        documents: [],
        faqs: faqs.map(f => f.id),
        concepts: [...new Set(faqs.flatMap(f => f.tags))],
        timeRanges: [{ start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() }]
      },
      trendData: {
        direction: totalUsage > faqs.length * 10 ? 'increasing' : 'stable',
        magnitude: 0.6,
        acceleration: 0.3,
        predictedContinuation: 70
      },
      implications: [
        '存在明显的知识获取偏好',
        '部分FAQ可能需要优化或合并',
        '高频FAQ反映核心业务需求'
      ],
      recommendations: [
        '优化低使用率FAQ的可发现性',
        '分析高频FAQ的成功因素',
        '考虑将高频FAQ转化为自动化回复'
      ],
      confidence: 'medium',
      generatedAt: new Date()
    };
  }
}

// 主要服务类
export class KnowledgeInsightService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly cacheExpiry = 30 * 60 * 1000; // 30分钟缓存

  /**
   * 生成综合洞察报告
   */
  async generateInsightReport(
    employee: DigitalEmployee,
    config?: Partial<InsightAnalysisConfig>
  ): Promise<KnowledgeInsightReport> {
    const cacheKey = `insight-report-${employee.id}`;
    const cached = this.getCachedResult<KnowledgeInsightReport>(cacheKey);
    if (cached) return cached;

    const fullConfig = this.buildConfig(config);
    const { knowledgeBase } = employee;

    // 并行执行各种分析
    const [
      innovationInsights,
      capabilityGaps,
      knowledgePatterns,
      qualityAssessment
    ] = await Promise.all([
      this.analyzeInnovationPotential(knowledgeBase, fullConfig),
      this.analyzeCapabilityGaps(knowledgeBase, fullConfig),
      this.identifyKnowledgePatterns(knowledgeBase, fullConfig),
      this.assessKnowledgeQuality(knowledgeBase)
    ]);

    const report: KnowledgeInsightReport = {
      id: `report-${Date.now()}-${employee.id}`,
      employeeId: employee.id,
      reportType: 'comprehensive',
      summary: {
        totalInsights: innovationInsights.length + capabilityGaps.length + knowledgePatterns.length,
        highPriorityInsights: [...innovationInsights, ...capabilityGaps].filter(i => i.impact === 'high' || i.impact === 'critical').length,
        innovationScore: this.calculateInnovationScore(innovationInsights),
        capabilityScore: this.calculateCapabilityScore(capabilityGaps),
        overallHealthScore: qualityAssessment.overallScore
      },
      innovationInsights,
      capabilityGaps,
      knowledgePatterns,
      comprehensiveAnalysis: this.generateComprehensiveAnalysis(innovationInsights, capabilityGaps, knowledgePatterns),
      predictions: this.generatePredictions(innovationInsights, capabilityGaps, knowledgePatterns),
      generatedAt: new Date(),
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24小时有效期
      confidence: 'high',
      metadata: {
        analysisVersion: '2.0.0',
        dataSourcesCount: knowledgeBase.documents.length + knowledgeBase.faqItems.length + (knowledgeBase.autoLearnedItems?.length || 0),
        processingTime: 0, // 将在实际实现中填充
        algorithmConfig: fullConfig.algorithmSettings
      }
    };

    this.setCacheResult(cacheKey, report);
    return report;
  }

  /**
   * 分析创新潜力
   */
  private async analyzeInnovationPotential(
    knowledgeBase: any,
    config: InsightAnalysisConfig
  ): Promise<InnovationInsight[]> {
    const insights: InnovationInsight[] = [];

    // 合并所有文本内容进行分析
    const allContent = [
      ...knowledgeBase.documents.map((doc: KnowledgeDocument) => doc.extractedContent || ''),
      ...knowledgeBase.faqItems.map((faq: FAQItem) => `${faq.question} ${faq.answer}`),
      ...(knowledgeBase.autoLearnedItems || []).map((item: LearnedKnowledge) => item.content)
    ].join(' ');

    if (!allContent.trim()) return insights;

    // 检测创新关键词
    const innovationDetections = TextAnalyzer.detectInnovationKeywords(allContent);

    for (const detection of innovationDetections.slice(0, config.outputSettings.maxInsightsPerType)) {
      if (detection.score >= config.algorithmSettings.innovationDetectionThreshold) {
        const insight = await this.buildInnovationInsight(detection, knowledgeBase, allContent);
        insights.push(insight);
      }
    }

    // 如果没有检测到明显的创新内容，生成通用创新建议
    if (insights.length === 0) {
      insights.push(this.generateGenericInnovationInsight(knowledgeBase));
    }

    return insights;
  }

  /**
   * 构建创新洞察
   */
  private async buildInnovationInsight(
    detection: { type: InnovationType; score: number },
    knowledgeBase: any,
    content: string
  ): Promise<InnovationInsight> {
    const innovationTypeLabels: Record<InnovationType, string> = {
      tech_innovation: '技术创新',
      process_innovation: '流程创新',
      service_innovation: '服务创新',
      business_innovation: '商业模式创新',
      cross_domain: '跨领域融合',
      creative_thinking: '创意思维'
    };

    return {
      id: `innovation-${Date.now()}-${detection.type}`,
      type: detection.type,
      title: `${innovationTypeLabels[detection.type]}机会识别`,
      description: `基于知识库内容分析，发现了${innovationTypeLabels[detection.type]}的潜在机会`,
      detailedAnalysis: this.generateInnovationAnalysis(detection.type, content),
      metrics: {
        innovationPotential: Math.min(detection.score * 2, 100),
        creativityIndex: this.calculateCreativityIndex(content),
        crossDomainCapability: this.calculateCrossDomainCapability(knowledgeBase),
        implementationFeasibility: this.calculateImplementationFeasibility(detection.type, knowledgeBase)
      },
      knowledgeSources: this.identifyRelevantSources(detection.type, knowledgeBase),
      opportunities: this.generateInnovationOpportunities(detection.type),
      actionRecommendations: this.generateInnovationActions(detection.type),
      confidence: detection.score > 50 ? 'high' : detection.score > 25 ? 'medium' : 'low',
      impact: detection.score > 70 ? 'high' : detection.score > 40 ? 'moderate' : 'low',
      generatedAt: new Date(),
      lastUpdated: new Date(),
      tags: [innovationTypeLabels[detection.type], '创新机会', '潜力分析']
    };
  }

  /**
   * 分析能力缺失
   */
  private async analyzeCapabilityGaps(
    knowledgeBase: any,
    config: InsightAnalysisConfig
  ): Promise<CapabilityGapAnalysis[]> {
    const gaps: CapabilityGapAnalysis[] = [];

    // 分析所有内容中的能力缺失指标
    const allContent = [
      ...knowledgeBase.faqItems.map((faq: FAQItem) => `Q: ${faq.question} A: ${faq.answer}`),
      ...(knowledgeBase.autoLearnedItems || []).map((item: LearnedKnowledge) => item.content)
    ].join('\n');

    const gapDetections = TextAnalyzer.detectCapabilityGaps(allContent);

    for (const detection of gapDetections.slice(0, config.outputSettings.maxInsightsPerType)) {
      const gap = await this.buildCapabilityGapAnalysis(detection, knowledgeBase);
      gaps.push(gap);
    }

    // 通过知识库结构分析隐含的缺失
    const structuralGaps = this.analyzeStructuralGaps(knowledgeBase);
    gaps.push(...structuralGaps.slice(0, Math.max(0, config.outputSettings.maxInsightsPerType - gaps.length)));

    return gaps;
  }

  /**
   * 构建能力缺失分析
   */
  private async buildCapabilityGapAnalysis(
    detection: { type: CapabilityGapType; indicators: string[] },
    knowledgeBase: any
  ): Promise<CapabilityGapAnalysis> {
    const gapTypeLabels: Record<CapabilityGapType, string> = {
      knowledge_gap: '知识空白',
      skill_gap: '技能不足',
      information_access: '信息获取能力',
      learning_ability: '学习能力',
      analytical_thinking: '分析思维',
      problem_solving: '问题解决'
    };

    const severityScore = this.calculateGapSeverity(detection, knowledgeBase);

    return {
      id: `gap-${Date.now()}-${detection.type}`,
      type: detection.type,
      title: `${gapTypeLabels[detection.type]}缺失分析`,
      description: `检测到${gapTypeLabels[detection.type]}方面的不足，需要重点关注`,
      detailedAnalysis: this.generateGapDetailedAnalysis(detection.type, detection.indicators),
      gapMetrics: {
        severityScore,
        frequencyImpact: this.calculateFrequencyImpact(detection.indicators),
        businessImpact: this.calculateBusinessImpact(detection.type),
        learningDifficulty: this.calculateLearningDifficulty(detection.type)
      },
      gapManifestations: this.generateGapManifestations(detection.type, detection.indicators),
      rootCauses: this.identifyRootCauses(detection.type, knowledgeBase),
      improvementPath: this.generateImprovementPath(detection.type),
      learningRecommendations: this.generateLearningRecommendations(detection.type, knowledgeBase),
      confidence: detection.indicators.length > 2 ? 'high' : 'medium',
      urgency: severityScore > 80 ? 'urgent' : severityScore > 60 ? 'high' : 'medium',
      impact: severityScore > 75 ? 'critical' : severityScore > 50 ? 'high' : 'moderate',
      generatedAt: new Date(),
      lastUpdated: new Date(),
      tags: [gapTypeLabels[detection.type], '能力缺失', '改进建议']
    };
  }

  /**
   * 识别知识模式
   */
  private async identifyKnowledgePatterns(
    knowledgeBase: any,
    config: InsightAnalysisConfig
  ): Promise<KnowledgePatternInsight[]> {
    return PatternRecognizer.identifyUsagePatterns(
      knowledgeBase.documents,
      knowledgeBase.faqItems
    );
  }

  /**
   * 评估知识质量
   */
  private async assessKnowledgeQuality(knowledgeBase: any): Promise<KnowledgeQualityAssessment> {
    const documents = knowledgeBase.documents || [];
    const faqs = knowledgeBase.faqItems || [];
    const learnedItems = knowledgeBase.autoLearnedItems || [];

    // 计算各维度得分
    const completeness = this.assessCompleteness(documents, faqs, learnedItems);
    const accuracy = this.assessAccuracy(faqs, learnedItems);
    const relevance = this.assessRelevance(documents, faqs);
    const timeliness = this.assessTimeliness(documents, faqs, learnedItems);
    const accessibility = this.assessAccessibility(documents, faqs);
    const usability = this.assessUsability(faqs, learnedItems);

    const dimensions = {
      completeness,
      accuracy,
      relevance,
      timeliness,
      accessibility,
      usability
    };

    const overallScore = Object.values(dimensions).reduce((sum, score) => sum + score, 0) / Object.keys(dimensions).length;

    return {
      overallScore: Math.round(overallScore),
      dimensions: Object.fromEntries(
        Object.entries(dimensions).map(([key, value]) => [key, Math.round(value)])
      ) as typeof dimensions,
      issuesIdentified: this.identifyQualityIssues(dimensions, documents, faqs, learnedItems)
    };
  }

  // 辅助方法实现

  private buildConfig(config?: Partial<InsightAnalysisConfig>): InsightAnalysisConfig {
    return {
      analysisScope: {
        includeDocuments: true,
        includeFAQs: true,
        includeLearnedKnowledge: true,
        includeMemoryData: false,
        ...config?.analysisScope
      },
      algorithmSettings: {
        innovationDetectionThreshold: 20,
        gapDetectionSensitivity: 0.5,
        patternMinimumSupport: 0.3,
        confidenceThreshold: 0.7,
        ...config?.algorithmSettings
      },
      outputSettings: {
        maxInsightsPerType: 5,
        includeDetailedAnalysis: true,
        includeActionPlans: true,
        language: 'zh-CN',
        ...config?.outputSettings
      }
    };
  }

  private getCachedResult<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data as T;
    }
    return null;
  }

  private setCacheResult(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private calculateInnovationScore(insights: InnovationInsight[]): number {
    if (insights.length === 0) return 0;
    return Math.round(
      insights.reduce((sum, insight) => sum + insight.metrics.innovationPotential, 0) / insights.length
    );
  }

  private calculateCapabilityScore(gaps: CapabilityGapAnalysis[]): number {
    if (gaps.length === 0) return 100;
    const avgSeverity = gaps.reduce((sum, gap) => sum + gap.gapMetrics.severityScore, 0) / gaps.length;
    return Math.round(100 - avgSeverity);
  }

  private generateComprehensiveAnalysis(
    innovations: InnovationInsight[],
    gaps: CapabilityGapAnalysis[],
    patterns: KnowledgePatternInsight[]
  ) {
    return {
      strengthAreas: this.identifyStrengthAreas(innovations, patterns),
      improvementAreas: this.identifyImprovementAreas(gaps),
      criticalActions: this.identifyCriticalActions(gaps, innovations),
      strategicRecommendations: this.generateStrategicRecommendations(innovations, gaps, patterns)
    };
  }

  private generatePredictions(
    innovations: InnovationInsight[],
    gaps: CapabilityGapAnalysis[],
    patterns: KnowledgePatternInsight[]
  ) {
    return [
      {
        timeline: '1month' as const,
        expectedChanges: ['短期能力提升', '知识结构优化'],
        riskFactors: ['学习负荷过重', '注意力分散'],
        opportunities: ['快速技能获取', '即时问题解决']
      },
      {
        timeline: '3months' as const,
        expectedChanges: ['系统性知识建构', '创新思维发展'],
        riskFactors: ['知识老化', '技术变迁'],
        opportunities: ['专业深度提升', '跨域能力培养']
      },
      {
        timeline: '6months' as const,
        expectedChanges: ['专业领域突破', '独立创新能力'],
        riskFactors: ['市场需求变化', '技术路线调整'],
        opportunities: ['行业影响力', '创新成果产出']
      }
    ];
  }

  // 更多辅助方法的简化实现...
  private generateInnovationAnalysis(type: InnovationType, content: string): string {
    const analysisTemplates: Record<InnovationType, string> = {
      tech_innovation: '通过知识库内容分析，发现了多个技术创新相关的概念和应用场景。建议重点关注新兴技术的学习和应用。',
      process_innovation: '识别到流程优化和改进的相关内容，存在进一步提升效率和简化流程的潜力。',
      service_innovation: '在服务创新方面显示出良好的理解基础，可以考虑从用户体验角度进行创新。',
      business_innovation: '具备一定的商业思维基础，建议加强商业模式创新的学习和实践。',
      cross_domain: '显示出跨领域思维的迹象，这是创新的重要能力，建议继续拓展知识广度。',
      creative_thinking: '创意思维能力有待提升，建议通过多样化的学习资源培养创新意识。'
    };
    return analysisTemplates[type];
  }

  private calculateCreativityIndex(content: string): number {
    // 简化的创造力指数计算
    const creativeWords = ['创新', '创意', '想象', '突破', '原创', '独特'];
    let score = 0;
    creativeWords.forEach(word => {
      score += (content.match(new RegExp(word, 'g')) || []).length * 10;
    });
    return Math.min(score, 100);
  }

  private calculateCrossDomainCapability(knowledgeBase: any): number {
    const uniqueTags = new Set([
      ...knowledgeBase.documents.flatMap((doc: any) => doc.tags || []),
      ...knowledgeBase.faqItems.flatMap((faq: any) => faq.tags || [])
    ]);
    return Math.min(uniqueTags.size * 5, 100);
  }

  private calculateImplementationFeasibility(type: InnovationType, knowledgeBase: any): number {
    // 基于现有知识基础评估实现可行性
    const resourceCount = knowledgeBase.documents.length + knowledgeBase.faqItems.length;
    const baseScore = Math.min(resourceCount * 2, 80);

    const typeMultipliers: Record<InnovationType, number> = {
      tech_innovation: 0.8,
      process_innovation: 1.2,
      service_innovation: 1.0,
      business_innovation: 0.9,
      cross_domain: 0.7,
      creative_thinking: 0.6
    };

    return Math.round(baseScore * typeMultipliers[type]);
  }

  private identifyRelevantSources(type: InnovationType, knowledgeBase: any) {
    // 简化实现，返回所有源的ID
    return {
      documentIds: knowledgeBase.documents.map((doc: any) => doc.id),
      faqIds: knowledgeBase.faqItems.map((faq: any) => faq.id),
      learnedKnowledgeIds: (knowledgeBase.autoLearnedItems || []).map((item: any) => item.id),
      relevanceScores: {}
    };
  }

  private generateInnovationOpportunities(type: InnovationType) {
    const opportunityTemplates: Record<InnovationType, any[]> = {
      tech_innovation: [
        {
          title: '新技术应用机会',
          description: '探索最新技术在现有业务中的应用可能',
          potentialValue: 85,
          riskLevel: 'medium' as const,
          requiredResources: ['技术研究', '原型开发', '测试验证']
        }
      ],
      process_innovation: [
        {
          title: '流程自动化优化',
          description: '通过自动化工具提升工作效率',
          potentialValue: 75,
          riskLevel: 'low' as const,
          requiredResources: ['流程分析', '工具选择', '培训实施']
        }
      ],
      service_innovation: [
        {
          title: '服务体验提升',
          description: '从用户角度重新设计服务流程',
          potentialValue: 80,
          riskLevel: 'low' as const,
          requiredResources: ['用户调研', '体验设计', '服务升级']
        }
      ],
      business_innovation: [
        {
          title: '商业模式探索',
          description: '基于现有能力探索新的商业机会',
          potentialValue: 90,
          riskLevel: 'high' as const,
          requiredResources: ['市场调研', '商业规划', '资源投入']
        }
      ],
      cross_domain: [
        {
          title: '跨领域整合',
          description: '整合不同领域的知识创造新的价值',
          potentialValue: 85,
          riskLevel: 'medium' as const,
          requiredResources: ['知识整合', '团队协作', '方案验证']
        }
      ],
      creative_thinking: [
        {
          title: '创意思维培养',
          description: '通过系统训练提升创新思维能力',
          potentialValue: 70,
          riskLevel: 'low' as const,
          requiredResources: ['思维训练', '实践项目', '反馈改进']
        }
      ]
    };

    return opportunityTemplates[type] || [];
  }

  private generateInnovationActions(type: InnovationType) {
    return [
      {
        priority: 'high' as const,
        action: `加强${type}相关知识的系统学习`,
        expectedOutcome: '提升创新能力和实践水平',
        timeline: '1-3个月',
        resources: ['学习资料', '实践机会', '专家指导']
      }
    ];
  }

  private generateGenericInnovationInsight(knowledgeBase: any): InnovationInsight {
    return {
      id: `innovation-generic-${Date.now()}`,
      type: 'creative_thinking',
      title: '创新思维发展机会',
      description: '当前知识库为创新发展提供了良好基础，建议加强创新思维培养',
      detailedAnalysis: '基于现有知识资源，具备发展创新能力的潜力。建议通过系统性学习和实践提升创新思维。',
      metrics: {
        innovationPotential: 60,
        creativityIndex: 45,
        crossDomainCapability: this.calculateCrossDomainCapability(knowledgeBase),
        implementationFeasibility: 75
      },
      knowledgeSources: this.identifyRelevantSources('creative_thinking', knowledgeBase),
      opportunities: this.generateInnovationOpportunities('creative_thinking'),
      actionRecommendations: this.generateInnovationActions('creative_thinking'),
      confidence: 'medium',
      impact: 'moderate',
      generatedAt: new Date(),
      lastUpdated: new Date(),
      tags: ['创新思维', '发展机会', '潜力分析']
    };
  }

  // 更多方法的简化实现...
  private analyzeStructuralGaps(knowledgeBase: any): CapabilityGapAnalysis[] {
    const gaps: CapabilityGapAnalysis[] = [];

    // 检查文档数量是否过少
    if (knowledgeBase.documents.length < 5) {
      gaps.push(this.createStructuralGap('knowledge_gap', '知识库文档不足', knowledgeBase));
    }

    // 检查FAQ质量
    const lowConfidenceFAQs = knowledgeBase.faqItems.filter((faq: FAQItem) => faq.confidence < 0.7);
    if (lowConfidenceFAQs.length > knowledgeBase.faqItems.length * 0.3) {
      gaps.push(this.createStructuralGap('information_access', 'FAQ置信度偏低', knowledgeBase));
    }

    return gaps;
  }

  private createStructuralGap(type: CapabilityGapType, title: string, knowledgeBase: any): CapabilityGapAnalysis {
    return {
      id: `structural-gap-${Date.now()}-${type}`,
      type,
      title,
      description: `通过结构化分析发现的${title}问题`,
      detailedAnalysis: this.generateGapDetailedAnalysis(type, [`结构化分析发现: ${title}`]),
      gapMetrics: {
        severityScore: 60,
        frequencyImpact: 70,
        businessImpact: this.calculateBusinessImpact(type),
        learningDifficulty: this.calculateLearningDifficulty(type)
      },
      gapManifestations: this.generateGapManifestations(type, [`结构化分析: ${title}`]),
      rootCauses: this.identifyRootCauses(type, knowledgeBase),
      improvementPath: this.generateImprovementPath(type),
      learningRecommendations: this.generateLearningRecommendations(type, knowledgeBase),
      confidence: 'medium',
      urgency: 'medium',
      impact: 'moderate',
      generatedAt: new Date(),
      lastUpdated: new Date(),
      tags: [title, '结构化分析', '系统优化']
    };
  }

  // 简化的辅助方法实现
  private calculateGapSeverity(detection: any, knowledgeBase: any): number {
    return Math.min(detection.indicators.length * 25, 100);
  }

  private calculateFrequencyImpact(indicators: string[]): number {
    return Math.min(indicators.length * 20, 100);
  }

  private calculateBusinessImpact(type: CapabilityGapType): number {
    const impacts: Record<CapabilityGapType, number> = {
      knowledge_gap: 80,
      skill_gap: 85,
      information_access: 75,
      learning_ability: 70,
      analytical_thinking: 90,
      problem_solving: 95
    };
    return impacts[type];
  }

  private calculateLearningDifficulty(type: CapabilityGapType): number {
    const difficulties: Record<CapabilityGapType, number> = {
      knowledge_gap: 60,
      skill_gap: 70,
      information_access: 50,
      learning_ability: 80,
      analytical_thinking: 85,
      problem_solving: 75
    };
    return difficulties[type];
  }

  private generateGapDetailedAnalysis(type: CapabilityGapType, indicators: string[]): string {
    return `检测到${type}方面的不足，主要表现为：${indicators.join('；')}。建议采取针对性的改进措施。`;
  }

  private generateGapManifestations(type: CapabilityGapType, indicators: string[]) {
    return [
      {
        scenario: '日常工作场景',
        observedBehavior: indicators[0] || '表现不足',
        expectedBehavior: '期望达到的标准表现',
        impactDescription: '对工作效率和质量的影响',
        frequency: indicators.length
      }
    ];
  }

  private identifyRootCauses(type: CapabilityGapType, knowledgeBase: any) {
    return [
      {
        category: 'knowledge' as const,
        description: '相关领域知识储备不足',
        contributionWeight: 60
      },
      {
        category: 'tool' as const,
        description: '缺乏有效的工具和方法',
        contributionWeight: 30
      }
    ];
  }

  private generateImprovementPath(type: CapabilityGapType) {
    return [
      {
        stage: 1,
        milestone: '基础能力建设',
        requiredActions: ['知识学习', '技能训练', '实践应用'],
        estimatedDuration: '1-2个月',
        successCriteria: ['掌握基础概念', '能够简单应用'],
        resources: ['学习资料', '练习题目', '指导老师']
      }
    ];
  }

  private generateLearningRecommendations(type: CapabilityGapType, knowledgeBase: any) {
    return [
      {
        type: 'document' as const,
        title: '相关文档学习',
        description: '系统学习相关领域的核心文档',
        priority: 1,
        estimatedEffort: '2-4周',
        expectedBenefit: '建立基础知识框架'
      }
    ];
  }

  // 质量评估相关方法
  private assessCompleteness(documents: any[], faqs: any[], learnedItems: any[]): number {
    const totalResources = documents.length + faqs.length + learnedItems.length;
    // 假设50个资源为完整标准
    return Math.min((totalResources / 50) * 100, 100);
  }

  private assessAccuracy(faqs: any[], learnedItems: any[]): number {
    const allItems = [...faqs, ...learnedItems];
    if (allItems.length === 0) return 100;

    const avgConfidence = allItems.reduce((sum, item) => {
      return sum + (item.confidence || 0.8);
    }, 0) / allItems.length;

    return avgConfidence * 100;
  }

  private assessRelevance(documents: any[], faqs: any[]): number {
    // 基于标签多样性评估相关性
    const uniqueTags = new Set([
      ...documents.flatMap(doc => doc.tags || []),
      ...faqs.flatMap(faq => faq.tags || [])
    ]);
    return Math.min(uniqueTags.size * 3, 100);
  }

  private assessTimeliness(documents: any[], faqs: any[], learnedItems: any[]): number {
    const allItems = [...documents, ...faqs, ...learnedItems];
    if (allItems.length === 0) return 100;

    const now = Date.now();
    const threeMonths = 3 * 30 * 24 * 60 * 60 * 1000;

    const recentItems = allItems.filter(item => {
      const itemDate = new Date(item.uploadedAt || item.createdAt || item.learnedAt);
      return now - itemDate.getTime() < threeMonths;
    });

    return (recentItems.length / allItems.length) * 100;
  }

  private assessAccessibility(documents: any[], faqs: any[]): number {
    // 基于处理状态评估可访问性
    const processedDocs = documents.filter(doc => doc.processedAt);
    const processedRate = documents.length > 0 ? processedDocs.length / documents.length : 1;
    return processedRate * 100;
  }

  private assessUsability(faqs: any[], learnedItems: any[]): number {
    if (faqs.length === 0) return 50;

    const avgUsage = faqs.reduce((sum, faq) => sum + faq.usageCount, 0) / faqs.length;
    // 假设平均使用次数10次为良好标准
    return Math.min((avgUsage / 10) * 100, 100);
  }

  private identifyQualityIssues(dimensions: any, documents: any[], faqs: any[], learnedItems: any[]) {
    const issues = [];

    if (dimensions.completeness < 70) {
      issues.push({
        category: '完整性',
        description: '知识库资源数量不足',
        severity: 'moderate' as ImpactLevel,
        affectedResources: ['知识库整体'],
        recommendations: ['增加文档上传', '补充FAQ内容', '加强学习记录']
      });
    }

    if (dimensions.accuracy < 80) {
      issues.push({
        category: '准确性',
        description: 'FAQ或学习内容置信度偏低',
        severity: 'high' as ImpactLevel,
        affectedResources: faqs.filter(faq => faq.confidence < 0.7).map(faq => faq.id),
        recommendations: ['审核低置信度内容', '补充验证信息', '更新过时内容']
      });
    }

    return issues;
  }

  private identifyStrengthAreas(innovations: InnovationInsight[], patterns: KnowledgePatternInsight[]): string[] {
    const strengths = [];

    if (innovations.length > 0) {
      strengths.push('具备创新思维基础');
    }

    if (patterns.some(p => p.patternCharacteristics.consistency > 0.7)) {
      strengths.push('知识使用模式稳定');
    }

    return strengths.length > 0 ? strengths : ['基础知识框架完整'];
  }

  private identifyImprovementAreas(gaps: CapabilityGapAnalysis[]): string[] {
    if (gaps.length === 0) return ['持续优化知识质量'];

    return gaps.map(gap => gap.title).slice(0, 3);
  }

  private identifyCriticalActions(gaps: CapabilityGapAnalysis[], innovations: InnovationInsight[]): string[] {
    const actions = [];

    const criticalGaps = gaps.filter(gap => gap.impact === 'critical' || gap.urgency === 'urgent');
    if (criticalGaps.length > 0) {
      actions.push(`紧急处理${criticalGaps.length}个关键能力缺失`);
    }

    const highImpactInnovations = innovations.filter(inn => inn.impact === 'high');
    if (highImpactInnovations.length > 0) {
      actions.push(`重点发展${highImpactInnovations.length}个创新机会`);
    }

    return actions.length > 0 ? actions : ['保持现有发展节奏'];
  }

  private generateStrategicRecommendations(
    innovations: InnovationInsight[],
    gaps: CapabilityGapAnalysis[],
    patterns: KnowledgePatternInsight[]
  ): string[] {
    const recommendations = [];

    if (gaps.length > innovations.length) {
      recommendations.push('优先补足能力短板，建立稳固知识基础');
    } else {
      recommendations.push('在保持基础能力的同时，积极探索创新机会');
    }

    if (patterns.some(p => p.trendData.direction === 'increasing')) {
      recommendations.push('利用现有学习趋势，加速知识积累');
    }

    recommendations.push('建立知识管理的长期规划和定期评估机制');

    return recommendations;
  }
}

// 导出单例实例
export const knowledgeInsightService = new KnowledgeInsightService();