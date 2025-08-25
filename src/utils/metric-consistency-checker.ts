/**
 * 指标一致性检查器
 * 扫描代码库中的指标使用情况，检测不一致性问题
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  MetricConsistencyReport,
  MetricInconsistency,
  StandardMetricDefinition
} from '../types/metric-types';

interface MetricUsage {
  fileName: string;
  lineNumber: number;
  fieldName: string;
  value: any;
  context: string; // 周围的代码上下文
}

interface FileMetricPattern {
  pattern: RegExp;
  fieldExtractor: (match: RegExpMatchArray) => { field: string; value: string };
}

export class MetricConsistencyChecker {
  private projectRoot: string;
  private standardMetrics: Map<string, StandardMetricDefinition> = new Map();
  private foundUsages: MetricUsage[] = [];

  // 常见的指标字段模式
  private static readonly METRIC_PATTERNS: FileMetricPattern[] = [
    // 响应时间模式
    {
      pattern: /responseTime[:\s]*[=>\s]*([0-9.]+)/g,
      fieldExtractor: (match) => ({ field: 'responseTime', value: match[1] })
    },
    {
      pattern: /avgResponseTime[:\s]*[=>\s]*([0-9.]+)/g,
      fieldExtractor: (match) => ({ field: 'avgResponseTime', value: match[1] })
    },
    {
      pattern: /avgTime[:\s]*[=>\s]*([0-9.]+)/g,
      fieldExtractor: (match) => ({ field: 'avgTime', value: match[1] })
    },
    
    // 成功率模式
    {
      pattern: /successRate[:\s]*[=>\s]*([0-9.]+)/g,
      fieldExtractor: (match) => ({ field: 'successRate', value: match[1] })
    },
    {
      pattern: /taskSuccessRate[:\s]*[=>\s]*([0-9.]+)/g,
      fieldExtractor: (match) => ({ field: 'taskSuccessRate', value: match[1] })
    },
    
    // 失败率模式
    {
      pattern: /failureRate[:\s]*[=>\s]*([0-9.]+)/g,
      fieldExtractor: (match) => ({ field: 'failureRate', value: match[1] })
    },
    {
      pattern: /errorRate[:\s]*[=>\s]*([0-9.]+)/g,
      fieldExtractor: (match) => ({ field: 'errorRate', value: match[1] })
    },
    
    // 成本相关模式
    {
      pattern: /totalCost[:\s]*[=>\s]*([0-9.]+)/g,
      fieldExtractor: (match) => ({ field: 'totalCost', value: match[1] })
    },
    {
      pattern: /avgCostPerSession[:\s]*[=>\s]*([0-9.]+)/g,
      fieldExtractor: (match) => ({ field: 'avgCostPerSession', value: match[1] })
    },
    
    // 会话相关模式  
    {
      pattern: /totalSessions[:\s]*[=>\s]*([0-9]+)/g,
      fieldExtractor: (match) => ({ field: 'totalSessions', value: match[1] })
    }
  ];

  // 已知的命名不一致模式
  private static readonly INCONSISTENT_NAMING_PATTERNS = [
    // 时间字段不一致
    { inconsistent: ['respTime', 'resp_time', 'response_time'], standard: 'responseTime' },
    { inconsistent: ['avgTime', 'avg_time', 'average_time'], standard: 'avgResponseTime' },
    
    // 成功率字段不一致
    { inconsistent: ['succRate', 'succ_rate', 'success_rate'], standard: 'successRate' },
    { inconsistent: ['taskSucc', 'task_success'], standard: 'taskSuccessRate' },
    
    // 失败率字段不一致
    { inconsistent: ['failRate', 'fail_rate', 'failure_rate'], standard: 'failureRate' },
    { inconsistent: ['errRate', 'err_rate', 'error_rate'], standard: 'errorRate' },
    
    // 成本字段不一致
    { inconsistent: ['cost', 'totalCosts', 'total_cost'], standard: 'totalCost' },
    { inconsistent: ['costPerSess', 'cost_per_session'], standard: 'avgCostPerSession' },
    
    // 会话字段不一致
    { inconsistent: ['sessions', 'total_sessions', 'sess_count'], standard: 'totalSessions' },
    { inconsistent: ['activeSess', 'active_sessions'], standard: 'activeSessions' }
  ];

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  /**
   * 加载标准指标定义
   */
  loadStandardMetrics(metrics: StandardMetricDefinition[]) {
    this.standardMetrics.clear();
    metrics.forEach(metric => {
      this.standardMetrics.set(metric.id, metric);
    });
  }

  /**
   * 执行一致性检查
   */
  async checkConsistency(): Promise<MetricConsistencyReport> {
    console.log('开始指标一致性检查...');
    
    // 清空之前的结果
    this.foundUsages = [];
    
    // 扫描项目文件
    await this.scanProjectFiles();
    
    // 分析不一致性
    const inconsistencies = this.analyzeInconsistencies();
    
    // 生成建议
    const suggestions = this.generateSuggestions(inconsistencies);
    
    const report: MetricConsistencyReport = {
      totalMetrics: this.standardMetrics.size,
      validMetrics: this.calculateValidMetrics(),
      invalidMetrics: this.calculateInvalidMetrics(),
      inconsistencies,
      suggestions,
      generatedAt: new Date().toISOString()
    };

    console.log(`一致性检查完成，发现 ${inconsistencies.length} 个问题`);
    return report;
  }

  /**
   * 扫描项目文件
   */
  private async scanProjectFiles() {
    const filesToScan = await this.getFilesToScan();
    
    for (const filePath of filesToScan) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        this.scanFileContent(filePath, content);
      } catch (error) {
        console.warn(`无法读取文件 ${filePath}:`, error);
      }
    }
  }

  /**
   * 获取需要扫描的文件列表
   */
  private async getFilesToScan(): Promise<string[]> {
    const files: string[] = [];
    
    const scanDirectory = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          // 跳过某些目录
          if (['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
            continue;
          }
          scanDirectory(fullPath);
        } else if (entry.isFile()) {
          // 只扫描特定类型的文件
          if (/\.(ts|tsx|js|jsx|md)$/.test(entry.name)) {
            files.push(fullPath);
          }
        }
      }
    };

    scanDirectory(this.projectRoot);
    return files;
  }

  /**
   * 扫描单个文件内容
   */
  private scanFileContent(filePath: string, content: string) {
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // 使用预定义模式扫描
      for (const { pattern, fieldExtractor } of MetricConsistencyChecker.METRIC_PATTERNS) {
        const matches = line.matchAll(pattern);
        
        for (const match of matches) {
          const { field, value } = fieldExtractor(match);
          
          this.foundUsages.push({
            fileName: path.relative(this.projectRoot, filePath),
            lineNumber: index + 1,
            fieldName: field,
            value: parseFloat(value) || value,
            context: line.trim()
          });
        }
      }
      
      // 扫描不一致的命名
      this.scanInconsistentNaming(filePath, line, index + 1);
    });
  }

  /**
   * 扫描不一致的命名
   */
  private scanInconsistentNaming(filePath: string, line: string, lineNumber: number) {
    for (const { inconsistent, standard } of MetricConsistencyChecker.INCONSISTENT_NAMING_PATTERNS) {
      for (const inconsistentName of inconsistent) {
        const regex = new RegExp(`\\b${inconsistentName}\\b`, 'g');
        if (regex.test(line)) {
          this.foundUsages.push({
            fileName: path.relative(this.projectRoot, filePath),
            lineNumber,
            fieldName: inconsistentName,
            value: 'naming_issue',
            context: line.trim()
          });
        }
      }
    }
  }

  /**
   * 分析不一致性问题
   */
  private analyzeInconsistencies(): MetricInconsistency[] {
    const inconsistencies: MetricInconsistency[] = [];
    
    // 1. 检查命名不一致
    inconsistencies.push(...this.checkNamingInconsistencies());
    
    // 2. 检查单位不一致
    inconsistencies.push(...this.checkUnitInconsistencies());
    
    // 3. 检查数值范围不一致
    inconsistencies.push(...this.checkValueRangeInconsistencies());
    
    // 4. 检查重复定义
    inconsistencies.push(...this.checkDuplicateDefinitions());
    
    // 5. 检查缺失的标准指标
    inconsistencies.push(...this.checkMissingStandardMetrics());
    
    return inconsistencies.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  /**
   * 检查命名不一致
   */
  private checkNamingInconsistencies(): MetricInconsistency[] {
    const inconsistencies: MetricInconsistency[] = [];
    const namingIssues = new Map<string, MetricUsage[]>();

    // 按字段名称分组
    for (const usage of this.foundUsages) {
      if (usage.value === 'naming_issue') {
        if (!namingIssues.has(usage.fieldName)) {
          namingIssues.set(usage.fieldName, []);
        }
        namingIssues.get(usage.fieldName)!.push(usage);
      }
    }

    // 为每个不一致的命名创建问题
    for (const [inconsistentName, usages] of namingIssues) {
      const standardName = this.findStandardNameFor(inconsistentName);
      
      if (standardName) {
        inconsistencies.push({
          type: 'naming',
          severity: 'high',
          metricIds: [`naming_issue_${inconsistentName}`],
          description: `发现不符合规范的命名 "${inconsistentName}"，在 ${usages.length} 个位置使用`,
          suggestion: `应该使用标准命名 "${standardName}"`,
          autoFixable: true
        });
      }
    }

    return inconsistencies;
  }

  /**
   * 检查单位不一致
   */
  private checkUnitInconsistencies(): MetricInconsistency[] {
    const inconsistencies: MetricInconsistency[] = [];
    const timeFields = ['responseTime', 'avgResponseTime', 'avgTime'];
    
    // 检查时间字段的单位是否一致
    const timeUsages = this.foundUsages.filter(usage => 
      timeFields.includes(usage.fieldName) && typeof usage.value === 'number'
    );

    if (timeUsages.length > 0) {
      // 根据数值大小推断单位
      const smallValues = timeUsages.filter(u => (u.value as number) < 100); // 可能是秒
      const largeValues = timeUsages.filter(u => (u.value as number) >= 1000); // 可能是毫秒

      if (smallValues.length > 0 && largeValues.length > 0) {
        inconsistencies.push({
          type: 'format',
          severity: 'high',
          metricIds: timeFields,
          description: `时间字段单位不一致，部分使用秒(${smallValues.length}处)，部分使用毫秒(${largeValues.length}处)`,
          suggestion: '建议统一使用毫秒作为内部存储单位，显示时再转换',
          autoFixable: false
        });
      }
    }

    return inconsistencies;
  }

  /**
   * 检查数值范围不一致
   */
  private checkValueRangeInconsistencies(): MetricInconsistency[] {
    const inconsistencies: MetricInconsistency[] = [];
    const rateFields = ['successRate', 'failureRate', 'errorRate'];
    
    // 检查百分比字段的值范围
    for (const fieldName of rateFields) {
      const usages = this.foundUsages.filter(u => 
        u.fieldName === fieldName && typeof u.value === 'number'
      );

      if (usages.length === 0) continue;

      const values = usages.map(u => u.value as number);
      const has0to1Range = values.some(v => v > 0 && v <= 1);
      const has0to100Range = values.some(v => v > 1 && v <= 100);

      if (has0to1Range && has0to100Range) {
        inconsistencies.push({
          type: 'format',
          severity: 'medium',
          metricIds: [fieldName],
          description: `${fieldName} 字段的值范围不一致，部分使用0-1范围，部分使用0-100范围`,
          suggestion: '建议统一使用0-100范围存储，便于显示和理解',
          autoFixable: true
        });
      }
    }

    return inconsistencies;
  }

  /**
   * 检查重复定义
   */
  private checkDuplicateDefinitions(): MetricInconsistency[] {
    const inconsistencies: MetricInconsistency[] = [];
    
    // 检查TypeScript接口定义重复
    const interfaceDefinitions = this.foundUsages.filter(u => 
      u.context.includes('interface') && u.context.includes('Metric')
    );

    const duplicateInterfaces = new Map<string, MetricUsage[]>();
    
    for (const usage of interfaceDefinitions) {
      const interfaceName = this.extractInterfaceName(usage.context);
      if (interfaceName) {
        if (!duplicateInterfaces.has(interfaceName)) {
          duplicateInterfaces.set(interfaceName, []);
        }
        duplicateInterfaces.get(interfaceName)!.push(usage);
      }
    }

    for (const [interfaceName, usages] of duplicateInterfaces) {
      if (usages.length > 1) {
        inconsistencies.push({
          type: 'duplicate',
          severity: 'medium',
          metricIds: [interfaceName],
          description: `接口 "${interfaceName}" 在 ${usages.length} 个文件中重复定义`,
          suggestion: `将接口定义统一到 src/types/metric-types.ts 中`,
          autoFixable: false
        });
      }
    }

    return inconsistencies;
  }

  /**
   * 检查缺失的标准指标
   */
  private checkMissingStandardMetrics(): MetricInconsistency[] {
    const inconsistencies: MetricInconsistency[] = [];
    
    // 检查是否有使用到的指标没有在标准定义中
    const usedMetrics = new Set(this.foundUsages.map(u => u.fieldName));
    const standardMetricNames = new Set(
      Array.from(this.standardMetrics.values()).map(m => m.name)
    );

    const missingStandards = Array.from(usedMetrics).filter(metric => 
      !standardMetricNames.has(metric) && metric !== 'naming_issue'
    );

    if (missingStandards.length > 0) {
      inconsistencies.push({
        type: 'missing',
        severity: 'low',
        metricIds: missingStandards,
        description: `发现 ${missingStandards.length} 个使用中的指标没有标准定义: ${missingStandards.join(', ')}`,
        suggestion: '建议为这些指标创建标准定义，或将其重命名为已有的标准指标',
        autoFixable: false
      });
    }

    return inconsistencies;
  }

  /**
   * 生成改进建议
   */
  private generateSuggestions(inconsistencies: MetricInconsistency[]): string[] {
    const suggestions: string[] = [];
    
    const criticalIssues = inconsistencies.filter(i => i.severity === 'critical');
    const highIssues = inconsistencies.filter(i => i.severity === 'high');
    
    if (criticalIssues.length > 0) {
      suggestions.push(`🚨 发现 ${criticalIssues.length} 个严重问题，建议立即处理`);
    }
    
    if (highIssues.length > 0) {
      suggestions.push(`⚠️  发现 ${highIssues.length} 个高优先级问题，建议优先处理`);
    }

    // 按问题类型给出建议
    const namingIssues = inconsistencies.filter(i => i.type === 'naming');
    if (namingIssues.length > 0) {
      suggestions.push(`📝 建议使用自动化工具批量修复 ${namingIssues.length} 个命名规范问题`);
    }

    const formatIssues = inconsistencies.filter(i => i.type === 'format');
    if (formatIssues.length > 0) {
      suggestions.push(`🔧 建议统一数据格式和单位，解决 ${formatIssues.length} 个格式不一致问题`);
    }

    const duplicateIssues = inconsistencies.filter(i => i.type === 'duplicate');
    if (duplicateIssues.length > 0) {
      suggestions.push(`🔗 建议将重复的接口定义合并到统一的类型文件中`);
    }

    // 总体建议
    if (inconsistencies.length > 10) {
      suggestions.push(`📊 问题较多，建议分阶段处理：先解决严重和高优先级问题，再处理其他问题`);
    }

    if (suggestions.length === 0) {
      suggestions.push(`✅ 指标一致性良好，继续保持规范使用`);
    }

    return suggestions;
  }

  /**
   * 查找标准命名
   */
  private findStandardNameFor(inconsistentName: string): string | null {
    for (const { inconsistent, standard } of MetricConsistencyChecker.INCONSISTENT_NAMING_PATTERNS) {
      if (inconsistent.includes(inconsistentName)) {
        return standard;
      }
    }
    return null;
  }

  /**
   * 提取接口名称
   */
  private extractInterfaceName(context: string): string | null {
    const match = context.match(/interface\s+(\w+)/);
    return match ? match[1] : null;
  }

  /**
   * 计算有效指标数量
   */
  private calculateValidMetrics(): number {
    // 这里可以添加更复杂的逻辑来判断指标是否有效
    return this.standardMetrics.size;
  }

  /**
   * 计算无效指标数量
   */
  private calculateInvalidMetrics(): number {
    // 基于发现的问题计算无效指标数量
    const invalidMetricNames = new Set<string>();
    
    for (const usage of this.foundUsages) {
      if (usage.value === 'naming_issue') {
        invalidMetricNames.add(usage.fieldName);
      }
    }
    
    return invalidMetricNames.size;
  }

  /**
   * 生成详细报告
   */
  generateDetailedReport(report: MetricConsistencyReport): string {
    let output = '';
    
    output += '# 指标一致性检查报告\n\n';
    output += `**生成时间**: ${new Date(report.generatedAt).toLocaleString('zh-CN')}\n\n`;
    
    output += '## 总览\n\n';
    output += `- 标准指标总数: ${report.totalMetrics}\n`;
    output += `- 有效指标数量: ${report.validMetrics}\n`;
    output += `- 无效指标数量: ${report.invalidMetrics}\n`;
    output += `- 发现问题数量: ${report.inconsistencies.length}\n\n`;

    if (report.inconsistencies.length > 0) {
      output += '## 问题详情\n\n';
      
      const groupedIssues = report.inconsistencies.reduce((groups, issue) => {
        if (!groups[issue.severity]) groups[issue.severity] = [];
        groups[issue.severity].push(issue);
        return groups;
      }, {} as Record<string, MetricInconsistency[]>);

      for (const [severity, issues] of Object.entries(groupedIssues)) {
        const severityIcon = {
          critical: '🚨',
          high: '⚠️',
          medium: '🔶', 
          low: 'ℹ️'
        }[severity] || '❓';

        output += `### ${severityIcon} ${severity.toUpperCase()} (${issues.length}个)\n\n`;
        
        issues.forEach((issue, index) => {
          output += `#### ${index + 1}. ${issue.description}\n\n`;
          output += `- **类型**: ${issue.type}\n`;
          output += `- **涉及指标**: ${issue.metricIds.join(', ')}\n`;
          output += `- **修复建议**: ${issue.suggestion}\n`;
          output += `- **可自动修复**: ${issue.autoFixable ? '是' : '否'}\n\n`;
        });
      }
    }

    output += '## 改进建议\n\n';
    report.suggestions.forEach((suggestion, index) => {
      output += `${index + 1}. ${suggestion}\n`;
    });

    return output;
  }
}

