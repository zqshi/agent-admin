/**
 * 压缩引擎服务
 * 负责智能压缩Prompt内容以优化Token使用
 */

import type {
  CompressionStrategy,
  CompressionRule,
  CompressionResult,
  CompressionOptions
} from '../types';

export class CompressionEngine {
  private compressionHistory: Map<string, CompressionResult[]>;
  private learningData: Map<string, {
    originalLength: number;
    compressedLength: number;
    qualityScore: number;
    userFeedback?: number;
  }[]>;

  constructor() {
    this.compressionHistory = new Map();
    this.learningData = new Map();
  }

  /**
   * 压缩文本
   */
  async compress(
    text: string,
    strategy: CompressionStrategy,
    options: CompressionOptions = {
      preserveStructure: true,
      preserveKeywords: [],
      targetRatio: 0.7,
      qualityThreshold: 0.8
    }
  ): Promise<CompressionResult> {
    const startTime = performance.now();

    try {
      // 1. 预处理文本
      const preprocessedText = this.preprocessText(text);

      // 2. 分析文本结构
      const textAnalysis = this.analyzeText(preprocessedText);

      // 3. 识别关键信息
      const keyInformation = this.extractKeyInformation(
        preprocessedText,
        [...strategy.config.preserveKeywords, ...options.preserveKeywords]
      );

      // 4. 应用压缩算法
      let compressedText: string;
      switch (strategy.algorithm) {
        case 'semantic':
          compressedText = await this.semanticCompression(
            preprocessedText,
            strategy,
            keyInformation,
            options
          );
          break;
        case 'syntactic':
          compressedText = this.syntacticCompression(
            preprocessedText,
            strategy,
            options
          );
          break;
        case 'hybrid':
          compressedText = await this.hybridCompression(
            preprocessedText,
            strategy,
            keyInformation,
            options
          );
          break;
        default:
          throw new Error(`不支持的压缩算法: ${strategy.algorithm}`);
      }

      // 5. 质量评估
      const qualityScore = this.assessCompressionQuality(
        text,
        compressedText,
        keyInformation,
        options
      );

      // 6. 自适应调整
      if (strategy.adaptive.enabled && qualityScore < strategy.config.qualityThreshold) {
        compressedText = await this.adaptiveRecompression(
          text,
          strategy,
          keyInformation,
          qualityScore,
          options
        );
      }

      // 7. 构建结果
      const result: CompressionResult = {
        originalText: text,
        compressedText,
        compressionRatio: compressedText.length / text.length,
        qualityScore,
        tokenSaved: Math.ceil((text.length - compressedText.length) / 4),
        preservedKeywords: keyInformation.keywords,
        appliedRules: this.getAppliedRules(strategy),
        metrics: {
          processingTime: performance.now() - startTime,
          confidence: this.calculateConfidence(qualityScore, textAnalysis)
        }
      };

      // 8. 学习和记录
      if (strategy.adaptive.enabled) {
        this.recordCompressionData(strategy.id, result);
      }

      return result;
    } catch (error) {
      throw new Error(`压缩失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 预处理文本
   */
  private preprocessText(text: string): string {
    // 标准化空白字符
    let processed = text.replace(/\s+/g, ' ').trim();

    // 移除多余的标点符号
    processed = processed.replace(/[。。]{2,}/g, '。');
    processed = processed.replace(/[！！]{2,}/g, '！');
    processed = processed.replace(/[？？]{2,}/g, '？');

    // 标准化引号
    processed = processed.replace(/[""]/g, '"');
    processed = processed.replace(/['']/g, "'");

    return processed;
  }

  /**
   * 分析文本结构
   */
  private analyzeText(text: string): {
    sentences: string[];
    paragraphs: string[];
    keywords: string[];
    complexity: number;
    structure: 'simple' | 'medium' | 'complex';
  } {
    // 分句
    const sentences = text.split(/[。！？.!?]/).filter(s => s.trim().length > 0);

    // 分段
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);

    // 提取关键词（简化实现）
    const keywords = this.extractKeywords(text);

    // 计算复杂度
    const complexity = this.calculateTextComplexity(text, sentences);

    // 判断结构类型
    let structure: 'simple' | 'medium' | 'complex' = 'simple';
    if (complexity > 0.7) {
      structure = 'complex';
    } else if (complexity > 0.4) {
      structure = 'medium';
    }

    return {
      sentences,
      paragraphs,
      keywords,
      complexity,
      structure
    };
  }

  /**
   * 提取关键词
   */
  private extractKeywords(text: string): string[] {
    // 简化的关键词提取
    const commonWords = new Set([
      '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '个',
      '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看',
      'the', 'is', 'at', 'of', 'on', 'a', 'an', 'and', 'or', 'but', 'in',
      'with', 'for', 'to', 'by', 'from', 'up', 'about', 'into', 'through'
    ]);

    const words = text.toLowerCase()
      .replace(/[^\w\s\u4e00-\u9fff]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 1 && !commonWords.has(word));

    // 计算词频
    const wordFreq = new Map<string, number>();
    words.forEach(word => {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    });

    // 返回高频词
    return Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  /**
   * 计算文本复杂度
   */
  private calculateTextComplexity(text: string, sentences: string[]): number {
    let complexity = 0;

    // 句子长度复杂度
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
    complexity += Math.min(avgSentenceLength / 100, 0.3);

    // 词汇复杂度
    const uniqueWords = new Set(text.toLowerCase().split(/\s+/));
    const totalWords = text.split(/\s+/).length;
    const lexicalDiversity = uniqueWords.size / totalWords;
    complexity += lexicalDiversity * 0.3;

    // 标点符号复杂度
    const punctuationCount = (text.match(/[,.;:!?()[\]{}]/g) || []).length;
    complexity += Math.min(punctuationCount / text.length, 0.2);

    // 嵌套结构复杂度
    const nestingLevel = Math.max(
      (text.match(/\(/g) || []).length,
      (text.match(/"/g) || []).length / 2
    );
    complexity += Math.min(nestingLevel / 10, 0.2);

    return Math.min(complexity, 1.0);
  }

  /**
   * 提取关键信息
   */
  private extractKeyInformation(text: string, preserveKeywords: string[]): {
    keywords: string[];
    keyPhrases: string[];
    importantSentences: string[];
    entities: string[];
  } {
    const keywords = this.extractKeywords(text);
    const keyPhrases = this.extractKeyPhrases(text);
    const importantSentences = this.identifyImportantSentences(text);
    const entities = this.extractEntities(text);

    // 合并用户指定的关键词
    const allKeywords = [...new Set([...keywords, ...preserveKeywords])];

    return {
      keywords: allKeywords,
      keyPhrases,
      importantSentences,
      entities
    };
  }

  /**
   * 提取关键短语
   */
  private extractKeyPhrases(text: string): string[] {
    // 简化的关键短语提取
    const phrases: string[] = [];

    // 提取引号内容
    const quotedPhrases = text.match(/"([^"]+)"/g);
    if (quotedPhrases) {
      phrases.push(...quotedPhrases.map(p => p.slice(1, -1)));
    }

    // 提取特定模式的短语
    const patterns = [
      /(?:需要|要求|必须|应该)\s*(.{1,20})/g,
      /(?:注意|重要|关键)\s*(.{1,20})/g,
      /(?:包括|比如|例如)\s*(.{1,30})/g
    ];

    patterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          phrases.push(match[1].trim());
        }
      }
    });

    return phrases.slice(0, 10);
  }

  /**
   * 识别重要句子
   */
  private identifyImportantSentences(text: string): string[] {
    const sentences = text.split(/[。！？.!?]/).filter(s => s.trim().length > 0);

    // 重要性评分
    const scoredSentences = sentences.map(sentence => {
      let score = 0;

      // 包含重要关键词
      const importantWords = ['重要', '必须', '需要', '要求', '注意', '关键', '核心', '主要'];
      importantWords.forEach(word => {
        if (sentence.includes(word)) score += 2;
      });

      // 句子位置（开头和结尾的句子更重要）
      const index = sentences.indexOf(sentence);
      if (index === 0 || index === sentences.length - 1) score += 1;

      // 句子长度（中等长度的句子可能更重要）
      const length = sentence.length;
      if (length > 20 && length < 100) score += 1;

      // 包含数字或具体信息
      if (/\d+/.test(sentence)) score += 1;

      return { sentence, score };
    });

    return scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.ceil(sentences.length * 0.3))
      .map(item => item.sentence);
  }

  /**
   * 提取实体
   */
  private extractEntities(text: string): string[] {
    const entities: string[] = [];

    // 简化的实体识别
    // 人名（简单模式）
    const namePattern = /[A-Z][a-z]+\s+[A-Z][a-z]+/g;
    const names = text.match(namePattern);
    if (names) entities.push(...names);

    // 日期
    const datePattern = /\d{4}[-年]\d{1,2}[-月]\d{1,2}[日]?/g;
    const dates = text.match(datePattern);
    if (dates) entities.push(...dates);

    // 数字
    const numberPattern = /\d+(?:\.\d+)?%?/g;
    const numbers = text.match(numberPattern);
    if (numbers) entities.push(...numbers.slice(0, 5)); // 限制数量

    return entities;
  }

  /**
   * 语义压缩
   */
  private async semanticCompression(
    text: string,
    strategy: CompressionStrategy,
    keyInfo: any,
    options: CompressionOptions
  ): Promise<string> {
    // 语义压缩的简化实现
    let compressed = text;

    // 1. 移除冗余表达
    compressed = this.removeRedundantExpressions(compressed);

    // 2. 合并相似句子
    compressed = this.mergeSimilarSentences(compressed, keyInfo);

    // 3. 压缩长句
    compressed = this.compressLongSentences(compressed, options);

    // 4. 保留关键信息
    compressed = this.preserveKeyInformation(compressed, keyInfo);

    return compressed;
  }

  /**
   * 句法压缩
   */
  private syntacticCompression(
    text: string,
    strategy: CompressionStrategy,
    options: CompressionOptions
  ): string {
    let compressed = text;

    // 1. 移除填充词
    compressed = this.removeFillerWords(compressed);

    // 2. 简化标点符号
    compressed = this.simplifyPunctuation(compressed);

    // 3. 缩短常见短语
    compressed = this.shortenCommonPhrases(compressed);

    // 4. 应用压缩规则
    strategy.rules.forEach(rule => {
      if (rule.enabled) {
        compressed = this.applyCompressionRule(compressed, rule);
      }
    });

    return compressed;
  }

  /**
   * 混合压缩
   */
  private async hybridCompression(
    text: string,
    strategy: CompressionStrategy,
    keyInfo: any,
    options: CompressionOptions
  ): Promise<string> {
    // 先进行句法压缩
    let compressed = this.syntacticCompression(text, strategy, options);

    // 再进行语义压缩
    compressed = await this.semanticCompression(compressed, strategy, keyInfo, options);

    return compressed;
  }

  /**
   * 移除冗余表达
   */
  private removeRedundantExpressions(text: string): string {
    const redundantPatterns = [
      /\b(也就是说|换句话说|简单来说|总的来说)\b/g,
      /\b(当然|显然|毫无疑问|众所周知)\b/g,
      /\b(我认为|我觉得|个人认为)\b/g,
      /\b(非常|很|特别|极其)([重要|关键|必要])/g
    ];

    let result = text;
    redundantPatterns.forEach(pattern => {
      result = result.replace(pattern, (match, ...groups) => {
        // 保留核心词汇
        return groups[groups.length - 2] || '';
      });
    });

    return result;
  }

  /**
   * 合并相似句子
   */
  private mergeSimilarSentences(text: string, keyInfo: any): string {
    const sentences = text.split(/[。！？.!?]/).filter(s => s.trim().length > 0);

    if (sentences.length < 2) return text;

    const mergedSentences: string[] = [];
    let i = 0;

    while (i < sentences.length) {
      let currentSentence = sentences[i];

      // 查找相似的后续句子
      for (let j = i + 1; j < sentences.length; j++) {
        const similarity = this.calculateSentenceSimilarity(currentSentence, sentences[j]);
        if (similarity > 0.7) {
          // 合并句子
          currentSentence = this.mergeTwoSentences(currentSentence, sentences[j]);
          sentences.splice(j, 1);
          j--;
        }
      }

      mergedSentences.push(currentSentence);
      i++;
    }

    return mergedSentences.join('。') + '。';
  }

  /**
   * 计算句子相似度
   */
  private calculateSentenceSimilarity(sent1: string, sent2: string): number {
    const words1 = new Set(sent1.toLowerCase().split(/\s+/));
    const words2 = new Set(sent2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  /**
   * 合并两个句子
   */
  private mergeTwoSentences(sent1: string, sent2: string): string {
    // 简化的句子合并逻辑
    const commonWords = new Set(['和', '以及', '同时', '另外', '此外']);

    // 移除重复的开头
    let merged = sent1.trim();
    const sent2Cleaned = sent2.trim();

    // 添加连接词
    if (!commonWords.has(sent2Cleaned.charAt(0))) {
      merged += '，';
    }

    merged += sent2Cleaned;

    return merged;
  }

  /**
   * 压缩长句
   */
  private compressLongSentences(text: string, options: CompressionOptions): string {
    const sentences = text.split(/[。！？.!?]/).filter(s => s.trim().length > 0);

    const compressedSentences = sentences.map(sentence => {
      if (sentence.length > 80) {
        return this.compressSingleSentence(sentence, options);
      }
      return sentence;
    });

    return compressedSentences.join('。') + '。';
  }

  /**
   * 压缩单个句子
   */
  private compressSingleSentence(sentence: string, options: CompressionOptions): string {
    let compressed = sentence;

    // 移除修饰语
    compressed = compressed.replace(/\b(非常|特别|极其|十分|相当)\s*/g, '');

    // 简化从句
    compressed = compressed.replace(/，(这|那)(是|就是)\s*/g, '，');

    // 移除冗余的连接词
    compressed = compressed.replace(/\b(同时|另外|此外)，/g, '，');

    return compressed;
  }

  /**
   * 保留关键信息
   */
  private preserveKeyInformation(text: string, keyInfo: any): string {
    let result = text;

    // 确保关键词存在
    keyInfo.keywords.forEach((keyword: string) => {
      if (!result.includes(keyword) && text.includes(keyword)) {
        // 尝试恢复关键词
        const sentences = text.split(/[。！？.!?]/);
        const keywordSentence = sentences.find(s => s.includes(keyword));
        if (keywordSentence) {
          result += `。${keyword}相关：${keywordSentence.substring(0, 50)}`;
        }
      }
    });

    return result;
  }

  /**
   * 移除填充词
   */
  private removeFillerWords(text: string): string {
    const fillerWords = [
      '呃', '嗯', '哦', '啊', '呀', '吧', '呢', '吗',
      'um', 'uh', 'well', 'you know', 'like'
    ];

    let result = text;
    fillerWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      result = result.replace(regex, '');
    });

    // 清理多余空格
    return result.replace(/\s+/g, ' ').trim();
  }

  /**
   * 简化标点符号
   */
  private simplifyPunctuation(text: string): string {
    return text
      .replace(/[，,]{2,}/g, '，')
      .replace(/[。.]{2,}/g, '。')
      .replace(/[！!]{2,}/g, '！')
      .replace(/[？?]{2,}/g, '？')
      .replace(/\s*[，,]\s*/g, '，')
      .replace(/\s*[。.]\s*/g, '。');
  }

  /**
   * 缩短常见短语
   */
  private shortenCommonPhrases(text: string): string {
    const phraseMap: Record<string, string> = {
      '非常重要': '重要',
      '特别注意': '注意',
      '需要注意的是': '注意',
      '值得注意的是': '注意',
      '有必要说明的是': '说明',
      '换句话说': '即',
      '也就是说': '即',
      '总而言之': '总之',
      '综上所述': '总之'
    };

    let result = text;
    Object.entries(phraseMap).forEach(([long, short]) => {
      const regex = new RegExp(long, 'g');
      result = result.replace(regex, short);
    });

    return result;
  }

  /**
   * 应用压缩规则
   */
  private applyCompressionRule(text: string, rule: CompressionRule): string {
    switch (rule.type) {
      case 'remove':
        const removeRegex = typeof rule.pattern === 'string'
          ? new RegExp(rule.pattern, 'g')
          : rule.pattern;
        return text.replace(removeRegex, '');

      case 'replace':
        const replaceRegex = typeof rule.pattern === 'string'
          ? new RegExp(rule.pattern, 'g')
          : rule.pattern;
        return text.replace(replaceRegex, rule.replacement || '');

      case 'merge':
        // TODO: 实现合并逻辑
        return text;

      case 'summarize':
        // TODO: 实现摘要逻辑
        return text;

      default:
        return text;
    }
  }

  /**
   * 评估压缩质量
   */
  private assessCompressionQuality(
    original: string,
    compressed: string,
    keyInfo: any,
    options: CompressionOptions
  ): number {
    let quality = 0.5; // 基础质量分数

    // 1. 关键信息保留度 (30%)
    const keywordRetention = this.calculateKeywordRetention(original, compressed, keyInfo.keywords);
    quality += keywordRetention * 0.3;

    // 2. 语义完整性 (25%)
    const semanticIntegrity = this.assessSemanticIntegrity(original, compressed);
    quality += semanticIntegrity * 0.25;

    // 3. 压缩比合理性 (20%)
    const compressionRatio = compressed.length / original.length;
    const ratioScore = this.evaluateCompressionRatio(compressionRatio, options.targetRatio);
    quality += ratioScore * 0.2;

    // 4. 可读性 (15%)
    const readability = this.assessReadability(compressed);
    quality += readability * 0.15;

    // 5. 结构保持 (10%)
    if (options.preserveStructure) {
      const structureScore = this.assessStructurePreservation(original, compressed);
      quality += structureScore * 0.1;
    }

    return Math.min(quality, 1.0);
  }

  /**
   * 计算关键词保留率
   */
  private calculateKeywordRetention(original: string, compressed: string, keywords: string[]): number {
    if (keywords.length === 0) return 1.0;

    const retainedKeywords = keywords.filter(keyword =>
      compressed.toLowerCase().includes(keyword.toLowerCase())
    );

    return retainedKeywords.length / keywords.length;
  }

  /**
   * 评估语义完整性
   */
  private assessSemanticIntegrity(original: string, compressed: string): number {
    // 简化的语义完整性评估
    const originalSentences = original.split(/[。！？.!?]/).filter(s => s.trim());
    const compressedSentences = compressed.split(/[。！？.!?]/).filter(s => s.trim());

    // 检查主要概念是否保留
    const originalConcepts = this.extractMainConcepts(original);
    const compressedConcepts = this.extractMainConcepts(compressed);

    const retainedConcepts = originalConcepts.filter(concept =>
      compressedConcepts.includes(concept)
    );

    const conceptRetention = originalConcepts.length > 0
      ? retainedConcepts.length / originalConcepts.length
      : 1.0;

    // 检查句子结构完整性
    const structureIntegrity = Math.min(compressedSentences.length / originalSentences.length * 2, 1.0);

    return (conceptRetention + structureIntegrity) / 2;
  }

  /**
   * 提取主要概念
   */
  private extractMainConcepts(text: string): string[] {
    // 简化的概念提取
    const conceptPatterns = [
      /(\w+)(?=是|为|表示|意味着)/g,
      /(?:需要|要求|必须)(\w+)/g,
      /(?:包括|含有|具有)(\w+)/g
    ];

    const concepts: string[] = [];
    conceptPatterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          concepts.push(match[1]);
        }
      }
    });

    return [...new Set(concepts)];
  }

  /**
   * 评估压缩比
   */
  private evaluateCompressionRatio(actualRatio: number, targetRatio: number): number {
    const difference = Math.abs(actualRatio - targetRatio);
    return Math.max(0, 1 - difference * 2); // 差异越小分数越高
  }

  /**
   * 评估可读性
   */
  private assessReadability(text: string): number {
    let score = 0.5;

    // 句子长度合理性
    const sentences = text.split(/[。！？.!?]/).filter(s => s.trim());
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
    if (avgSentenceLength > 10 && avgSentenceLength < 60) {
      score += 0.2;
    }

    // 标点符号使用
    const punctuationRatio = (text.match(/[，。！？,\\.!?]/g) || []).length / text.length;
    if (punctuationRatio > 0.05 && punctuationRatio < 0.2) {
      score += 0.2;
    }

    // 词汇多样性
    const words = text.split(/\s+/);
    const uniqueWords = new Set(words);
    const diversity = uniqueWords.size / words.length;
    if (diversity > 0.4) {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  /**
   * 评估结构保持
   */
  private assessStructurePreservation(original: string, compressed: string): number {
    // 检查段落结构
    const originalParas = original.split(/\n\s*\n/).length;
    const compressedParas = compressed.split(/\n\s*\n/).length;
    const paraScore = originalParas > 1 ? Math.min(compressedParas / originalParas, 1.0) : 1.0;

    // 检查列表结构
    const originalLists = (original.match(/^\s*[-*•]\s/gm) || []).length;
    const compressedLists = (compressed.match(/^\s*[-*•]\s/gm) || []).length;
    const listScore = originalLists > 0 ? Math.min(compressedLists / originalLists, 1.0) : 1.0;

    return (paraScore + listScore) / 2;
  }

  /**
   * 自适应重新压缩
   */
  private async adaptiveRecompression(
    text: string,
    strategy: CompressionStrategy,
    keyInfo: any,
    currentQuality: number,
    options: CompressionOptions
  ): Promise<string> {
    // 调整压缩参数
    const adjustedOptions = { ...options };

    if (currentQuality < 0.5) {
      // 质量太低，降低压缩强度
      adjustedOptions.targetRatio = Math.min(adjustedOptions.targetRatio + 0.1, 0.9);
    }

    // 重新压缩
    return await this.hybridCompression(text, strategy, keyInfo, adjustedOptions);
  }

  /**
   * 计算置信度
   */
  private calculateConfidence(qualityScore: number, textAnalysis: any): number {
    let confidence = qualityScore;

    // 根据文本复杂度调整置信度
    if (textAnalysis.complexity < 0.3) {
      confidence += 0.1; // 简单文本更容易压缩
    } else if (textAnalysis.complexity > 0.7) {
      confidence -= 0.1; // 复杂文本压缩风险更大
    }

    return Math.max(0, Math.min(confidence, 1.0));
  }

  /**
   * 获取应用的规则
   */
  private getAppliedRules(strategy: CompressionStrategy): string[] {
    return strategy.rules
      .filter(rule => rule.enabled)
      .map(rule => rule.id);
  }

  /**
   * 记录压缩数据用于学习
   */
  private recordCompressionData(strategyId: string, result: CompressionResult): void {
    if (!this.learningData.has(strategyId)) {
      this.learningData.set(strategyId, []);
    }

    const data = this.learningData.get(strategyId)!;
    data.push({
      originalLength: result.originalText.length,
      compressedLength: result.compressedText.length,
      qualityScore: result.qualityScore
    });

    // 限制学习数据大小
    if (data.length > 100) {
      data.splice(0, data.length - 100);
    }
  }

  /**
   * 获取学习统计
   */
  getLearningStats(strategyId: string): {
    totalCompressions: number;
    avgCompressionRatio: number;
    avgQualityScore: number;
    trend: 'improving' | 'stable' | 'declining';
  } | null {
    const data = this.learningData.get(strategyId);
    if (!data || data.length === 0) return null;

    const totalCompressions = data.length;
    const avgCompressionRatio = data.reduce((sum, d) => sum + (d.compressedLength / d.originalLength), 0) / data.length;
    const avgQualityScore = data.reduce((sum, d) => sum + d.qualityScore, 0) / data.length;

    // 计算趋势
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (data.length >= 10) {
      const recent = data.slice(-5);
      const earlier = data.slice(-10, -5);
      const recentAvg = recent.reduce((sum, d) => sum + d.qualityScore, 0) / recent.length;
      const earlierAvg = earlier.reduce((sum, d) => sum + d.qualityScore, 0) / earlier.length;

      if (recentAvg > earlierAvg + 0.05) {
        trend = 'improving';
      } else if (recentAvg < earlierAvg - 0.05) {
        trend = 'declining';
      }
    }

    return {
      totalCompressions,
      avgCompressionRatio,
      avgQualityScore,
      trend
    };
  }

  /**
   * 清理学习数据
   */
  clearLearningData(strategyId?: string): void {
    if (strategyId) {
      this.learningData.delete(strategyId);
    } else {
      this.learningData.clear();
    }
  }
}