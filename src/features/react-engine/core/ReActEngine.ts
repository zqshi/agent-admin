/**
 * ReAct 推理引擎核心
 * 实现 Reasoning + Acting 的智能推理流程
 */

import { NLUProcessor } from './NLUProcessor';
import { ConfigGenerator } from './ConfigGenerator';
import type {
  ReActStep,
  IntentAnalysis,
  ConfigRequirements,
  GeneratedConfig,
  CreationSession,
  ReActEngineConfig,
  CreationMode
} from '../types';
import type { CreateDigitalEmployeeForm } from '../../../types';

export class ReActEngine {
  private nluProcessor: NLUProcessor;
  private configGenerator: ConfigGenerator;
  private config: ReActEngineConfig;
  private activeSessions: Map<string, CreationSession> = new Map();

  constructor(config?: Partial<ReActEngineConfig>) {
    this.nluProcessor = new NLUProcessor();
    this.configGenerator = new ConfigGenerator();
    this.config = {
      enableReasoning: true,
      maxReasoningSteps: 10,
      confidenceThreshold: 0.7,
      enableSuggestions: true,
      enableAlternatives: true,
      enableValidation: true,
      debugMode: false,
      timeout: 30000,
      ...config
    };
  }

  /**
   * 创建新的创建会话
   */
  createSession(mode: CreationMode, userInput?: string): CreationSession {
    const sessionId = this.generateSessionId();
    const session: CreationSession = {
      id: sessionId,
      mode,
      status: 'initializing',
      userInput: userInput || '',
      steps: [],
      currentConfig: {},
      startTime: Date.now(),
      lastUpdateTime: Date.now(),
      metadata: {}
    };

    this.activeSessions.set(sessionId, session);
    this.log(`Created new session: ${sessionId}, mode: ${mode}`);

    return session;
  }

