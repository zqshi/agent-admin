import { MCPToolStatus, MCPTool, StatusHistoryEntry } from '../types';

// 状态转换规则
export const STATE_TRANSITIONS: Record<MCPToolStatus, MCPToolStatus[]> = {
  draft: ['configuring'],
  configuring: ['draft', 'testing'],
  testing: ['configuring', 'pending_release', 'draft'],
  pending_release: ['testing', 'published'],
  published: ['maintenance', 'retired'],
  maintenance: ['published', 'retired'],
  retired: []
};

// 状态描述
export const STATE_DESCRIPTIONS: Record<MCPToolStatus, string> = {
  draft: '工具处于草稿状态，可以修改基础信息',
  configuring: '正在配置工具连接和参数',
  testing: '工具正在测试环境中验证',
  pending_release: '测试通过，等待发布到生产环境',
  published: '工具已发布，可供生产使用',
  maintenance: '工具暂时停用，正在维护',
  retired: '工具已永久下线'
};

// 状态要求和限制
export const STATE_REQUIREMENTS: Record<MCPToolStatus, {
  canEdit: boolean;
  canTest: boolean;
  canDelete: boolean;
  requiredFields: string[];
  description: string;
}> = {
  draft: {
    canEdit: true,
    canTest: false,
    canDelete: true,
    requiredFields: ['name', 'displayName', 'description'],
    description: '可以编辑所有字段，无法测试或使用'
  },
  configuring: {
    canEdit: true,
    canTest: false,
    canDelete: true,
    requiredFields: ['name', 'displayName', 'description', 'connectionType', 'config'],
    description: '正在配置连接参数，无法测试'
  },
  testing: {
    canEdit: false,
    canTest: true,
    canDelete: true,
    requiredFields: ['name', 'displayName', 'description', 'connectionType', 'config', 'capabilities'],
    description: '只能在测试环境使用，配置已锁定'
  },
  pending_release: {
    canEdit: false,
    canTest: true,
    canDelete: false,
    requiredFields: ['name', 'displayName', 'description', 'connectionType', 'config', 'capabilities'],
    description: '等待发布，配置和测试结果已确认'
  },
  published: {
    canEdit: false,
    canTest: true,
    canDelete: false,
    requiredFields: ['name', 'displayName', 'description', 'connectionType', 'config', 'capabilities'],
    description: '生产环境可用，只读状态'
  },
  maintenance: {
    canEdit: false,
    canTest: false,
    canDelete: false,
    requiredFields: ['name', 'displayName', 'description', 'connectionType', 'config', 'capabilities'],
    description: '维护模式，暂停对外服务'
  },
  retired: {
    canEdit: false,
    canTest: false,
    canDelete: false,
    requiredFields: [],
    description: '已下线，仅保留历史记录'
  }
};

/**
 * 检查状态转换是否有效
 */
export function isValidTransition(from: MCPToolStatus, to: MCPToolStatus): boolean {
  return STATE_TRANSITIONS[from]?.includes(to) || false;
}

/**
 * 获取当前状态可以转换到的状态列表
 */
export function getAvailableTransitions(currentStatus: MCPToolStatus): MCPToolStatus[] {
  return STATE_TRANSITIONS[currentStatus] || [];
}

/**
 * 获取状态转换的建议操作
 */
export function getTransitionActions(currentStatus: MCPToolStatus): Array<{
  targetStatus: MCPToolStatus;
  action: string;
  description: string;
  icon: string;
  variant: 'primary' | 'secondary' | 'danger' | 'warning';
}> {
  const actions: Array<{
    targetStatus: MCPToolStatus;
    action: string;
    description: string;
    icon: string;
    variant: 'primary' | 'secondary' | 'danger' | 'warning';
  }> = [];

  const availableTransitions = getAvailableTransitions(currentStatus);

  availableTransitions.forEach(targetStatus => {
    switch (targetStatus) {
      case 'configuring':
        actions.push({
          targetStatus,
          action: 'configure',
          description: '开始配置',
          icon: '⚙️',
          variant: 'primary'
        });
        break;
      case 'testing':
        actions.push({
          targetStatus,
          action: 'start_testing',
          description: '开始测试',
          icon: '🧪',
          variant: 'primary'
        });
        break;
      case 'pending_release':
        actions.push({
          targetStatus,
          action: 'approve_for_release',
          description: '批准发布',
          icon: '✅',
          variant: 'primary'
        });
        break;
      case 'published':
        actions.push({
          targetStatus,
          action: 'publish',
          description: '正式发布',
          icon: '🚀',
          variant: 'primary'
        });
        break;
      case 'maintenance':
        actions.push({
          targetStatus,
          action: 'enter_maintenance',
          description: '进入维护',
          icon: '🔧',
          variant: 'warning'
        });
        break;
      case 'retired':
        actions.push({
          targetStatus,
          action: 'retire',
          description: '永久下线',
          icon: '🗑️',
          variant: 'danger'
        });
        break;
      case 'draft':
        actions.push({
          targetStatus,
          action: 'back_to_draft',
          description: '回到草稿',
          icon: '📝',
          variant: 'secondary'
        });
        break;
    }
  });

  return actions;
}

