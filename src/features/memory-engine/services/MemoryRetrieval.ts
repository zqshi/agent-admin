/**
 * 记忆检索服务
 * 提供多种检索策略和优化的搜索算法
 */

import {
  EnhancedMemoryEntry,
  MemoryLayerType,
  MemoryQuery,
  MemorySearchResult,
  MemorySearchResponse,
  MemoryAssociation,
  MemoryContext
} from '../types';

/**
 * 记忆检索引擎
 * 实现基于图神经网络的跨层检索和语义搜索
 */
export class MemoryRetrieval {
  private memoryIndex: Map<string, EnhancedMemoryEntry> = new Map();
  private layerIndices: Map<MemoryLayerType, Map<string, EnhancedMemoryEntry>> = new Map();
  private associationIndex: Map<string, MemoryAssociation[]> = new Map();
  private vectorIndex: Map<string, number[]> = new Map(); // 简化的向量索引

  constructor() {
    this.initializeIndices();
  }

  /**
   * 初始化检索索引
   */
  private initializeIndices(): void {
    const layers: MemoryLayerType[] = ['working', 'episodic', 'semantic', 'procedural', 'emotional'];
    layers.forEach(layer => {
      this.layerIndices.set(layer, new Map());
    });
  }

  /**
   * 添加记忆到索引
   */
  async indexMemory(memory: EnhancedMemoryEntry): Promise<void> {
    // 添加到全局索引
    this.memoryIndex.set(memory.id, memory);

    // 添加到层级索引
    const layerIndex = this.layerIndices.get(memory.layer);
    if (layerIndex) {
      layerIndex.set(memory.id, memory);
    }

    // 构建关联索引
    this.associationIndex.set(memory.id, memory.associations || []);

    // 生成向量嵌入并索引（简化版本）
    if (memory.embeddings) {
      this.vectorIndex.set(memory.id, memory.embeddings);
    } else {
      const embedding = await this.generateEmbedding(memory.content);
      this.vectorIndex.set(memory.id, embedding);
    }
  }

  /**
   * 从索引中移除记忆
   */
  async removeFromIndex(memoryId: string): Promise<void> {
    const memory = this.memoryIndex.get(memoryId);
    if (memory) {
      this.memoryIndex.delete(memoryId);

      const layerIndex = this.layerIndices.get(memory.layer);
      if (layerIndex) {
        layerIndex.delete(memoryId);
      }
    }

    this.associationIndex.delete(memoryId);
    this.vectorIndex.delete(memoryId);
  }

  /**
   * 执行跨层级检索
   */
  async crossLayerRetrieval(query: MemoryQuery, context?: MemoryContext): Promise<MemorySearchResponse> {
    const startTime = Date.now();

    // 预处理查询
    const processedQuery = await this.preprocessQuery(query, context);
    const queryEmbedding = await this.generateEmbedding(processedQuery.query);

    // 确定要搜索的层级
    const layersToSearch = query.layers || ['working', 'episodic', 'semantic', 'procedural', 'emotional'];

    // 并行搜索各层级
    const layerSearchPromises = layersToSearch.map(layer =>
      this.searchLayerWithStrategy(layer, processedQuery, queryEmbedding, context)
    );

    const layerResults = await Promise.all(layerSearchPromises);

    // 合并和去重结果
    let allResults = this.mergeLayerResults(layerResults);

    // 应用关联扩散
    if (query.includeAssociations) {
      allResults = await this.expandWithAssociations(allResults, query.associationDepth || 1);
    }

    // 重新排序和过滤
    const finalResults = await this.finalizeResults(allResults, processedQuery, context);

    // 应用结果数量限制
    const limitedResults = finalResults.slice(0, query.maxResults || 50);

    const executionTime = Date.now() - startTime;

    return {
      query: processedQuery,
      results: limitedResults,
      totalMatches: allResults.length,
      executionTime,
      searchStrategy: this.determineSearchStrategy(query),
      suggestions: await this.generateSearchSuggestions(processedQuery, limitedResults),
      metadata: {
        searchId: this.generateSearchId(),
        timestamp: new Date(),
        layersSearched: layersToSearch,
        filtersApplied: this.extractAppliedFilters(query)
      }
    };
  }

  /**
   * 语义相似度检索
   */
  async semanticSearch(
    queryText: string,
    layers?: MemoryLayerType[],
    threshold = 0.7,
    maxResults = 20
  ): Promise<MemorySearchResult[]> {
    const queryEmbedding = await this.generateEmbedding(queryText);
    const results: MemorySearchResult[] = [];

    const searchLayers = layers || ['semantic', 'episodic'];

    for (const layer of searchLayers) {
      const layerIndex = this.layerIndices.get(layer);
      if (!layerIndex) continue;

      for (const [memoryId, memory] of layerIndex.entries()) {
        const memoryEmbedding = this.vectorIndex.get(memoryId);
        if (!memoryEmbedding) continue;

        const similarity = this.calculateCosineSimilarity(queryEmbedding, memoryEmbedding);

        if (similarity >= threshold) {
          results.push({
            memory,
            score: similarity,
            relevanceScore: similarity,
            matchType: 'semantic',
            matchedFields: ['content'],
            associations: memory.associations,
            explanation: `Semantic similarity: ${(similarity * 100).toFixed(1)}%`
          });
        }
      }
    }

    // 按相似度排序
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);
  }

  /**
   * 关联激活扩散搜索
   */
  async activateAssociatedMemories(
    seedMemoryIds: string[],
    maxDepth = 2,
    activationThreshold = 0.3
  ): Promise<Map<string, number>> {
    const activatedMemories = new Map<string, number>();
    const visited = new Set<string>();

    // 初始化种子记忆
    for (const seedId of seedMemoryIds) {
      activatedMemories.set(seedId, 1.0);
    }

    // 扩散激活
    for (let depth = 0; depth < maxDepth; depth++) {
      const currentLevel = Array.from(activatedMemories.entries())
        .filter(([id, activation]) => !visited.has(id) && activation >= activationThreshold);

      if (currentLevel.length === 0) break;

      for (const [memoryId, activation] of currentLevel) {
        visited.add(memoryId);

        const associations = this.associationIndex.get(memoryId) || [];
        for (const association of associations) {
          const targetId = association.targetMemoryId;
          const newActivation = activation * association.strength * 0.8; // 衰减因子

          const existingActivation = activatedMemories.get(targetId) || 0;
          if (newActivation > existingActivation) {
            activatedMemories.set(targetId, newActivation);
          }
        }
      }
    }

    return activatedMemories;
  }

  /**
   * 上下文感知检索
   */
  async contextAwareRetrieval(
    query: string,
    context: MemoryContext,
    maxResults = 10
  ): Promise<MemorySearchResult[]> {
    const queryEmbedding = await this.generateEmbedding(query);
    const results: MemorySearchResult[] = [];

    // 基础语义搜索
    const baseResults = await this.semanticSearch(query, undefined, 0.5, maxResults * 2);

    // 为每个结果计算上下文分数
    for (const result of baseResults) {
      const contextScore = await this.calculateContextScore(result.memory, context);
      const combinedScore = result.score * 0.7 + contextScore * 0.3;

      results.push({
        ...result,
        score: combinedScore,
        contextScore,
        explanation: `${result.explanation}, Context match: ${(contextScore * 100).toFixed(1)}%`
      });
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);
  }

  /**
   * 时间范围检索
   */
  async temporalRetrieval(
    timeRange: { start: Date; end: Date },
    layers?: MemoryLayerType[],
    orderBy: 'created' | 'accessed' | 'importance' = 'created'
  ): Promise<EnhancedMemoryEntry[]> {
    const searchLayers = layers || ['working', 'episodic', 'semantic', 'procedural', 'emotional'];
    const results: EnhancedMemoryEntry[] = [];

    for (const layer of searchLayers) {
      const layerIndex = this.layerIndices.get(layer);
      if (!layerIndex) continue;

      for (const memory of layerIndex.values()) {
        const isInTimeRange = memory.createdAt >= timeRange.start && memory.createdAt <= timeRange.end;
        if (isInTimeRange) {
          results.push(memory);
        }
      }
    }

    // 排序
    return results.sort((a, b) => {
      switch (orderBy) {
        case 'created':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'accessed':
          const aAccessed = a.lastAccessedAt?.getTime() || 0;
          const bAccessed = b.lastAccessedAt?.getTime() || 0;
          return bAccessed - aAccessed;
        case 'importance':
          return b.importance - a.importance;
        default:
          return 0;
      }
    });
  }

  /**
   * 模糊匹配检索
   */
  async fuzzySearch(
    query: string,
    layers?: MemoryLayerType[],
    tolerance = 0.8
  ): Promise<MemorySearchResult[]> {
    const searchLayers = layers || ['working', 'episodic', 'semantic', 'procedural', 'emotional'];
    const results: MemorySearchResult[] = [];

    for (const layer of searchLayers) {
      const layerIndex = this.layerIndices.get(layer);
      if (!layerIndex) continue;

      for (const memory of layerIndex.values()) {
        const similarity = this.calculateStringSimilarity(query.toLowerCase(), memory.content.toLowerCase());

        if (similarity >= tolerance) {
          results.push({
            memory,
            score: similarity,
            relevanceScore: similarity,
            matchType: 'fuzzy',
            matchedFields: ['content'],
            associations: memory.associations,
            explanation: `Fuzzy match: ${(similarity * 100).toFixed(1)}%`
          });
        }
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  // === 私有辅助方法 ===

  private async searchLayerWithStrategy(
    layer: MemoryLayerType,
    query: MemoryQuery,
    queryEmbedding: number[],
    context?: MemoryContext
  ): Promise<MemorySearchResult[]> {
    const layerIndex = this.layerIndices.get(layer);
    if (!layerIndex) return [];

    const results: MemorySearchResult[] = [];

    for (const [memoryId, memory] of layerIndex.entries()) {
      // 应用过滤器
      if (!this.passesFilters(memory, query)) continue;

      // 计算相关性分数
      const relevanceScore = await this.calculateLayerSpecificRelevance(memory, query, queryEmbedding, layer);

      if (relevanceScore >= (query.threshold || 0.3)) {
        results.push({
          memory,
          score: relevanceScore,
          relevanceScore,
          matchType: this.determineMatchType(memory, query),
          matchedFields: this.findMatchedFields(memory, query),
          associations: memory.associations
        });
      }
    }

    return results;
  }

  private async calculateLayerSpecificRelevance(
    memory: EnhancedMemoryEntry,
    query: MemoryQuery,
    queryEmbedding: number[],
    layer: MemoryLayerType
  ): Promise<number> {
    let baseScore = 0;

    // 文本匹配分数
    if (memory.content.toLowerCase().includes(query.query.toLowerCase())) {
      baseScore += 0.4;
    }

    // 向量相似度分数
    const memoryEmbedding = this.vectorIndex.get(memory.id);
    if (memoryEmbedding) {
      const vectorScore = this.calculateCosineSimilarity(queryEmbedding, memoryEmbedding);
      baseScore += vectorScore * 0.4;
    }

    // 层级特定权重
    const layerWeight = this.getLayerRelevanceWeight(layer, query);
    baseScore *= layerWeight;

    // 记忆质量调整
    baseScore *= (memory.confidence * 0.5 + memory.importance * 0.3 + memory.clarity * 0.2);

    return Math.min(baseScore, 1);
  }

  private getLayerRelevanceWeight(layer: MemoryLayerType, query: MemoryQuery): number {
    // 根据查询类型调整层级权重
    const weights = {
      working: query.queryType === 'exact' ? 1.2 : 0.8,
      episodic: query.queryType === 'semantic' ? 1.1 : 1.0,
      semantic: query.queryType === 'semantic' ? 1.3 : 1.0,
      procedural: query.queryType === 'exact' ? 1.1 : 0.9,
      emotional: 1.0
    };

    return weights[layer] || 1.0;
  }

  private passesFilters(memory: EnhancedMemoryEntry, query: MemoryQuery): boolean {
    // 来源过滤
    if (query.sources && !query.sources.includes(memory.source)) {
      return false;
    }

    // 时间范围过滤
    if (query.timeRange) {
      if (memory.createdAt < query.timeRange.start || memory.createdAt > query.timeRange.end) {
        return false;
      }
    }

    // 重要性范围过滤
    if (query.importanceRange) {
      const [min, max] = query.importanceRange;
      if (memory.importance < min || memory.importance > max) {
        return false;
      }
    }

    // 置信度范围过滤
    if (query.confidenceRange) {
      const [min, max] = query.confidenceRange;
      if (memory.confidence < min || memory.confidence > max) {
        return false;
      }
    }

    // 标签过滤
    if (query.tags && query.tags.length > 0) {
      const hasMatchingTag = query.tags.some(tag => memory.tags.includes(tag));
      if (!hasMatchingTag) {
        return false;
      }
    }

    return true;
  }

  private mergeLayerResults(layerResults: MemorySearchResult[][]): MemorySearchResult[] {
    const merged = new Map<string, MemorySearchResult>();

    for (const results of layerResults) {
      for (const result of results) {
        const existingResult = merged.get(result.memory.id);
        if (!existingResult || result.score > existingResult.score) {
          merged.set(result.memory.id, result);
        }
      }
    }

    return Array.from(merged.values());
  }

  private async expandWithAssociations(
    results: MemorySearchResult[],
    depth: number
  ): Promise<MemorySearchResult[]> {
    const expanded = new Map<string, MemorySearchResult>();

    // 添加原始结果
    for (const result of results) {
      expanded.set(result.memory.id, result);
    }

    // 扩展关联记忆
    for (let d = 0; d < depth; d++) {
      const currentResults = Array.from(expanded.values());

      for (const result of currentResults) {
        const associations = this.associationIndex.get(result.memory.id) || [];

        for (const association of associations) {
          if (expanded.has(association.targetMemoryId)) continue;

          const associatedMemory = this.memoryIndex.get(association.targetMemoryId);
          if (associatedMemory) {
            expanded.set(association.targetMemoryId, {
              memory: associatedMemory,
              score: result.score * association.strength * 0.8,
              relevanceScore: result.relevanceScore * association.strength * 0.8,
              matchType: 'associative',
              matchedFields: [],
              associations: associatedMemory.associations
            });
          }
        }
      }
    }

    return Array.from(expanded.values());
  }

  private async finalizeResults(
    results: MemorySearchResult[],
    query: MemoryQuery,
    context?: MemoryContext
  ): Promise<MemorySearchResult[]> {
    // 重新计算分数（考虑上下文等因素）
    for (const result of results) {
      if (context) {
        const contextScore = await this.calculateContextScore(result.memory, context);
        result.score = result.score * 0.8 + contextScore * 0.2;
      }
    }

    // 排序
    return results.sort((a, b) => {
      switch (query.sortBy) {
        case 'relevance':
          return b.score - a.score;
        case 'importance':
          return b.memory.importance - a.memory.importance;
        case 'recency':
          return b.memory.createdAt.getTime() - a.memory.createdAt.getTime();
        case 'confidence':
          return b.memory.confidence - a.memory.confidence;
        default:
          return b.score - a.score;
      }
    });
  }

  private async calculateContextScore(memory: EnhancedMemoryEntry, context: MemoryContext): Promise<number> {
    let score = 0;

    // 会话上下文匹配
    if (context.conversationContext && memory.metadata.conversationTopic) {
      if (context.conversationContext.topic === memory.metadata.conversationTopic) {
        score += 0.3;
      }
    }

    // 任务上下文匹配
    if (context.taskContext && memory.metadata.taskDomain) {
      if (context.taskContext.domain === memory.metadata.taskDomain) {
        score += 0.4;
      }
    }

    // 时间相关性
    const timeDiff = Math.abs(context.timestamp.getTime() - memory.createdAt.getTime());
    const timeScore = Math.exp(-timeDiff / (1000 * 60 * 60 * 24)); // 24小时衰减
    score += timeScore * 0.3;

    return Math.min(score, 1);
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    // 简化的嵌入生成（实际应该使用真实的嵌入模型）
    const hash = this.simpleHash(text);
    const embedding = new Array(128).fill(0).map((_, i) => {
      return Math.sin(hash * (i + 1)) * Math.cos(hash * (i + 2));
    });

    // 归一化
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / norm);
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private calculateCosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const norm = Math.sqrt(normA) * Math.sqrt(normB);
    return norm === 0 ? 0 : dotProduct / norm;
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  private determineMatchType(memory: EnhancedMemoryEntry, query: MemoryQuery): 'exact' | 'semantic' | 'associative' | 'contextual' {
    if (memory.content.toLowerCase().includes(query.query.toLowerCase())) {
      return 'exact';
    }
    return 'semantic';
  }

  private findMatchedFields(memory: EnhancedMemoryEntry, query: MemoryQuery): string[] {
    const fields = [];

    if (memory.content.toLowerCase().includes(query.query.toLowerCase())) {
      fields.push('content');
    }

    if (memory.tags.some(tag => tag.toLowerCase().includes(query.query.toLowerCase()))) {
      fields.push('tags');
    }

    return fields;
  }

  private async preprocessQuery(query: MemoryQuery, context?: MemoryContext): Promise<MemoryQuery> {
    // 查询预处理逻辑
    return query;
  }

  private determineSearchStrategy(query: MemoryQuery): string {
    if (query.queryType === 'vector') return 'vector_search';
    if (query.queryType === 'exact') return 'exact_match';
    if (query.queryType === 'fuzzy') return 'fuzzy_search';
    return 'hybrid_search';
  }

  private async generateSearchSuggestions(query: MemoryQuery, results: MemorySearchResult[]): Promise<string[]> {
    // 基于结果生成搜索建议
    return [];
  }

  private extractAppliedFilters(query: MemoryQuery): string[] {
    const filters = [];
    if (query.layers) filters.push('layers');
    if (query.sources) filters.push('sources');
    if (query.timeRange) filters.push('timeRange');
    if (query.tags) filters.push('tags');
    if (query.importanceRange) filters.push('importance');
    if (query.confidenceRange) filters.push('confidence');
    return filters;
  }

  private generateSearchId(): string {
    return `search_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
}