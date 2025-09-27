/**
 * 记忆优化服务
 * 实现记忆衰减、压缩、整理和优化算法
 */

import {
  EnhancedMemoryEntry,
  MemoryLayerType,
  MemorySystemState,
  MemoryAssociation,
  TransitionSuggestion,
  MemoryAnalytics
} from '../types';

/**
 * 记忆优化器
 * 基于艾宾浩斯遗忘曲线和神经网络优化原理
 */
export class MemoryOptimizer {
  private memoryStore: Map<string, EnhancedMemoryEntry> = new Map();
  private layerStores: Map<MemoryLayerType, Map<string, EnhancedMemoryEntry>> = new Map();
  private optimizationHistory: OptimizationEvent[] = [];

  constructor(private config: MemoryOptimizerConfig = {}) {
    this.initializeOptimizer();
  }

  private initializeOptimizer(): void {
    const layers: MemoryLayerType[] = ['working', 'episodic', 'semantic', 'procedural', 'emotional'];
    layers.forEach(layer => {
      this.layerStores.set(layer, new Map());
    });
  }

  /**
   * 设置记忆存储引用
   */
  setMemoryStore(
    memoryStore: Map<string, EnhancedMemoryEntry>,
    layerStores: Map<MemoryLayerType, Map<string, EnhancedMemoryEntry>>
  ): void {
    this.memoryStore = memoryStore;
    this.layerStores = layerStores;
  }

  /**
   * 执行全系统优化
   */
  async optimizeSystem(): Promise<OptimizationResult> {
    const startTime = Date.now();
    const optimizationResult: OptimizationResult = {
      optimizationId: this.generateOptimizationId(),
      startTime: new Date(),
      endTime: new Date(),
      duration: 0,
      tasksExecuted: [],
      memoryChanges: {
        compressed: 0,
        archived: 0,
        deleted: 0,
        consolidated: 0,
        strengthened: 0
      },
      performanceGains: {
        storageReduced: 0,
        retrievalSpeedImproved: 0,
        qualityImproved: 0
      },
      errors: []
    };

    try {
      // 1. 记忆衰减处理
      const decayResult = await this.applyMemoryDecay();
      optimizationResult.tasksExecuted.push('memory_decay');
      optimizationResult.memoryChanges.archived += decayResult.archivedCount;
      optimizationResult.memoryChanges.deleted += decayResult.deletedCount;

      // 2. 记忆压缩
      const compressionResult = await this.compressMemories();
      optimizationResult.tasksExecuted.push('memory_compression');
      optimizationResult.memoryChanges.compressed += compressionResult.compressedCount;
      optimizationResult.performanceGains.storageReduced += compressionResult.spaceSaved;

      // 3. 记忆整合
      const consolidationResult = await this.consolidateMemories();
      optimizationResult.tasksExecuted.push('memory_consolidation');
      optimizationResult.memoryChanges.consolidated += consolidationResult.consolidatedCount;

      // 4. 关联强化
      const reinforcementResult = await this.reinforceAssociations();
      optimizationResult.tasksExecuted.push('association_reinforcement');
      optimizationResult.memoryChanges.strengthened += reinforcementResult.strengthenedCount;

      // 5. 冗余清理
      const deduplicationResult = await this.deduplicateMemories();
      optimizationResult.tasksExecuted.push('deduplication');
      optimizationResult.memoryChanges.deleted += deduplicationResult.removedCount;

      // 6. 索引优化
      await this.optimizeIndices();
      optimizationResult.tasksExecuted.push('index_optimization');

    } catch (error) {
      optimizationResult.errors.push({
        task: 'system_optimization',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date()
      });
    }

    optimizationResult.endTime = new Date();
    optimizationResult.duration = Date.now() - startTime;

    // 记录优化历史
    this.optimizationHistory.push({
      id: optimizationResult.optimizationId,
      timestamp: optimizationResult.startTime,
      type: 'full_system',
      result: optimizationResult,
      performance: this.calculatePerformanceMetrics()
    });

    return optimizationResult;
  }

