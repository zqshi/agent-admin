/**
 * 知识图谱可视化组件
 * 使用原生SVG实现，支持节点和关系的交互式展示
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Search, Filter, ZoomIn, ZoomOut, RotateCcw, Maximize, Download, Eye, EyeOff } from 'lucide-react';

// 知识图谱数据类型定义
interface GraphNode {
  id: string;
  name: string;
  type: 'concept' | 'entity' | 'event' | 'person' | 'document' | 'knowledge';
  x: number;
  y: number;
  size: number;
  confidence: number;
  properties?: Record<string, any>;
  connections?: string[];
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'relates_to' | 'contains' | 'caused_by' | 'mentions' | 'derived_from';
  weight: number;
  label?: string;
}

interface KnowledgeGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata?: {
    totalNodes: number;
    totalEdges: number;
    centerNode?: string;
    lastUpdated: string;
  };
}

interface KnowledgeGraphViewerProps {
  data: KnowledgeGraphData | null;
  width?: number;
  height?: number;
  interactive?: boolean;
  showControls?: boolean;
  onNodeClick?: (node: GraphNode) => void;
  onEdgeClick?: (edge: GraphEdge) => void;
}

// 节点类型配置
const NODE_STYLES = {
  concept: { color: '#3B82F6', icon: '🧠' },
  entity: { color: '#10B981', icon: '🏢' },
  event: { color: '#F59E0B', icon: '📅' },
  person: { color: '#EF4444', icon: '👤' },
  document: { color: '#8B5CF6', icon: '📄' },
  knowledge: { color: '#06B6D4', icon: '💡' }
};

// 边类型配置
const EDGE_STYLES = {
  relates_to: { color: '#6B7280', strokeWidth: 2, dash: '0' },
  contains: { color: '#059669', strokeWidth: 3, dash: '0' },
  caused_by: { color: '#DC2626', strokeWidth: 2, dash: '5,5' },
  mentions: { color: '#7C3AED', strokeWidth: 1, dash: '3,3' },
  derived_from: { color: '#EA580C', strokeWidth: 2, dash: '10,5' }
};

const KnowledgeGraphViewer: React.FC<KnowledgeGraphViewerProps> = ({
  data,
  width = 800,
  height = 600,
  interactive = true,
  showControls = true,
  onNodeClick,
  onEdgeClick
}) => {
  // 状态管理
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNodeType, setSelectedNodeType] = useState<string>('all');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showNodeLabels, setShowNodeLabels] = useState(true);
  const [showEdgeLabels, setShowEdgeLabels] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 生成示例数据（如果没有提供数据）
  const generateSampleData = useCallback((): KnowledgeGraphData => {
    const sampleNodes: GraphNode[] = [
      { id: '1', name: '客户服务', type: 'concept', x: 400, y: 300, size: 30, confidence: 0.95 },
      { id: '2', name: '问题解决', type: 'concept', x: 300, y: 200, size: 25, confidence: 0.88 },
      { id: '3', name: '产品知识', type: 'knowledge', x: 500, y: 200, size: 28, confidence: 0.92 },
      { id: '4', name: '用户手册', type: 'document', x: 600, y: 150, size: 20, confidence: 0.85 },
      { id: '5', name: '技术支持', type: 'concept', x: 350, y: 400, size: 22, confidence: 0.79 },
      { id: '6', name: 'FAQ文档', type: 'document', x: 250, y: 350, size: 18, confidence: 0.82 },
      { id: '7', name: '客户反馈', type: 'entity', x: 450, y: 450, size: 24, confidence: 0.87 },
      { id: '8', name: '系统培训', type: 'event', x: 550, y: 350, size: 20, confidence: 0.75 }
    ];

    const sampleEdges: GraphEdge[] = [
      { id: 'e1', source: '1', target: '2', type: 'contains', weight: 0.9, label: '包含' },
      { id: 'e2', source: '1', target: '3', type: 'relates_to', weight: 0.8, label: '关联' },
      { id: 'e3', source: '3', target: '4', type: 'derived_from', weight: 0.85, label: '来源' },
      { id: 'e4', source: '2', target: '5', type: 'relates_to', weight: 0.7, label: '相关' },
      { id: 'e5', source: '5', target: '6', type: 'mentions', weight: 0.6, label: '提及' },
      { id: 'e6', source: '1', target: '7', type: 'caused_by', weight: 0.75, label: '引起' },
      { id: 'e7', source: '8', target: '3', type: 'relates_to', weight: 0.65, label: '关联' }
    ];

    return {
      nodes: sampleNodes,
      edges: sampleEdges,
      metadata: {
        totalNodes: sampleNodes.length,
        totalEdges: sampleEdges.length,
        centerNode: '1',
        lastUpdated: new Date().toISOString()
      }
    };
  }, []);

  const graphData = data || generateSampleData();

  // 过滤节点和边
  const filteredNodes = graphData.nodes.filter(node => {
    const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedNodeType === 'all' || node.type === selectedNodeType;
    return matchesSearch && matchesType;
  });

  const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
  const filteredEdges = graphData.edges.filter(edge =>
    filteredNodeIds.has(edge.source) && filteredNodeIds.has(edge.target)
  );

  // 缩放控制
  const handleZoomIn = () => setScale(prev => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev / 1.2, 0.3));
  const handleReset = () => {
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);
  };

  // 鼠标事件处理
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!interactive) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - translateX,
      y: e.clientY - translateY
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !interactive) return;
    setTranslateX(e.clientX - dragStart.x);
    setTranslateY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 节点点击处理
  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
    onNodeClick?.(node);
  };

  // 边点击处理
  const handleEdgeClick = (edge: GraphEdge) => {
    onEdgeClick?.(edge);
  };

  // 获取节点样式
  const getNodeStyle = (node: GraphNode) => {
    const baseStyle = NODE_STYLES[node.type] || NODE_STYLES.concept;
    const isSelected = selectedNode?.id === node.id;
    const isHovered = hoveredNode === node.id;

    return {
      fill: baseStyle.color,
      stroke: isSelected ? '#1F2937' : isHovered ? '#374151' : '#E5E7EB',
      strokeWidth: isSelected ? 3 : isHovered ? 2 : 1,
      opacity: node.confidence
    };
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* 控制面板 */}
      {showControls && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-900">知识图谱</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {filteredNodes.length} 节点, {filteredEdges.length} 连接
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {/* 搜索 */}
            <div className="flex-1 min-w-48 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="搜索节点..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* 类型筛选 */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={selectedNodeType}
                onChange={(e) => setSelectedNodeType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">所有类型</option>
                <option value="concept">概念</option>
                <option value="entity">实体</option>
                <option value="event">事件</option>
                <option value="person">人物</option>
                <option value="document">文档</option>
                <option value="knowledge">知识</option>
              </select>
            </div>

            {/* 显示选项 */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNodeLabels(!showNodeLabels)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                  showNodeLabels ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {showNodeLabels ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                节点标签
              </button>
              <button
                onClick={() => setShowEdgeLabels(!showEdgeLabels)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                  showEdgeLabels ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {showEdgeLabels ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                边标签
              </button>
            </div>

            {/* 缩放控制 */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleZoomOut}
                className="p-1 hover:bg-gray-200 rounded"
                title="缩小"
              >
                <ZoomOut className="h-4 w-4 text-gray-600" />
              </button>
              <span className="text-xs text-gray-600 min-w-12 text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-1 hover:bg-gray-200 rounded"
                title="放大"
              >
                <ZoomIn className="h-4 w-4 text-gray-600" />
              </button>
              <button
                onClick={handleReset}
                className="p-1 hover:bg-gray-200 rounded ml-2"
                title="重置视图"
              >
                <RotateCcw className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 图谱视图 */}
      <div
        ref={containerRef}
        className="relative overflow-hidden bg-gray-50"
        style={{ height: height }}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={isDragging ? 'cursor-grabbing' : 'cursor-grab'}
        >
          <defs>
            {/* 箭头标记 */}
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#6B7280"
              />
            </marker>
          </defs>

          <g transform={`translate(${translateX}, ${translateY}) scale(${scale})`}>
            {/* 渲染边 */}
            {filteredEdges.map(edge => {
              const sourceNode = graphData.nodes.find(n => n.id === edge.source);
              const targetNode = graphData.nodes.find(n => n.id === edge.target);
              if (!sourceNode || !targetNode) return null;

              const edgeStyle = EDGE_STYLES[edge.type] || EDGE_STYLES.relates_to;

              return (
                <g key={edge.id}>
                  <line
                    x1={sourceNode.x}
                    y1={sourceNode.y}
                    x2={targetNode.x}
                    y2={targetNode.y}
                    stroke={edgeStyle.color}
                    strokeWidth={edgeStyle.strokeWidth}
                    strokeDasharray={edgeStyle.dash}
                    markerEnd="url(#arrowhead)"
                    className="cursor-pointer hover:stroke-gray-800"
                    onClick={() => handleEdgeClick(edge)}
                  />
                  {/* 边标签 */}
                  {showEdgeLabels && edge.label && (
                    <text
                      x={(sourceNode.x + targetNode.x) / 2}
                      y={(sourceNode.y + targetNode.y) / 2 - 5}
                      textAnchor="middle"
                      className="text-xs fill-gray-600 pointer-events-none"
                      style={{ fontSize: '10px' }}
                    >
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* 渲染节点 */}
            {filteredNodes.map(node => {
              const nodeStyle = getNodeStyle(node);
              const nodeType = NODE_STYLES[node.type] || NODE_STYLES.concept;

              return (
                <g key={node.id}>
                  {/* 节点圆圈 */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.size}
                    fill={nodeStyle.fill}
                    stroke={nodeStyle.stroke}
                    strokeWidth={nodeStyle.strokeWidth}
                    opacity={nodeStyle.opacity}
                    className="cursor-pointer hover:brightness-110 transition-all"
                    onClick={() => handleNodeClick(node)}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                  />

                  {/* 节点图标 */}
                  <text
                    x={node.x}
                    y={node.y + 4}
                    textAnchor="middle"
                    className="pointer-events-none select-none"
                    style={{ fontSize: '14px' }}
                  >
                    {nodeType.icon}
                  </text>

                  {/* 节点标签 */}
                  {showNodeLabels && (
                    <text
                      x={node.x}
                      y={node.y + node.size + 15}
                      textAnchor="middle"
                      className="fill-gray-700 pointer-events-none select-none text-xs"
                      style={{ fontSize: '11px' }}
                    >
                      {node.name}
                    </text>
                  )}

                  {/* 置信度指示器 */}
                  <circle
                    cx={node.x + node.size - 5}
                    cy={node.y - node.size + 5}
                    r="3"
                    fill={node.confidence > 0.8 ? '#10B981' : node.confidence > 0.6 ? '#F59E0B' : '#EF4444'}
                    className="pointer-events-none"
                  />
                </g>
              );
            })}
          </g>
        </svg>

        {/* 节点详情面板 */}
        {selectedNode && (
          <div className="absolute top-4 right-4 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">{selectedNode.name}</h4>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">类型:</span>
                <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                  {NODE_STYLES[selectedNode.type]?.icon} {selectedNode.type}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">置信度:</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${selectedNode.confidence * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500">
                  {Math.round(selectedNode.confidence * 100)}%
                </span>
              </div>
              <div>
                <span className="text-gray-600">连接数:</span>
                <span className="ml-2 font-medium">
                  {graphData.edges.filter(e =>
                    e.source === selectedNode.id || e.target === selectedNode.id
                  ).length}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 图例 */}
        <div className="absolute bottom-4 left-4 bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
          <h5 className="text-sm font-semibold text-gray-900 mb-2">节点类型</h5>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(NODE_STYLES).map(([type, style]) => (
              <div key={type} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: style.color }}
                ></div>
                <span>{style.icon} {type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeGraphViewer;