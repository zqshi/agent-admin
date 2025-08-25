#!/usr/bin/env npx tsx

/**
 * 指标一致性检查命令行工具
 * 使用方法: npm run check-metrics [options]
 */

import * as fs from 'fs';
import * as path from 'path';
import { MetricConsistencyChecker, MetricAutoFixer } from '../utils/metric-consistency-checker';
import { MetricValidator } from '../utils/metric-validator';
import { metricRegistry } from '../utils/metric-registry';

interface CliOptions {
  check: boolean;
  fix: boolean;
  report: boolean;
  output?: string;
  format: 'json' | 'markdown' | 'console';
  verbose: boolean;
  help: boolean;
}

class MetricConsistencyCliTool {
  private options: CliOptions;
  private projectRoot: string;

  constructor() {
    this.projectRoot = process.cwd();
    this.options = this.parseArguments();
  }

  /**
   * 解析命令行参数
   */
  private parseArguments(): CliOptions {
    const args = process.argv.slice(2);
    const options: CliOptions = {
      check: true,
      fix: false,
      report: false,
      format: 'console',
      verbose: false,
      help: false
    };

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      switch (arg) {
        case '--help':
        case '-h':
          options.help = true;
          break;
          
        case '--check':
        case '-c':
          options.check = true;
          break;
          
        case '--fix':
        case '-f':
          options.fix = true;
          break;
          
        case '--report':
        case '-r':
          options.report = true;
          break;
          
        case '--output':
        case '-o':
          options.output = args[++i];
          break;
          
        case '--format':
          const format = args[++i] as 'json' | 'markdown' | 'console';
          if (['json', 'markdown', 'console'].includes(format)) {
            options.format = format;
          }
          break;
          
        case '--verbose':
        case '-v':
          options.verbose = true;
          break;
          
        default:
          if (arg.startsWith('--')) {
            console.warn(`未知选项: ${arg}`);
          }
      }
    }

    return options;
  }

  /**
   * 显示帮助信息
   */
  private showHelp() {
    console.log(`
📊 指标一致性检查工具

用法: npm run check-metrics [选项]

选项:
  -c, --check         执行一致性检查 (默认)
  -f, --fix           自动修复可修复的问题
  -r, --report        生成详细报告
  -o, --output FILE   输出文件路径
  --format FORMAT     输出格式 (json|markdown|console, 默认: console)
  -v, --verbose       显示详细信息
  -h, --help          显示此帮助信息

示例:
  npm run check-metrics                    # 执行基本检查
  npm run check-metrics --fix              # 检查并自动修复
  npm run check-metrics --report -o report.md --format markdown  # 生成Markdown报告
  npm run check-metrics --verbose          # 显示详细信息

  
🔧 自动修复功能:
  • 命名规范不一致问题
  • 数值范围统一问题
  • 简单的格式不一致问题

⚠️  注意: 自动修复会修改源代码文件，建议先备份或使用版本控制
    `);
  }

  /**
   * 运行主程序
   */
  async run() {
    if (this.options.help) {
      this.showHelp();
      return;
    }

    console.log('🚀 启动指标一致性检查工具...\n');

    try {
      // 初始化检查器
      const checker = new MetricConsistencyChecker(this.projectRoot);
      
      // 加载标准指标定义
      const standardMetrics = metricRegistry.getAllMetrics();
      checker.loadStandardMetrics(standardMetrics);
      
      if (this.options.verbose) {
        console.log(`📚 已加载 ${standardMetrics.length} 个标准指标定义`);
        console.log(`📁 扫描目录: ${this.projectRoot}\n`);
      }

      // 执行检查
      if (this.options.check) {
        await this.performConsistencyCheck(checker);
      }

    } catch (error) {
      console.error('❌ 执行过程中发生错误:', error);
      process.exit(1);
    }
  }

  /**
   * 执行一致性检查
   */
  private async performConsistencyCheck(checker: MetricConsistencyChecker) {
    console.log('🔍 正在进行一致性检查...\n');

    const report = await checker.checkConsistency();
    
    // 显示检查结果
    this.displayResults(report);

    // 自动修复
    if (this.options.fix && report.inconsistencies.length > 0) {
      await this.performAutoFix(report);
    }

    // 生成报告
    if (this.options.report) {
      await this.generateReport(checker, report);
    }

    // 输出到文件
    if (this.options.output) {
      await this.saveOutput(checker, report);
    }
  }

  /**
   * 显示检查结果
   */
  private displayResults(report: any) {
    console.log('📊 检查结果:\n');
    
    const { totalMetrics, validMetrics, invalidMetrics, inconsistencies } = report;
    
    console.log(`✅ 标准指标总数: ${totalMetrics}`);
    console.log(`✅ 有效指标数量: ${validMetrics}`);
    console.log(`❌ 无效指标数量: ${invalidMetrics}`);
    console.log(`⚠️  发现问题数量: ${inconsistencies.length}\n`);

    if (inconsistencies.length === 0) {
      console.log('🎉 恭喜！没有发现一致性问题，指标使用规范良好。\n');
      return;
    }

    // 按严重程度分组显示问题
    const groupedIssues = inconsistencies.reduce((groups: any, issue: any) => {
      if (!groups[issue.severity]) groups[issue.severity] = [];
      groups[issue.severity].push(issue);
      return groups;
    }, {});

    const severityOrder = ['critical', 'high', 'medium', 'low'];
    const severityIcons = {
      critical: '🚨',
      high: '⚠️',
      medium: '🔶',
      low: 'ℹ️'
    };
    
    for (const severity of severityOrder) {
      if (groupedIssues[severity]) {
        const issues = groupedIssues[severity];
        console.log(`${severityIcons[severity as keyof typeof severityIcons]} ${severity.toUpperCase()} 问题 (${issues.length}个):`);
        
        if (this.options.verbose) {
          issues.forEach((issue: any, index: number) => {
            console.log(`   ${index + 1}. ${issue.description}`);
            console.log(`      建议: ${issue.suggestion}`);
            if (issue.autoFixable) {
              console.log(`      🔧 可自动修复`);
            }
            console.log('');
          });
        } else {
          // 简化显示
          issues.slice(0, 3).forEach((issue: any, index: number) => {
            console.log(`   ${index + 1}. ${issue.description}`);
          });
          if (issues.length > 3) {
            console.log(`   ... 还有 ${issues.length - 3} 个问题 (使用 --verbose 查看全部)`);
          }
        }
        console.log('');
      }
    }

    // 显示改进建议
    if (report.suggestions.length > 0) {
      console.log('💡 改进建议:');
      report.suggestions.forEach((suggestion: string, index: number) => {
        console.log(`   ${index + 1}. ${suggestion}`);
      });
      console.log('');
    }
  }

  /**
   * 执行自动修复
   */
  private async performAutoFix(report: any) {
    console.log('🔧 正在进行自动修复...\n');
    
    const autoFixer = new MetricAutoFixer(this.projectRoot);
    const autoFixableIssues = report.inconsistencies.filter((issue: any) => issue.autoFixable);
    
    if (autoFixableIssues.length === 0) {
      console.log('ℹ️  没有可自动修复的问题。\n');
      return;
    }

    console.log(`🛠️  发现 ${autoFixableIssues.length} 个可自动修复的问题`);
    
    // 询问用户确认
    const confirm = await this.askConfirmation(`是否继续自动修复？这将修改源代码文件。(y/N)`);
    
    if (!confirm) {
      console.log('❌ 用户取消了自动修复。\n');
      return;
    }

    try {
      const result = await autoFixer.autoFix(autoFixableIssues);
      
      console.log(`✅ 成功修复 ${result.fixed} 个问题`);
      if (result.failed > 0) {
        console.log(`❌ 修复失败 ${result.failed} 个问题`);
      }
      
      if (this.options.verbose && result.details.length > 0) {
        console.log('\n修复详情:');
        result.details.forEach(detail => console.log(`   ${detail}`));
      }
      
      console.log('\n🔄 建议重新运行检查以验证修复效果。\n');
      
    } catch (error) {
      console.error('❌ 自动修复过程中发生错误:', error);
    }
  }

  /**
   * 生成详细报告
   */
  private async generateReport(checker: MetricConsistencyChecker, report: any) {
    console.log('📝 正在生成详细报告...\n');
    
    const detailedReport = checker.generateDetailedReport(report);
    
    if (this.options.format === 'console') {
      console.log(detailedReport);
    } else if (this.options.output) {
      // 报告将在 saveOutput 中保存
    } else {
      // 默认保存为文件
      const fileName = `metric-consistency-report-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.md`;
      const filePath = path.join(this.projectRoot, fileName);
      fs.writeFileSync(filePath, detailedReport, 'utf-8');
      console.log(`📄 详细报告已保存至: ${filePath}\n`);
    }
  }

  /**
   * 保存输出到文件
   */
  private async saveOutput(checker: MetricConsistencyChecker, report: any) {
    const outputPath = path.resolve(this.options.output!);
    
    let content: string;
    
    switch (this.options.format) {
      case 'json':
        content = JSON.stringify(report, null, 2);
        break;
        
      case 'markdown':
        content = checker.generateDetailedReport(report);
        break;
        
      default:
        // console format - 转为纯文本
        content = this.formatForConsole(report);
    }
    
    try {
      // 确保目录存在
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(outputPath, content, 'utf-8');
      console.log(`💾 结果已保存至: ${outputPath}\n`);
    } catch (error) {
      console.error(`❌ 保存文件失败: ${error}`);
    }
  }

  /**
   * 格式化为控制台输出
   */
  private formatForConsole(report: any): string {
    let output = '指标一致性检查报告\n';
    output += '='.repeat(50) + '\n\n';
    
    output += `生成时间: ${new Date(report.generatedAt).toLocaleString('zh-CN')}\n`;
    output += `标准指标总数: ${report.totalMetrics}\n`;
    output += `有效指标数量: ${report.validMetrics}\n`;
    output += `无效指标数量: ${report.invalidMetrics}\n`;
    output += `发现问题数量: ${report.inconsistencies.length}\n\n`;

    if (report.inconsistencies.length > 0) {
      output += '问题列表:\n';
      output += '-'.repeat(30) + '\n';
      
      report.inconsistencies.forEach((issue: any, index: number) => {
        output += `${index + 1}. [${issue.severity.toUpperCase()}] ${issue.description}\n`;
        output += `   建议: ${issue.suggestion}\n`;
        output += `   可自动修复: ${issue.autoFixable ? '是' : '否'}\n\n`;
      });
    }

    if (report.suggestions.length > 0) {
      output += '改进建议:\n';
      output += '-'.repeat(30) + '\n';
      report.suggestions.forEach((suggestion: string, index: number) => {
        output += `${index + 1}. ${suggestion}\n`;
      });
    }

    return output;
  }

  /**
   * 询问用户确认
   */
  private askConfirmation(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl.question(`${message} `, (answer: string) => {
        rl.close();
        resolve(answer.toLowerCase().startsWith('y'));
      });
    });
  }
}

// 添加到 package.json scripts 的命令
function generatePackageJsonScript() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      
      if (!packageJson.scripts) {
        packageJson.scripts = {};
      }
      
      // 添加检查命令
      packageJson.scripts['check-metrics'] = 'npx tsx src/scripts/metric-consistency-cli.ts';
      packageJson.scripts['check-metrics:fix'] = 'npx tsx src/scripts/metric-consistency-cli.ts --fix';
      packageJson.scripts['check-metrics:report'] = 'npx tsx src/scripts/metric-consistency-cli.ts --report --format markdown -o docs/metric-consistency-report.md';
      
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8');
      console.log('✅ 已添加npm scripts到package.json:\n');
      console.log('   npm run check-metrics              # 基本检查');
      console.log('   npm run check-metrics:fix          # 检查并修复');
      console.log('   npm run check-metrics:report       # 生成报告');
    } catch (error) {
      console.warn('⚠️  无法更新package.json:', error);
    }
  }
}

// 主函数
async function main() {
  const cli = new MetricConsistencyCliTool();
  
  // 如果是直接运行脚本（不是作为模块导入）
  if (require.main === module) {
    await cli.run();
  }
}

// 检查是否有合适的运行环境
function checkEnvironment() {
  // 检查Node.js版本
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion < 14) {
    console.error('❌ 需要Node.js 14或更高版本');
    process.exit(1);
  }

  // 检查必要的依赖
  const requiredDeps = ['typescript', '@types/node'];
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      const missingDeps = requiredDeps.filter(dep => !allDeps[dep]);
      
      if (missingDeps.length > 0) {
        console.warn(`⚠️  建议安装以下依赖: ${missingDeps.join(', ')}`);
      }
    } catch (error) {
      console.warn('⚠️  无法读取package.json');
    }
  }
}

// 脚本启动
if (require.main === module) {
  checkEnvironment();
  main().catch(error => {
    console.error('💥 程序异常退出:', error);
    process.exit(1);
  });
}

export { MetricConsistencyCliTool };