  /**
   * 应用记忆衰减算法（基于艾宾浩斯遗忘曲线）
   */
  async applyMemoryDecay(): Promise<DecayResult> {
    const result: DecayResult = {
      processedCount: 0,
      archivedCount: 0,
      deletedCount: 0,
      strengthenedCount: 0
    };

    const currentTime = Date.now();

    for (const [memoryId, memory] of this.memoryStore.entries()) {
      result.processedCount++;

      // 计算记忆年龄
      const ageInDays = (currentTime - memory.createdAt.getTime()) / (1000 * 60 * 60 * 24);

      // 计算衰减后的强度
      const decayedStrength = this.calculateDecayedStrength(memory, ageInDays);

      // 根据衰减程度决定操作
      if (decayedStrength < 0.1) {
        // 强度过低，删除记忆
        await this.deleteMemory(memoryId);
        result.deletedCount++;
      } else if (decayedStrength < 0.3) {
        // 强度较低，归档记忆
        await this.archiveMemory(memory);
        result.archivedCount++;
      } else if (memory.accessCount > 5 && decayedStrength > 0.7) {
        // 高频访问且强度高，强化记忆
        await this.strengthenMemory(memory, 1.1);
        result.strengthenedCount++;
      }

      // 更新记忆的当前强度
      memory.stability = decayedStrength;
      memory.updatedAt = new Date();
    }

    return result;
  }

  /**
   * 计算基于艾宾浩斯曲线的衰减强度
   */
  private calculateDecayedStrength(memory: EnhancedMemoryEntry, ageInDays: number): number {
    // 基础遗忘函数：R = e^(-t/S)
    // R: 记忆保持率, t: 时间, S: 记忆强度

    // 记忆强度因子（基于重要性、置信度、访问频率）
    const strengthFactor = (
      memory.importance * 0.4 +
      memory.confidence * 0.3 +
      Math.min(memory.accessCount / 100, 1) * 0.3
    );

    // 遗忘曲线参数
    const forgettingRate = 1 / (strengthFactor * 10); // 遗忘速率
    const decayRate = Math.exp(-ageInDays * forgettingRate);

    // 考虑强化因子
    const reinforcementBoost = Math.min(memory.reinforcementCount * 0.1, 0.5);

    return Math.min(decayRate + reinforcementBoost, 1);
  }

  /**
   * 记忆压缩
   */
  async compressMemories(): Promise<CompressionResult> {
    const result: CompressionResult = {
      processedCount: 0,
      compressedCount: 0,
      spaceSaved: 0
    };

    for (const [memoryId, memory] of this.memoryStore.entries()) {
      result.processedCount++;

      // 判断是否需要压缩
      if (this.shouldCompress(memory)) {
        const originalSize = this.estimateMemorySize(memory);
        const compressedMemory = await this.compressMemory(memory);
        const compressedSize = this.estimateMemorySize(compressedMemory);

        // 更新记忆
        this.memoryStore.set(memoryId, compressedMemory);
        const layerStore = this.layerStores.get(memory.layer);
        if (layerStore) {
          layerStore.set(memoryId, compressedMemory);
        }

        result.compressedCount++;
        result.spaceSaved += originalSize - compressedSize;
      }
    }

    return result;
  }

  private shouldCompress(memory: EnhancedMemoryEntry): boolean {
    // 压缩条件：
    // 1. 记忆较老且访问频率低
    // 2. 内容较长但重要性一般
    // 3. 已有压缩标记但压缩级别较低

    const ageInDays = (Date.now() - memory.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    const isOldAndRarelyAccessed = ageInDays > 30 && memory.accessCount < 5;
    const isLongAndMediumImportance = memory.content.length > 1000 && memory.importance < 0.6;
    const canIncreaseCompression = (memory.compressionLevel || 0) < 3;

    return (isOldAndRarelyAccessed || isLongAndMediumImportance) && canIncreaseCompression;
  }

  private async compressMemory(memory: EnhancedMemoryEntry): Promise<EnhancedMemoryEntry> {
    const compressionLevel = (memory.compressionLevel || 0) + 1;

    let compressedContent = memory.content;

    switch (compressionLevel) {
      case 1:
        // 轻度压缩：移除冗余空白和标点
        compressedContent = memory.content.replace(/\s+/g, ' ').trim();
        break;

      case 2:
        // 中度压缩：提取关键句子
        compressedContent = this.extractKeySentences(memory.content);
        break;

      case 3:
        // 重度压缩：生成摘要
        compressedContent = this.generateSummary(memory.content);
        break;

      default:
        break;
    }

    return {
      ...memory,
      content: compressedContent,
      compressionLevel,
      metadata: {
        ...memory.metadata,
        originalLength: memory.content.length,
        compressionRatio: compressedContent.length / memory.content.length
      },
      updatedAt: new Date()
    };
  }

  private extractKeySentences(content: string): string {
    // 简化的关键句提取算法
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length <= 3) return content;

    // 保留最长的几个句子作为关键信息
    return sentences
      .sort((a, b) => b.length - a.length)
      .slice(0, Math.ceil(sentences.length * 0.6))
      .join('. ') + '.';
  }