/**
 * 验证工具是否满足状态转换的要求
 */
export function validateStateTransition(
  tool: MCPTool, 
  targetStatus: MCPToolStatus
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 检查状态转换是否有效
  if (!isValidTransition(tool.status, targetStatus)) {
    errors.push(`无法从 ${tool.status} 状态转换到 ${targetStatus} 状态`);
    return { isValid: false, errors };
  }

  const requirements = STATE_REQUIREMENTS[targetStatus];

  // 检查必需字段
  requirements.requiredFields.forEach(field => {
    switch (field) {
      case 'name':
        if (!tool.name?.trim()) errors.push('工具名称不能为空');
        break;
      case 'displayName':
        if (!tool.displayName?.trim()) errors.push('显示名称不能为空');
        break;
      case 'description':
        if (!tool.description?.trim()) errors.push('工具描述不能为空');
        break;
      case 'connectionType':
        if (!tool.config?.connectionType) errors.push('连接类型未配置');
        break;
      case 'config':
        if (!validateToolConfig(tool)) errors.push('工具配置不完整');
        break;
      case 'capabilities':
        if (!tool.capabilities || tool.capabilities.length === 0) {
          errors.push('工具能力未发现或未配置');
        }
        break;
    }
  });

  // 特殊状态验证
  switch (targetStatus) {
    case 'testing':
      if (!tool.testing?.testCases || tool.testing.testCases.length === 0) {
        errors.push('进入测试状态需要至少一个测试用例');
      }
      break;
    case 'pending_release':
      if (!tool.testing?.lastTestResult || tool.testing.lastTestResult.status !== 'passed') {
        errors.push('需要通过测试才能申请发布');
      }
      break;
    case 'published':
      if (!tool.permissions?.allowedDepartments || tool.permissions.allowedDepartments.length === 0) {
        errors.push('发布前需要配置访问权限');
      }
      break;
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * 验证工具配置是否完整
 */
function validateToolConfig(tool: MCPTool): boolean {
  const config = tool.config;
  if (!config) return false;

  switch (config.connectionType) {
    case 'stdio':
      return !!(config.stdio?.command);
    case 'http':
    case 'sse':
      return !!(config.network?.url);
    default:
      return false;
  }
}

/**
 * 执行状态转换
 */
export function transitionToolState(
  tool: MCPTool,
  targetStatus: MCPToolStatus,
  operator: string,
  reason?: string
): MCPTool {
  const validation = validateStateTransition(tool, targetStatus);
  if (!validation.isValid) {
    throw new Error(`状态转换失败: ${validation.errors.join(', ')}`);
  }

  const historyEntry: StatusHistoryEntry = {
    id: `hist_${Date.now()}`,
    fromStatus: tool.status,
    toStatus: targetStatus,
    timestamp: new Date().toISOString(),
    operator,
    reason: reason || getDefaultTransitionReason(tool.status, targetStatus)
  };

  return {
    ...tool,
    status: targetStatus,
    updatedAt: new Date().toISOString(),
    statusHistory: [...tool.statusHistory, historyEntry]
  };
}

/**
 * 获取默认的状态转换原因
 */
function getDefaultTransitionReason(from: MCPToolStatus, to: MCPToolStatus): string {
  const transitions: Record<string, string> = {
    'draft->configuring': '开始配置工具参数',
    'configuring->testing': '配置完成，进入测试阶段',
    'testing->pending_release': '测试通过，申请发布',
    'pending_release->published': '审核通过，正式发布',
    'published->maintenance': '发现问题，进入维护模式',
    'maintenance->published': '维护完成，恢复服务',
    'published->retired': '工具生命周期结束，永久下线',
    'testing->draft': '测试未通过，回到草稿状态'
  };

  const key = `${from}->${to}`;
  return transitions[key] || `从 ${from} 转换到 ${to}`;
}

/**
 * 获取状态统计信息
 */
export function getStatusStatistics(tools: MCPTool[]) {
  const stats = tools.reduce((acc, tool) => {
    acc[tool.status] = (acc[tool.status] || 0) + 1;
    return acc;
  }, {} as Record<MCPToolStatus, number>);

  const total = tools.length;
  const healthScore = total > 0 ? (
    ((stats.published || 0) * 3 + (stats.testing || 0) * 2 + (stats.pending_release || 0) * 2.5) / 
    (total * 3)
  ) * 100 : 0;

  return {
    stats,
    total,
    healthScore: Math.round(healthScore),
    recommendations: generateRecommendations(stats)
  };
}

/**
 * 生成运维建议
 */
function generateRecommendations(stats: Record<MCPToolStatus, number>): string[] {
  const recommendations: string[] = [];

  if ((stats.draft || 0) > 5) {
    recommendations.push('有较多草稿状态的工具，建议及时完成配置和测试');
  }

  if ((stats.maintenance || 0) > 2) {
    recommendations.push('维护中的工具较多，可能影响系统可用性');
  }

  if ((stats.testing || 0) > (stats.published || 0)) {
    recommendations.push('测试中的工具较多，建议加快发布流程');
  }

  if ((stats.published || 0) === 0) {
    recommendations.push('暂无已发布的工具，系统功能可能不完整');
  }

  return recommendations;
}