  /**
   * 处理用户输入并执行 ReAct 推理
   */
  async processInput(sessionId: string, input: string): Promise<CreationSession> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    try {
      session.userInput = input;
      session.status = 'reasoning';
      session.lastUpdateTime = Date.now();

      this.log(`Processing input for session ${sessionId}: "${input}"`);

      // 执行 ReAct 推理流程
      await this.executeReActFlow(session);

      session.status = 'completed';
      this.activeSessions.set(sessionId, session);

      return session;
    } catch (error) {
      session.status = 'error';
      this.log(`Error processing session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * 执行 ReAct 推理流程
   */
  private async executeReActFlow(session: CreationSession): Promise<void> {
    const { userInput, mode } = session;

    // Step 1: Reasoning - 意图分析
    const intentStep = this.createReasoningStep(
      'intent_analysis',
      '分析用户意图',
      '理解用户想要创建什么样的数字员工',
      userInput
    );
    session.steps.push(intentStep);
    await this.updateStep(intentStep, 'processing');

    const intentAnalysis = await this.nluProcessor.analyzeIntent(userInput);
    session.analysis = intentAnalysis;
    await this.updateStep(intentStep, 'completed', intentAnalysis);

    this.log(`Intent analysis completed:`, intentAnalysis);

    // 检查意图清晰度
    if (intentAnalysis.primaryIntent === 'unclear' || intentAnalysis.confidence < this.config.confidenceThreshold) {
      await this.handleUnclearIntent(session, intentAnalysis);
      return;
    }

    // Step 2: Reasoning - 需求推导
    const requirementStep = this.createReasoningStep(
      'requirement_derivation',
      '分析配置需求',
      '基于用户意图推导具体的配置需求',
      intentAnalysis
    );
    session.steps.push(requirementStep);
    await this.updateStep(requirementStep, 'processing');

    const requirements = await this.configGenerator.deriveRequirements(intentAnalysis);
    session.requirements = requirements;
    await this.updateStep(requirementStep, 'completed', requirements);

    this.log(`Requirements derived:`, requirements);

    // Step 3: Acting - 配置生成
    const configStep = this.createActingStep(
      'config_generation',
      '生成基础配置',
      '基于需求分析生成数字员工配置',
      requirements
    );
    session.steps.push(configStep);
    await this.updateStep(configStep, 'processing');

    const generatedConfig = await this.configGenerator.generateConfig(requirements);
    session.generatedConfig = generatedConfig;
    session.currentConfig = generatedConfig.form;
    await this.updateStep(configStep, 'completed', generatedConfig);

    this.log(`Configuration generated:`, generatedConfig);

    // Step 4: Acting - 配置优化
    if (mode !== 'quick') {
      const optimizationStep = this.createActingStep(
        'optimization',
        '优化配置参数',
        '应用智能优化策略提升配置质量',
        generatedConfig
      );
      session.steps.push(optimizationStep);
      await this.updateStep(optimizationStep, 'processing');

      const optimizedConfig = await this.optimizeConfiguration(generatedConfig, requirements);
      session.currentConfig = { ...session.currentConfig, ...optimizedConfig };
      await this.updateStep(optimizationStep, 'completed', optimizedConfig);

      this.log(`Configuration optimized:`, optimizedConfig);
    }

    // Step 5: Reasoning - 配置验证
    if (this.config.enableValidation) {
      const validationStep = this.createReasoningStep(
        'validation',
        '验证配置完整性',
        '检查配置的有效性和完整性',
        session.currentConfig
      );
      session.steps.push(validationStep);
      await this.updateStep(validationStep, 'processing');

      const validation = session.generatedConfig?.validation ||
        this.configGenerator['validateConfig'](session.currentConfig);
      await this.updateStep(validationStep, 'completed', validation);

      this.log(`Configuration validated:`, validation);

      // 如果验证失败，尝试修复
      if (!validation.isValid) {
        await this.handleValidationFailure(session, validation);
      }
    }
  }

  /**
   * 处理不清晰的意图
   */
  private async handleUnclearIntent(session: CreationSession, analysis: IntentAnalysis): Promise<void> {
    const clarificationStep = this.createReasoningStep(
      'intent_analysis',
      '澄清用户意图',
      '用户意图不够明确，需要进一步澄清',
      analysis
    );
    session.steps.push(clarificationStep);

    // 生成澄清问题
    const clarificationQuestions = this.generateClarificationQuestions(analysis);

    await this.updateStep(clarificationStep, 'completed', {
      needsClarification: true,
      questions: clarificationQuestions,
      suggestions: analysis.suggestions
    });

    session.status = 'input'; // 需要用户进一步输入
  }

  /**
   * 处理验证失败
   */
  private async handleValidationFailure(session: CreationSession, validation: any): Promise<void> {
    const fixStep = this.createActingStep(
      'config_generation',
      '修复配置问题',
      '自动修复发现的配置问题',
      validation
    );
    session.steps.push(fixStep);
    await this.updateStep(fixStep, 'processing');

    // 尝试自动修复
    const fixes = await this.autoFixConfiguration(session.currentConfig, validation);
    if (fixes) {
      session.currentConfig = { ...session.currentConfig, ...fixes };
      await this.updateStep(fixStep, 'completed', fixes);
    } else {
      await this.updateStep(fixStep, 'error', '无法自动修复，需要手动调整');
    }
  }

  /**
   * 优化配置
   */
  private async optimizeConfiguration(
    config: GeneratedConfig,
    requirements: ConfigRequirements
  ): Promise<Partial<CreateDigitalEmployeeForm>> {
    const optimizations: Partial<CreateDigitalEmployeeForm> = {};

    // 优化系统提示词
    if (config.form.systemPrompt && config.form.systemPrompt.length < 100) {
      optimizations.systemPrompt = this.enhanceSystemPrompt(
        config.form.systemPrompt,
        requirements
      );
    }

    // 优化工具配置
    if (requirements.capabilities.allowedTools.length < 3) {
      optimizations.allowedTools = this.recommendAdditionalTools(
        config.form.allowedTools || [],
        requirements
      );
    }

    // 优化 Prompt 工程配置
    if (requirements.advanced.compressionNeeded) {
      optimizations.promptConfig = {
        ...config.form.promptConfig,
        mode: 'advanced' as const,
        compressionConfig: {
          enabled: true,
          strategy: 'adaptive',
          triggerThreshold: 4000,
          preserveQuality: true,
          maxCompressionRatio: 0.5
        }
      };
    }

    return optimizations;
  }

  /**
   * 创建推理步骤
   */
  private createReasoningStep(
    phase: ReActStep['phase'],
    title: string,
    content: string,
    input?: any
  ): ReActStep {
    return {
      id: this.generateStepId(),
      type: 'reasoning',
      phase,
      title,
      content,
      input,
      timestamp: Date.now(),
      confidence: 0.8,
      status: 'pending'
    };
  }

  /**
   * 创建行动步骤
   */
  private createActingStep(
    phase: ReActStep['phase'],
    title: string,
    content: string,
    input?: any
  ): ReActStep {
    return {
      id: this.generateStepId(),
      type: 'acting',
      phase,
      title,
      content,
      input,
      timestamp: Date.now(),
      confidence: 0.9,
      status: 'pending'
    };
  }

  /**
   * 更新步骤状态
   */
  private async updateStep(
    step: ReActStep,
    status: ReActStep['status'],
    output?: any,
    error?: string
  ): Promise<void> {
    step.status = status;
    if (output !== undefined) step.output = output;
    if (error) step.error = error;
    if (status === 'completed' && step.timestamp) {
      step.duration = Date.now() - step.timestamp;
    }

    // 模拟异步处理时间
    await this.simulateProcessingDelay(step.type);
  }

  /**
   * 生成澄清问题
   */
  private generateClarificationQuestions(analysis: IntentAnalysis): string[] {
    const questions: string[] = [];

    if (!analysis.entities.department) {
      questions.push('请问这个数字员工属于哪个部门？');
    }

    if (!analysis.entities.name) {
      questions.push('您希望给这个数字员工起什么名字？');
    }

    if (!analysis.entities.responsibilities || analysis.entities.responsibilities.length === 0) {
      questions.push('请描述一下这个数字员工的主要工作职责。');
    }

    if (analysis.missingInfo.length > 0) {
      questions.push(`还需要补充：${analysis.missingInfo.join('、')}`);
    }

    return questions;
  }

  /**
   * 自动修复配置
   */
  private async autoFixConfiguration(
    config: Partial<CreateDigitalEmployeeForm>,
    validation: any
  ): Promise<Partial<CreateDigitalEmployeeForm> | null> {
    const fixes: Partial<CreateDigitalEmployeeForm> = {};

    // 修复必填字段
    for (const error of validation.errors || []) {
      switch (error.field) {
        case 'name':
          if (!config.name) {
            fixes.name = `AI-${config.department || '助手'}`;
          }
          break;
        case 'employeeNumber':
          if (!config.employeeNumber) {
            fixes.employeeNumber = `DE${Date.now().toString().slice(-4)}`;
          }
          break;
        case 'systemPrompt':
          if (!config.systemPrompt) {
            fixes.systemPrompt = '您是一位专业的AI助手，能够高效完成各种任务。';
          }
          break;
      }
    }

    return Object.keys(fixes).length > 0 ? fixes : null;
  }

  /**
   * 增强系统提示词
   */
  private enhanceSystemPrompt(
    originalPrompt: string,
    requirements: ConfigRequirements
  ): string {
    let enhanced = originalPrompt;

    // 添加角色定义
    if (!enhanced.includes('您是')) {
      enhanced = `您是${requirements.basic.department}的专业助手。${enhanced}`;
    }

    // 添加职责描述
    if (requirements.persona.responsibilities.length > 0) {
      enhanced += `\n\n您的主要职责包括：${requirements.persona.responsibilities.map(r => `\n• ${r}`).join('')}`;
    }

    // 添加性格特点
    if (requirements.persona.personality) {
      enhanced += `\n\n请保持${requirements.persona.personality}的工作风格。`;
    }

    return enhanced;
  }

  /**
   * 推荐额外工具
   */
  private recommendAdditionalTools(
    currentTools: string[],
    requirements: ConfigRequirements
  ): string[] {
    const recommendedTools = [...currentTools];

    // 基于部门推荐
    const departmentTools: Record<string, string[]> = {
      '客户服务部': ['customer_info', 'faq_search', 'order_query'],
      '技术支持部': ['tech_diagnosis', 'solution_search', 'file_management'],
      '销售部': ['product_catalog', 'pricing_calc', 'crm_access'],
      '数据分析': ['data_analysis', 'report_generator']
    };

    const suggested = departmentTools[requirements.basic.department] || [];
    suggested.forEach(tool => {
      if (!recommendedTools.includes(tool)) {
        recommendedTools.push(tool);
      }
    });

    return recommendedTools;
  }

  /**
   * 获取会话状态
   */
  getSession(sessionId: string): CreationSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  /**
   * 更新会话配置
   */
  updateSessionConfig(
    sessionId: string,
    configUpdates: Partial<CreateDigitalEmployeeForm>
  ): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.currentConfig = { ...session.currentConfig, ...configUpdates };
      session.lastUpdateTime = Date.now();
      this.activeSessions.set(sessionId, session);
    }
  }

  /**
   * 清理会话
   */
  cleanupSession(sessionId: string): void {
    this.activeSessions.delete(sessionId);
    this.log(`Session ${sessionId} cleaned up`);
  }

  /**
   * 获取所有活跃会话
   */
  getActiveSessions(): CreationSession[] {
    return Array.from(this.activeSessions.values());
  }

  // 工具方法
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateStepId(): string {
    return `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async simulateProcessingDelay(type: 'reasoning' | 'acting'): Promise<void> {
    // 在真实环境中，这里会是实际的处理时间
    const delay = type === 'reasoning' ? 500 : 300;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  private log(message: string, data?: any): void {
    if (this.config.debugMode) {
      console.log(`[ReActEngine] ${message}`, data || '');
    }
  }

  /**
   * 获取引擎统计信息
   */
  getStats() {
    const sessions = Array.from(this.activeSessions.values());
    return {
      totalSessions: sessions.length,
      completedSessions: sessions.filter(s => s.status === 'completed').length,
      errorSessions: sessions.filter(s => s.status === 'error').length,
      averageSteps: sessions.reduce((acc, s) => acc + s.steps.length, 0) / sessions.length || 0,
      averageProcessingTime: sessions
        .filter(s => s.status === 'completed')
        .reduce((acc, s) => acc + (s.lastUpdateTime - s.startTime), 0) /
        sessions.filter(s => s.status === 'completed').length || 0
    };
  }
}