  private generateSummary(content: string): string {
    // 极简摘要生成
    const words = content.split(/\s+/);
    if (words.length <= 50) return content;

    // 保留前后部分和一些关键词
    const summary = words.slice(0, 20).join(' ') + '...' + words.slice(-10).join(' ');
    return summary;
  }

  /**
   * 记忆整合（将相似记忆合并）
   */
  async consolidateMemories(): Promise<ConsolidationResult> {
    const result: ConsolidationResult = {
      processedCount: 0,
      consolidatedCount: 0,
      groupsCreated: 0
    };

    const memoryGroups = await this.findSimilarMemoryGroups();
    result.groupsCreated = memoryGroups.length;

    for (const group of memoryGroups) {
      if (group.memories.length < 2) continue;

      const consolidatedMemory = await this.consolidateMemoryGroup(group);

      // 移除原记忆，添加整合后的记忆
      for (const memory of group.memories) {
        await this.deleteMemory(memory.id);
      }

      await this.addConsolidatedMemory(consolidatedMemory);

      result.processedCount += group.memories.length;
      result.consolidatedCount++;
    }

    return result;
  }

  private async findSimilarMemoryGroups(): Promise<MemoryGroup[]> {
    const groups: MemoryGroup[] = [];
    const processed = new Set<string>();

    for (const [memoryId, memory] of this.memoryStore.entries()) {
      if (processed.has(memoryId)) continue;

      const similarMemories = await this.findSimilarMemories(memory);
      if (similarMemories.length > 0) {
        const group: MemoryGroup = {
          id: this.generateGroupId(),
          memories: [memory, ...similarMemories],
          similarity: this.calculateGroupSimilarity([memory, ...similarMemories]),
          consolidationPriority: this.calculateConsolidationPriority([memory, ...similarMemories])
        };

        groups.push(group);

        // 标记已处理
        [memory, ...similarMemories].forEach(m => processed.add(m.id));
      }
    }

    return groups.sort((a, b) => b.consolidationPriority - a.consolidationPriority);
  }

  private async findSimilarMemories(memory: EnhancedMemoryEntry): Promise<EnhancedMemoryEntry[]> {
    const similar: EnhancedMemoryEntry[] = [];
    const threshold = 0.8;

    for (const [otherId, otherMemory] of this.memoryStore.entries()) {
      if (otherId === memory.id || otherMemory.layer !== memory.layer) continue;

      const similarity = this.calculateContentSimilarity(memory, otherMemory);
      if (similarity >= threshold) {
        similar.push(otherMemory);
      }
    }

    return similar;
  }