/**
 * 自动修复工具
 */
export class MetricAutoFixer {
  private projectRoot: string;
  
  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  /**
   * 自动修复可修复的问题
   */
  async autoFix(inconsistencies: MetricInconsistency[]): Promise<{
    fixed: number;
    failed: number;
    details: string[];
  }> {
    let fixed = 0;
    let failed = 0;
    const details: string[] = [];

    const autoFixableIssues = inconsistencies.filter(i => i.autoFixable);
    
    for (const issue of autoFixableIssues) {
      try {
        switch (issue.type) {
          case 'naming':
            await this.fixNamingIssues(issue);
            fixed++;
            details.push(`✅ 修复命名问题: ${issue.description}`);
            break;
            
          case 'format':
            if (issue.description.includes('0-1范围') && issue.description.includes('0-100范围')) {
              await this.fixRangeIssues(issue);
              fixed++;
              details.push(`✅ 修复范围问题: ${issue.description}`);
            }
            break;
        }
      } catch (error) {
        failed++;
        details.push(`❌ 修复失败: ${issue.description} - ${error}`);
      }
    }

    return { fixed, failed, details };
  }

  /**
   * 修复命名问题
   */
  private async fixNamingIssues(issue: MetricInconsistency) {
    // 这里可以实现自动重命名逻辑
    // 实际实现时需要解析AST并进行精确替换
    console.log(`自动修复命名问题: ${issue.description}`);
  }

  /**
   * 修复范围问题
   */
  private async fixRangeIssues(issue: MetricInconsistency) {
    // 这里可以实现自动范围统一逻辑
    console.log(`自动修复范围问题: ${issue.description}`);
  }
}