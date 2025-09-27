/**
 * 语义记忆管理组件
 * 管理抽象知识、概念网络和逻辑推理结构
 */

import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Network,
  Lightbulb,
  Link,
  Search,
  Filter,
  ArrowRight,
  Star,
  Tag,
  Brain,
  GitBranch,
  Layers
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/progress';
import { EnhancedMemoryEntry, MemoryLayerState } from '../../types';

interface SemanticMemoryProps {
  employeeId: string;
  memories: EnhancedMemoryEntry[];
  layerState: MemoryLayerState;
  onMemorySelect?: (memory: EnhancedMemoryEntry) => void;
  onMemoryTransfer?: (memoryId: string, targetLayer: string) => void;
  onConceptExplore?: (conceptId: string) => void;
}

interface ConceptNode {
  id: string;
  name: string;
  type: 'entity' | 'concept' | 'relation' | 'rule' | 'pattern';
  importance: number;
  connections: string[];
  properties: Record<string, any>;
  relatedMemories: string[];
  abstractionLevel: number; // 0=具体, 1=抽象
}

interface KnowledgeCluster {
  id: string;
  name: string;
  concepts: ConceptNode[];
  coherence: number;
  coverage: number;
  domain: string;
}

export const SemanticMemory: React.FC<SemanticMemoryProps> = ({
  employeeId,
  memories,
  layerState,
  onMemorySelect,
  onMemoryTransfer,
  onConceptExplore
}) => {
  const [selectedConcept, setSelectedConcept] = useState<ConceptNode | null>(null);
  const [viewMode, setViewMode] = useState<'concepts' | 'network' | 'clusters'>('concepts');
  const [filterType, setFilterType] = useState<'all' | 'entity' | 'concept' | 'relation' | 'rule'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 从记忆中提取概念
  const concepts = useMemo(() => {
    const conceptMap = new Map<string, ConceptNode>();

    if (!memories || !Array.isArray(memories)) {
      return [];
    }

    memories.forEach(memory => {
      // 简化的概念提取逻辑
      const extractedConcepts = extractConceptsFromMemory(memory);
      extractedConcepts.forEach(concept => {
        if (conceptMap.has(concept.id)) {
          const existing = conceptMap.get(concept.id)!;
          existing.relatedMemories.push(memory.id);
          existing.importance = Math.max(existing.importance, concept.importance);
        } else {
          conceptMap.set(concept.id, {
            ...concept,
            relatedMemories: [memory.id]
          });
        }
      });
    });

    return Array.from(conceptMap.values());
  }, [memories]);

  // 过滤概念
  const filteredConcepts = useMemo(() => {
    let filtered = concepts;

    if (filterType !== 'all') {
      filtered = filtered.filter(concept => concept.type === filterType);
    }

    if (searchQuery) {
      filtered = filtered.filter(concept =>
        concept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        Object.values(concept.properties).some(prop =>
          String(prop).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    return filtered.sort((a, b) => b.importance - a.importance);
  }, [concepts, filterType, searchQuery]);

  // 知识聚类
  const knowledgeClusters = useMemo(() => {
    return clusterConcepts(concepts);
  }, [concepts]);

  // 统计信息
  const stats = useMemo(() => {
    const totalConcepts = concepts.length;
    const highImportanceConcepts = concepts.filter(c => c.importance > 0.7).length;
    const totalConnections = concepts.reduce((sum, c) => sum + c.connections.length, 0);
    const avgConnectivity = totalConcepts > 0 ? totalConnections / totalConcepts : 0;

    const typeDistribution = concepts.reduce((acc, concept) => {
      acc[concept.type] = (acc[concept.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: totalConcepts,
      highImportance: highImportanceConcepts,
      avgConnectivity,
      typeDistribution,
      clusters: knowledgeClusters.length
    };
  }, [concepts, knowledgeClusters]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'entity': return <Tag className="h-4 w-4" />;
      case 'concept': return <Lightbulb className="h-4 w-4" />;
      case 'relation': return <Link className="h-4 w-4" />;
      case 'rule': return <GitBranch className="h-4 w-4" />;
      case 'pattern': return <Layers className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'entity': return 'bg-blue-100 text-blue-800';
      case 'concept': return 'bg-green-100 text-green-800';
      case 'relation': return 'bg-purple-100 text-purple-800';
      case 'rule': return 'bg-orange-100 text-orange-800';
      case 'pattern': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImportanceStars = (importance: number) => {
    const stars = Math.round(importance * 5);
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${i < stars ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* 语义记忆概览 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Network className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-semibold">语义记忆</h3>
              <Badge variant="secondary">{stats.total}个概念</Badge>
            </div>
          </div>

          {/* 统计指标 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.total}</div>
              <div className="text-sm text-gray-600">概念总数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.highImportance}</div>
              <div className="text-sm text-gray-600">核心概念</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.avgConnectivity.toFixed(1)}</div>
              <div className="text-sm text-gray-600">平均连接度</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.clusters}</div>
              <div className="text-sm text-gray-600">知识群组</div>
            </div>
          </div>

          {/* 类型分布 */}
          <div className="space-y-2">
            <div className="text-sm font-medium">概念类型分布</div>
            <div className="flex flex-wrap gap-3 text-sm">
              {Object.entries(stats.typeDistribution).map(([type, count]) => (
                <div key={type} className="flex items-center space-x-1">
                  {getTypeIcon(type)}
                  <span>{type}: {count}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 控制面板 */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'concepts' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('concepts')}
          >
            概念列表
          </Button>
          <Button
            variant={viewMode === 'network' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('network')}
          >
            概念网络
          </Button>
          <Button
            variant={viewMode === 'clusters' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('clusters')}
          >
            知识群组
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="搜索概念..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-48"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="all">所有类型</option>
            <option value="entity">实体</option>
            <option value="concept">概念</option>
            <option value="relation">关系</option>
            <option value="rule">规则</option>
            <option value="pattern">模式</option>
          </select>
        </div>
      </div>

      {/* 概念列表视图 */}
      {viewMode === 'concepts' && (
        <div className="space-y-4">
          {filteredConcepts.map((concept) => (
            <Card
              key={concept.id}
              className={`cursor-pointer hover:shadow-md transition-shadow ${
                selectedConcept?.id === concept.id ? 'ring-2 ring-green-500' : ''
              }`}
              onClick={() => setSelectedConcept(concept)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={getTypeColor(concept.type)}>
                        {getTypeIcon(concept.type)}
                        <span className="ml-1">{concept.type}</span>
                      </Badge>
                      <div className="flex items-center space-x-1">
                        {getImportanceStars(concept.importance)}
                      </div>
                      <Badge variant="outline">
                        {concept.abstractionLevel === 0 ? '具体' : '抽象'}
                      </Badge>
                    </div>

                    <h4 className="font-semibold text-lg mb-2">{concept.name}</h4>

                    {/* 概念属性 */}
                    {Object.keys(concept.properties).length > 0 && (
                      <div className="mb-3">
                        <div className="text-sm font-medium mb-1">属性</div>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(concept.properties).slice(0, 5).map(([key, value], idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {key}: {String(value)}
                            </Badge>
                          ))}
                          {Object.keys(concept.properties).length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{Object.keys(concept.properties).length - 5}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 连接和记忆 */}
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Network className="h-3 w-3" />
                        <span>{concept.connections.length} 连接</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Brain className="h-3 w-3" />
                        <span>{concept.relatedMemories.length} 相关记忆</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onConceptExplore?.(concept.id);
                      }}
                      title="探索概念网络"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <div className="text-xs text-gray-500">
                      重要性: {(concept.importance * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredConcepts.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Network className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">暂无匹配的概念</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* 概念网络视图 */}
      {viewMode === 'network' && (
        <Card>
          <CardContent className="p-6">
            <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Network className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">概念网络可视化</p>
                <p className="text-sm text-gray-400 mt-2">
                  显示 {filteredConcepts.length} 个概念之间的关联关系
                </p>
                <Button className="mt-4" onClick={() => onConceptExplore?.('network')}>
                  打开详细网络视图
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 知识群组视图 */}
      {viewMode === 'clusters' && (
        <div className="space-y-4">
          {knowledgeClusters.map((cluster) => (
            <Card key={cluster.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Layers className="h-5 w-5 text-blue-500" />
                    <h4 className="font-semibold">{cluster.name}</h4>
                    <Badge variant="secondary">{cluster.concepts.length} 概念</Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    领域: {cluster.domain}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">连贯性</div>
                    <Progress value={cluster.coherence * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">覆盖度</div>
                    <Progress value={cluster.coverage * 100} className="h-2" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">核心概念</div>
                  <div className="flex flex-wrap gap-2">
                    {cluster.concepts.slice(0, 8).map((concept) => (
                      <Badge
                        key={concept.id}
                        className={getTypeColor(concept.type)}
                      >
                        {concept.name}
                      </Badge>
                    ))}
                    {cluster.concepts.length > 8 && (
                      <Badge variant="outline">
                        +{cluster.concepts.length - 8} 更多
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {knowledgeClusters.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Layers className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">暂无知识群组</p>
                <p className="text-sm text-gray-400 mt-1">
                  随着概念数量增加，系统会自动形成知识群组
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

// === 辅助函数 ===

function extractConceptsFromMemory(memory: EnhancedMemoryEntry): ConceptNode[] {
  // 简化的概念提取逻辑
  const words = memory.content.toLowerCase().split(/\s+/);
  const concepts: ConceptNode[] = [];

  // 提取关键词作为概念（实际应使用NLP技术）
  const keywords = words.filter(word =>
    word.length > 3 &&
    !['是的', '可以', '应该', '这样', '那样', '如何', '什么', '为什么'].includes(word)
  );

  keywords.slice(0, 5).forEach((keyword, index) => {
    concepts.push({
      id: `concept_${memory.id}_${index}`,
      name: keyword,
      type: index < 2 ? 'concept' : 'entity',
      importance: memory.importance * (1 - index * 0.1),
      connections: [],
      properties: {
        source: memory.source,
        domain: (memory.categories && memory.categories.length > 0) ? memory.categories[0] : 'general'
      },
      relatedMemories: [],
      abstractionLevel: Math.random() > 0.5 ? 1 : 0
    });
  });

  return concepts;
}

function clusterConcepts(concepts: ConceptNode[]): KnowledgeCluster[] {
  // 简化的概念聚类算法
  if (concepts.length < 3) return [];

  const domains = Array.from(new Set(concepts.map(c => c.properties.domain || 'general')));

  return domains.map(domain => {
    const domainConcepts = concepts.filter(c => (c.properties.domain || 'general') === domain);

    return {
      id: `cluster_${domain}`,
      name: `${domain} 知识群组`,
      concepts: domainConcepts,
      coherence: Math.random() * 0.3 + 0.7, // 模拟连贯性
      coverage: Math.min(domainConcepts.length / 10, 1), // 模拟覆盖度
      domain
    };
  }).filter(cluster => cluster.concepts.length > 1);
}