  private calculateContentSimilarity(memory1: EnhancedMemoryEntry, memory2: EnhancedMemoryEntry): number {
    // 简化的内容相似度计算
    const words1 = new Set(memory1.content.toLowerCase().split(/\s+/));
    const words2 = new Set(memory2.content.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size; // Jaccard相似度
  }

  private calculateGroupSimilarity(memories: EnhancedMemoryEntry[]): number {
    if (memories.length < 2) return 0;

    let totalSimilarity = 0;
    let pairCount = 0;

    for (let i = 0; i < memories.length - 1; i++) {
      for (let j = i + 1; j < memories.length; j++) {
        totalSimilarity += this.calculateContentSimilarity(memories[i], memories[j]);
        pairCount++;
      }
    }

    return totalSimilarity / pairCount;
  }

  private calculateConsolidationPriority(memories: EnhancedMemoryEntry[]): number {
    const avgImportance = memories.reduce((sum, m) => sum + m.importance, 0) / memories.length;
    const totalAccessCount = memories.reduce((sum, m) => sum + m.accessCount, 0);
    const avgAge = memories.reduce((sum, m) => {
      const age = (Date.now() - m.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      return sum + age;
    }, 0) / memories.length;

    // 优先级 = 重要性 + 访问频率 - 年龄因子
    return avgImportance * 0.4 + Math.min(totalAccessCount / 100, 1) * 0.4 + (1 / (avgAge + 1)) * 0.2;
  }

  private async consolidateMemoryGroup(group: MemoryGroup): Promise<EnhancedMemoryEntry> {
    const memories = group.memories;
    const primaryMemory = memories.reduce((prev, current) =>
      prev.importance > current.importance ? prev : current
    );

    // 合并内容
    const consolidatedContent = this.mergeMemoryContents(memories);

    // 合并元数据
    const consolidatedMetadata = this.mergeMetadata(memories);

    // 合并关联
    const consolidatedAssociations = this.mergeAssociations(memories);

    return {
      ...primaryMemory,
      id: this.generateMemoryId(),
      content: consolidatedContent,
      metadata: consolidatedMetadata,
      associations: consolidatedAssociations,
      confidence: Math.max(...memories.map(m => m.confidence)),
      importance: Math.max(...memories.map(m => m.importance)),
      accessCount: memories.reduce((sum, m) => sum + m.accessCount, 0),
      tags: [...new Set(memories.flatMap(m => m.tags))],
      categories: [...new Set(memories.flatMap(m => m.categories))],
      derivedFrom: memories.map(m => m.id),
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * 强化关联关系
   */
  async reinforceAssociations(): Promise<ReinforcementResult> {
    const result: ReinforcementResult = {
      processedCount: 0,
      strengthenedCount: 0,
      weakenedCount: 0,
      removedCount: 0
    };

    // 收集所有关联
    const allAssociations = new Map<string, MemoryAssociation>();

    for (const memory of this.memoryStore.values()) {
      for (const association of memory.associations) {
        allAssociations.set(association.id, association);
        result.processedCount++;
      }
    }

    // 强化或弱化关联
    for (const association of allAssociations.values()) {
      const strengthChange = await this.calculateAssociationStrengthChange(association);

      if (strengthChange > 0.1) {
        association.strength = Math.min(association.strength + strengthChange, 1);
        result.strengthenedCount++;
      } else if (strengthChange < -0.1) {
        association.strength = Math.max(association.strength + strengthChange, 0);
        if (association.strength < 0.1) {
          await this.removeAssociation(association);
          result.removedCount++;
        } else {
          result.weakenedCount++;
        }
      }

      association.lastActivated = new Date();
    }

    return result;
  }

  /**
   * 去重处理
   */
  async deduplicateMemories(): Promise<DeduplicationResult> {
    const result: DeduplicationResult = {
      processedCount: 0,
      duplicatesFound: 0,
      removedCount: 0
    };

    const duplicateGroups = await this.findDuplicateMemories();

    for (const group of duplicateGroups) {
      result.duplicatesFound += group.length;

      // 保留最重要的记忆
      const keeper = group.reduce((prev, current) =>
        prev.importance > current.importance ? prev : current
      );

      // 删除其他重复记忆
      for (const memory of group) {
        if (memory.id !== keeper.id) {
          await this.deleteMemory(memory.id);
          result.removedCount++;
        }
      }

      result.processedCount += group.length;
    }

    return result;
  }

  private async findDuplicateMemories(): Promise<EnhancedMemoryEntry[][]> {
    const groups: EnhancedMemoryEntry[][] = [];
    const processed = new Set<string>();

    for (const [memoryId, memory] of this.memoryStore.entries()) {
      if (processed.has(memoryId)) continue;

      const duplicates = [];
      for (const [otherId, otherMemory] of this.memoryStore.entries()) {
        if (otherId === memoryId || processed.has(otherId)) continue;

        if (this.areMemoriesDuplicate(memory, otherMemory)) {
          duplicates.push(otherMemory);
        }
      }

      if (duplicates.length > 0) {
        const group = [memory, ...duplicates];
        groups.push(group);

        group.forEach(m => processed.add(m.id));
      }
    }

    return groups;
  }

  private areMemoriesDuplicate(memory1: EnhancedMemoryEntry, memory2: EnhancedMemoryEntry): boolean {
    // 内容完全相同
    if (memory1.content === memory2.content) return true;

    // 内容高度相似且其他属性匹配
    const similarity = this.calculateContentSimilarity(memory1, memory2);
    if (similarity > 0.95 &&
        memory1.layer === memory2.layer &&
        memory1.source === memory2.source) {
      return true;
    }

    return false;
  }

  /**
   * 生成优化建议
   */
  async generateOptimizationSuggestions(): Promise<TransitionSuggestion[]> {
    const suggestions: TransitionSuggestion[] = [];

    // 分析系统状态
    const systemAnalysis = await this.analyzeSystemHealth();

    // 生成基于分析的建议
    if (systemAnalysis.memoryFragmentation > 0.7) {
      suggestions.push({
        id: this.generateSuggestionId(),
        confidence: 0.8,
        priority: 'high',
        suggestedTransition: 'memory_consolidation',
        targetMemories: systemAnalysis.fragmentedMemoryIds,
        reasoning: '检测到高度的记忆碎片化，建议进行记忆整合以提高效率',
        expectedBenefits: ['减少存储占用', '提高检索速度', '改善系统性能'],
        potentialRisks: ['可能丢失细节信息'],
        estimatedImpact: {
          memoryCount: systemAnalysis.fragmentedMemoryIds.length,
          storageChange: -0.3,
          performanceChange: 0.2,
          qualityChange: -0.05
        },
        generatedAt: new Date(),
        generatedBy: 'memory_optimizer',
        appliedCount: 0,
        successRate: 0.85
      });
    }

    if (systemAnalysis.lowQualityMemoryRatio > 0.2) {
      suggestions.push({
        id: this.generateSuggestionId(),
        confidence: 0.7,
        priority: 'medium',
        suggestedTransition: 'quality_improvement',
        targetMemories: systemAnalysis.lowQualityMemoryIds,
        reasoning: '发现较多低质量记忆，建议进行质量提升或清理',
        expectedBenefits: ['提高整体记忆质量', '减少噪音干扰'],
        potentialRisks: ['可能删除有用信息'],
        estimatedImpact: {
          memoryCount: systemAnalysis.lowQualityMemoryIds.length,
          storageChange: -0.1,
          performanceChange: 0.15,
          qualityChange: 0.3
        },
        generatedAt: new Date(),
        generatedBy: 'memory_optimizer',
        appliedCount: 0,
        successRate: 0.75
      });
    }

    return suggestions;
  }

  // === 私有辅助方法 ===

  private async analyzeSystemHealth(): Promise<SystemHealthAnalysis> {
    const memories = Array.from(this.memoryStore.values());

    const fragmentedMemoryIds = memories
      .filter(m => m.associations.length < 2 && m.accessCount < 3)
      .map(m => m.id);

    const lowQualityMemoryIds = memories
      .filter(m => m.confidence < 0.5 || m.importance < 0.3)
      .map(m => m.id);

    return {
      totalMemories: memories.length,
      memoryFragmentation: fragmentedMemoryIds.length / memories.length,
      lowQualityMemoryRatio: lowQualityMemoryIds.length / memories.length,
      fragmentedMemoryIds,
      lowQualityMemoryIds,
      averageQuality: memories.reduce((sum, m) => sum + m.confidence, 0) / memories.length,
      systemCoherence: this.calculateSystemCoherence()
    };
  }

  private calculateSystemCoherence(): number {
    // 简化的系统连贯性计算
    const memories = Array.from(this.memoryStore.values());
    const totalAssociations = memories.reduce((sum, m) => sum + m.associations.length, 0);
    return Math.min(totalAssociations / (memories.length * 2), 1);
  }

  private calculatePerformanceMetrics(): PerformanceMetrics {
    return {
      memoryUtilization: 0.75,
      retrievalSpeed: 0.85,
      storageEfficiency: 0.80,
      qualityScore: 0.78,
      coherenceScore: 0.82
    };
  }

  // 辅助方法实现...
  private async deleteMemory(memoryId: string): Promise<void> {
    const memory = this.memoryStore.get(memoryId);
    if (memory) {
      this.memoryStore.delete(memoryId);
      const layerStore = this.layerStores.get(memory.layer);
      if (layerStore) {
        layerStore.delete(memoryId);
      }
    }
  }

  private async archiveMemory(memory: EnhancedMemoryEntry): Promise<void> {
    memory.state = 'archived';
    memory.updatedAt = new Date();
  }

  private async strengthenMemory(memory: EnhancedMemoryEntry, factor: number): Promise<void> {
    memory.confidence = Math.min(memory.confidence * factor, 1);
    memory.importance = Math.min(memory.importance * factor, 1);
    memory.reinforcementCount++;
    memory.updatedAt = new Date();
  }

  private estimateMemorySize(memory: EnhancedMemoryEntry): number {
    return JSON.stringify(memory).length;
  }

  private async calculateAssociationStrengthChange(association: MemoryAssociation): Promise<number> {
    // 基于激活频率和时间衰减计算强度变化
    const timeSinceLastActivation = association.lastActivated
      ? Date.now() - association.lastActivated.getTime()
      : Infinity;

    const daysSinceActivation = timeSinceLastActivation / (1000 * 60 * 60 * 24);

    // 如果长期未激活，强度下降
    if (daysSinceActivation > 30) {
      return -0.1;
    }

    // 如果频繁激活，强度上升
    if (association.activationCount > 10 && daysSinceActivation < 7) {
      return 0.05;
    }

    return 0;
  }

  private async removeAssociation(association: MemoryAssociation): Promise<void> {
    // 从相关记忆中移除此关联
    console.log(`Removing association: ${association.id}`);
  }

  private async optimizeIndices(): Promise<void> {
    // 优化索引结构
    console.log('Optimizing memory indices...');
  }

  private async addConsolidatedMemory(memory: EnhancedMemoryEntry): Promise<void> {
    this.memoryStore.set(memory.id, memory);
    const layerStore = this.layerStores.get(memory.layer);
    if (layerStore) {
      layerStore.set(memory.id, memory);
    }
  }

  private mergeMemoryContents(memories: EnhancedMemoryEntry[]): string {
    return memories.map(m => m.content).join('\n---\n');
  }

  private mergeMetadata(memories: EnhancedMemoryEntry[]): Record<string, any> {
    const merged: Record<string, any> = {};

    memories.forEach(memory => {
      Object.entries(memory.metadata || {}).forEach(([key, value]) => {
        if (!merged[key]) {
          merged[key] = value;
        } else if (Array.isArray(merged[key])) {
          if (Array.isArray(value)) {
            merged[key] = [...merged[key], ...value];
          } else {
            merged[key].push(value);
          }
        }
      });
    });

    return merged;
  }

  private mergeAssociations(memories: EnhancedMemoryEntry[]): MemoryAssociation[] {
    const associationMap = new Map<string, MemoryAssociation>();

    memories.forEach(memory => {
      memory.associations.forEach(assoc => {
        const existing = associationMap.get(assoc.targetMemoryId);
        if (!existing || assoc.strength > existing.strength) {
          associationMap.set(assoc.targetMemoryId, assoc);
        }
      });
    });

    return Array.from(associationMap.values());
  }

  // ID生成器
  private generateOptimizationId(): string {
    return `opt_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private generateGroupId(): string {
    return `group_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private generateMemoryId(): string {
    return `mem_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private generateSuggestionId(): string {
    return `sug_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
}

// === 相关接口定义 ===

export interface MemoryOptimizerConfig {
  decayEnabled?: boolean;
  compressionEnabled?: boolean;
  consolidationEnabled?: boolean;
  maxCompressionLevel?: number;
  optimizationInterval?: number;
}

export interface OptimizationResult {
  optimizationId: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  tasksExecuted: string[];
  memoryChanges: {
    compressed: number;
    archived: number;
    deleted: number;
    consolidated: number;
    strengthened: number;
  };
  performanceGains: {
    storageReduced: number;
    retrievalSpeedImproved: number;
    qualityImproved: number;
  };
  errors: {
    task: string;
    error: string;
    timestamp: Date;
  }[];
}

export interface DecayResult {
  processedCount: number;
  archivedCount: number;
  deletedCount: number;
  strengthenedCount: number;
}

export interface CompressionResult {
  processedCount: number;
  compressedCount: number;
  spaceSaved: number;
}

export interface ConsolidationResult {
  processedCount: number;
  consolidatedCount: number;
  groupsCreated: number;
}

export interface ReinforcementResult {
  processedCount: number;
  strengthenedCount: number;
  weakenedCount: number;
  removedCount: number;
}

export interface DeduplicationResult {
  processedCount: number;
  duplicatesFound: number;
  removedCount: number;
}

interface MemoryGroup {
  id: string;
  memories: EnhancedMemoryEntry[];
  similarity: number;
  consolidationPriority: number;
}

interface OptimizationEvent {
  id: string;
  timestamp: Date;
  type: string;
  result: OptimizationResult;
  performance: PerformanceMetrics;
}

interface SystemHealthAnalysis {
  totalMemories: number;
  memoryFragmentation: number;
  lowQualityMemoryRatio: number;
  fragmentedMemoryIds: string[];
  lowQualityMemoryIds: string[];
  averageQuality: number;
  systemCoherence: number;
}

interface PerformanceMetrics {
  memoryUtilization: number;
  retrievalSpeed: number;
  storageEfficiency: number;
  qualityScore: number;
  coherenceScore: number;
}