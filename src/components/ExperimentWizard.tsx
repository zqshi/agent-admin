import { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  ArrowRight, ArrowLeft, CheckCircle, AlertTriangle, Lightbulb, 
  Target, Users, Clock, DollarSign, BarChart3, Brain, Zap
} from 'lucide-react';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface BusinessGoal {
  objective: 'performance' | 'cost' | 'satisfaction' | 'retention';
  urgency: 'low' | 'medium' | 'high';
  riskTolerance: 'low' | 'medium' | 'high';
  targetMetric: string;
  currentBaseline: number;
  expectedImprovement: number;
  budget: number;
}

interface ExperimentRecommendation {
  approach: 'simple_ab' | 'sequential' | 'multivariate';
  complexity: 'low' | 'medium' | 'high';
  duration: number;
  sampleSize: number;
  successProbability: number;
  estimatedCost: number;
  risks: string[];
  benefits: string[];
  nextSteps: string[];
}

const ExperimentWizard = ({ onClose, onCreateExperiment }: { 
  onClose: () => void; 
  onCreateExperiment: (config: any) => void;
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [businessGoal, setBusinessGoal] = useState<Partial<BusinessGoal>>({});
  const [experimentConfig, setExperimentConfig] = useState<any>({});
  const [recommendation, setRecommendation] = useState<ExperimentRecommendation | null>(null);

  const steps: WizardStep[] = [
    {
      id: 'goal',
      title: '业务目标定义',
      description: '明确你想通过实验达成的业务目标',
      completed: currentStep > 0
    },
    {
      id: 'variables',
      title: '变量选择',
      description: '选择要测试的变量和变化维度',
      completed: currentStep > 1
    },
    {
      id: 'strategy',
      title: '实验策略',
      description: '基于AI分析推荐最优实验策略',
      completed: currentStep > 2
    },
    {
      id: 'config',
      title: '参数配置',
      description: '配置实验的具体参数和约束条件',
      completed: currentStep > 3
    }
  ];

  // 业务目标配置组件
  const BusinessGoalStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900">定义你的业务目标</h3>
        <p className="text-gray-600 mt-2">明确的目标是成功实验的基础</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 主要目标 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">主要优化目标</label>
          <div className="space-y-2">
            {[
              { id: 'performance', label: '性能提升', icon: Zap, desc: '响应速度、成功率等' },
              { id: 'cost', label: '成本优化', icon: DollarSign, desc: 'Token成本、资源消耗' },
              { id: 'satisfaction', label: '用户满意度', icon: Users, desc: '用户体验、满意度评分' },
              { id: 'retention', label: '用户留存', icon: Target, desc: '用户粘性、回访率' }
            ].map((goal) => (
              <label key={goal.id} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="objective"
                  value={goal.id}
                  checked={businessGoal.objective === goal.id}
                  onChange={(e) => setBusinessGoal({ ...businessGoal, objective: e.target.value as any })}
                  className="mr-3"
                />
                <goal.icon className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <div className="font-medium text-gray-900">{goal.label}</div>
                  <div className="text-sm text-gray-500">{goal.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 紧急程度和风险承受度 */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">紧急程度</label>
            <div className="space-y-2">
              {[
                { id: 'low', label: '不紧急', desc: '可以慢慢优化' },
                { id: 'medium', label: '中等紧急', desc: '希望尽快看到结果' },
                { id: 'high', label: '非常紧急', desc: '需要立即决策' }
              ].map((urgency) => (
                <label key={urgency.id} className="flex items-center p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="urgency"
                    value={urgency.id}
                    checked={businessGoal.urgency === urgency.id}
                    onChange={(e) => setBusinessGoal({ ...businessGoal, urgency: e.target.value as any })}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{urgency.label}</div>
                    <div className="text-sm text-gray-500">{urgency.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">风险承受度</label>
            <div className="space-y-2">
              {[
                { id: 'low', label: '保守', desc: '优先稳定性' },
                { id: 'medium', label: '平衡', desc: '稳定与创新并重' },
                { id: 'high', label: '激进', desc: '可以接受风险' }
              ].map((risk) => (
                <label key={risk.id} className="flex items-center p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="riskTolerance"
                    value={risk.id}
                    checked={businessGoal.riskTolerance === risk.id}
                    onChange={(e) => setBusinessGoal({ ...businessGoal, riskTolerance: e.target.value as any })}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{risk.label}</div>
                    <div className="text-sm text-gray-500">{risk.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 具体指标 */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-4">具体指标设置</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">目标指标</label>
            <select 
              value={businessGoal.targetMetric || ''}
              onChange={(e) => setBusinessGoal({ ...businessGoal, targetMetric: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">选择指标</option>
              <option value="task_success_rate">任务完成率</option>
              <option value="response_time">响应时间</option>
              <option value="token_cost">Token成本</option>
              <option value="user_satisfaction">用户满意度</option>
              <option value="retention_rate">留存率</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">当前基线值</label>
            <input
              type="number"
              value={businessGoal.currentBaseline || ''}
              onChange={(e) => setBusinessGoal({ ...businessGoal, currentBaseline: parseFloat(e.target.value) })}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="如: 75%"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">期望提升</label>
            <input
              type="number"
              value={businessGoal.expectedImprovement || ''}
              onChange={(e) => setBusinessGoal({ ...businessGoal, expectedImprovement: parseFloat(e.target.value) })}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="如: 10%"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">实验预算 (USD)</label>
          <input
            type="number"
            value={businessGoal.budget || ''}
            onChange={(e) => setBusinessGoal({ ...businessGoal, budget: parseFloat(e.target.value) })}
            className="w-full p-2 border border-gray-300 rounded-md max-w-xs"
            placeholder="如: 1000"
          />
        </div>
      </div>
    </div>
  );

  // 变量选择步骤
  const VariableSelectionStep = () => {
    const [selectedVariables, setSelectedVariables] = useState<string[]>([]);
    
    const variables = [
      { id: 'model', name: '模型选择', desc: 'GPT-4 vs Claude-3 vs Llama', complexity: 'low' },
      { id: 'prompt', name: '提示词模板', desc: '不同的提示词策略', complexity: 'medium' },
      { id: 'temperature', name: '温度参数', desc: '创造性 vs 确定性', complexity: 'low' },
      { id: 'tools', name: '工具配置', desc: '可用工具的组合', complexity: 'high' },
      { id: 'context_length', name: '上下文长度', desc: '记忆窗口大小', complexity: 'medium' },
      { id: 'response_format', name: '响应格式', desc: '结构化 vs 自然语言', complexity: 'low' }
    ];

    const toggleVariable = (variableId: string) => {
      const newSelectedVariables = selectedVariables.includes(variableId) 
        ? selectedVariables.filter(id => id !== variableId)
        : [...selectedVariables, variableId];
      
      setSelectedVariables(newSelectedVariables);
      
      // 更新实验配置，使用计算出的新值
      setExperimentConfig({ ...experimentConfig, variables: newSelectedVariables });
    };

    const getComplexityColor = (complexity: string) => {
      switch (complexity) {
        case 'low': return 'bg-green-100 text-green-800';
        case 'medium': return 'bg-yellow-100 text-yellow-800';
        case 'high': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900">选择测试变量</h3>
          <p className="text-gray-600 mt-2">选择你想要对比测试的变量</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <Lightbulb className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-blue-900">AI建议</div>
              <div className="text-blue-700 mt-1">
                基于你的{businessGoal.objective === 'performance' ? '性能优化' : '业务'}目标，
                我们推荐优先测试<strong>模型选择</strong>和<strong>提示词模板</strong>，
                这两个变量对结果影响最大且风险可控。
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {variables.map((variable) => (
            <div
              key={variable.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedVariables.includes(variable.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleVariable(variable.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedVariables.includes(variable.id)}
                      onChange={(e) => {
                        e.stopPropagation(); // 防止事件冒泡
                        toggleVariable(variable.id);
                      }}
                      className="mr-3"
                    />
                    <div className="font-medium text-gray-900">{variable.name}</div>
                  </div>
                  <div className="text-sm text-gray-500 mt-1 ml-6">{variable.desc}</div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${getComplexityColor(variable.complexity)}`}>
                  {variable.complexity === 'low' ? '简单' : variable.complexity === 'medium' ? '中等' : '复杂'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {selectedVariables.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">复杂度评估</h4>
            <div className="text-sm text-gray-600">
              已选择 {selectedVariables.length} 个变量
              {selectedVariables.length > 2 && (
                <div className="text-orange-600 mt-1">
                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                  建议：变量过多会增加实验复杂度，考虑分阶段测试
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // AI策略推荐步骤
  const StrategyRecommendationStep = () => {
    // 模拟AI分析生成推荐
    const generateRecommendation = (): ExperimentRecommendation => {
      const selectedVarCount = experimentConfig.variables?.length || 0;
      
      let approach: ExperimentRecommendation['approach'] = 'simple_ab';
      let complexity: ExperimentRecommendation['complexity'] = 'low';
      
      if (selectedVarCount <= 2 && businessGoal.urgency === 'high') {
        approach = 'simple_ab';
        complexity = 'low';
      } else if (selectedVarCount <= 3 && businessGoal.riskTolerance !== 'low') {
        approach = 'sequential';
        complexity = 'medium';
      } else if (selectedVarCount > 3) {
        approach = 'multivariate';
        complexity = 'high';
      }

      return {
        approach,
        complexity,
        duration: complexity === 'low' ? 7 : complexity === 'medium' ? 14 : 21,
        sampleSize: complexity === 'low' ? 1000 : complexity === 'medium' ? 2500 : 5000,
        successProbability: complexity === 'low' ? 0.85 : complexity === 'medium' ? 0.72 : 0.58,
        estimatedCost: (businessGoal.budget || 1000) * 0.6,
        risks: complexity === 'high' 
          ? ['结果解释复杂', '需要更大样本量', '实验周期较长']
          : complexity === 'medium'
          ? ['需要序列决策', '中等复杂度分析']
          : ['相对简单', '风险较低'],
        benefits: approach === 'simple_ab'
          ? ['快速得出结论', '结果清晰', '实施简单']
          : approach === 'sequential'
          ? ['渐进式优化', '风险可控', '学习效果好']
          : ['全面优化', '系统性改进', '效果最大化'],
        nextSteps: [
          '设置实验参数',
          '配置环境控制',
          '启动实验监控'
        ]
      };
    };

    if (!recommendation) {
      setRecommendation(generateRecommendation());
    }

    const getApproachName = (approach: string) => {
      switch (approach) {
        case 'simple_ab': return '简单A/B测试';
        case 'sequential': return '序列实验';
        case 'multivariate': return '多变量实验';
        default: return approach;
      }
    };

    const getComplexityColor = (complexity: string) => {
      switch (complexity) {
        case 'low': return 'text-green-600 bg-green-100';
        case 'medium': return 'text-yellow-600 bg-yellow-100';
        case 'high': return 'text-red-600 bg-red-100';
        default: return 'text-gray-600 bg-gray-100';
      }
    };

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900">AI智能推荐</h3>
          <p className="text-gray-600 mt-2">基于你的目标和变量选择，AI为你推荐最优策略</p>
        </div>

        {recommendation && (
          <div className="space-y-6">
            {/* 推荐策略卡片 */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">推荐策略</h4>
                <div className="flex items-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getComplexityColor(recommendation.complexity)}`}>
                    {recommendation.complexity === 'low' ? '低复杂度' : 
                     recommendation.complexity === 'medium' ? '中等复杂度' : '高复杂度'}
                  </span>
                </div>
              </div>
              
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {getApproachName(recommendation.approach)}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="text-center">
                  <Clock className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                  <div className="text-sm text-gray-500">预计周期</div>
                  <div className="font-semibold">{recommendation.duration} 天</div>
                </div>
                <div className="text-center">
                  <Users className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                  <div className="text-sm text-gray-500">样本量</div>
                  <div className="font-semibold">{recommendation.sampleSize.toLocaleString()}</div>
                </div>
                <div className="text-center">
                  <Target className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                  <div className="text-sm text-gray-500">成功概率</div>
                  <div className="font-semibold">{Math.round(recommendation.successProbability * 100)}%</div>
                </div>
                <div className="text-center">
                  <DollarSign className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                  <div className="text-sm text-gray-500">预估成本</div>
                  <div className="font-semibold">${recommendation.estimatedCost.toFixed(0)}</div>
                </div>
              </div>
            </div>

            {/* 风险和收益对比 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h5 className="font-medium text-red-800 mb-3">潜在风险</h5>
                <ul className="space-y-2">
                  {recommendation.risks.map((risk, index) => (
                    <li key={index} className="flex items-center text-sm text-red-700">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h5 className="font-medium text-green-800 mb-3">预期收益</h5>
                <ul className="space-y-2">
                  {recommendation.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center text-sm text-green-700">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 下一步行动 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-blue-800 mb-3">下一步行动</h5>
              <ol className="space-y-2">
                {recommendation.nextSteps.map((step, index) => (
                  <li key={index} className="flex items-center text-sm text-blue-700">
                    <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
    );
  };

  // 参数配置步骤
  const ConfigurationStep = () => {
    const [config, setConfig] = useState({
      splittingStrategy: 'session',
      trafficRatio: 50,
      fixedSeed: 12345,
      temperature: 0.7,
      maxBudget: businessGoal.budget || 1000,
      stopCriteria: 'statistical_significance'
    });

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900">实验参数配置</h3>
          <p className="text-gray-600 mt-2">配置实验的具体参数和约束条件</p>
        </div>

        <div className="space-y-6">
          {/* 流量分配 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-4">流量分配策略</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">分流单位</label>
                <div className="space-y-2">
                  {[
                    { id: 'session', label: '会话级分流', desc: '每个会话保持一致体验' },
                    { id: 'user', label: '用户级分流', desc: '同一用户始终在同一组' }
                  ].map((strategy) => (
                    <label key={strategy.id} className="flex items-center p-3 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="splittingStrategy"
                        value={strategy.id}
                        checked={config.splittingStrategy === strategy.id}
                        onChange={(e) => setConfig({ ...config, splittingStrategy: e.target.value })}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{strategy.label}</div>
                        <div className="text-sm text-gray-500">{strategy.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">实验组流量比例</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={config.trafficRatio}
                    onChange={(e) => setConfig({ ...config, trafficRatio: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="w-16 text-sm text-gray-600">{config.trafficRatio}%</span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  对照组: {100 - config.trafficRatio}% | 实验组: {config.trafficRatio}%
                </div>
              </div>
            </div>
          </div>

          {/* 环境控制 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-4">环境控制参数</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">随机种子</label>
                <input
                  type="number"
                  value={config.fixedSeed}
                  onChange={(e) => setConfig({ ...config, fixedSeed: parseInt(e.target.value) })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <div className="text-xs text-gray-500 mt-1">确保输出一致性</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">温度参数</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  value={config.temperature}
                  onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <div className="text-xs text-gray-500 mt-1">控制输出随机性</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">最大预算 (USD)</label>
                <input
                  type="number"
                  value={config.maxBudget}
                  onChange={(e) => setConfig({ ...config, maxBudget: parseFloat(e.target.value) })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <div className="text-xs text-gray-500 mt-1">自动熔断保护</div>
              </div>
            </div>
          </div>

          {/* 停止条件 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-4">实验停止条件</h4>
            <div className="space-y-3">
              {[
                { id: 'statistical_significance', label: '统计显著性', desc: 'p < 0.05 且效果量 > 0.2' },
                { id: 'practical_significance', label: '实际意义', desc: '达到业务最小改进阈值' },
                { id: 'budget_limit', label: '预算限制', desc: '达到最大预算时自动停止' },
                { id: 'time_limit', label: '时间限制', desc: '固定时间后停止' }
              ].map((criteria) => (
                <label key={criteria.id} className="flex items-center p-3 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={config.stopCriteria === criteria.id}
                    onChange={() => setConfig({ ...config, stopCriteria: criteria.id })}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{criteria.label}</div>
                    <div className="text-sm text-gray-500">{criteria.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* 配置预览 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-medium text-blue-900 mb-4">配置预览</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-blue-700">分流策略</div>
              <div className="font-medium text-blue-900">{config.splittingStrategy === 'session' ? '会话级' : '用户级'}</div>
            </div>
            <div>
              <div className="text-blue-700">流量比例</div>
              <div className="font-medium text-blue-900">{100 - config.trafficRatio}% : {config.trafficRatio}%</div>
            </div>
            <div>
              <div className="text-blue-700">预算限制</div>
              <div className="font-medium text-blue-900">${config.maxBudget}</div>
            </div>
            <div>
              <div className="text-blue-700">环境控制</div>
              <div className="font-medium text-blue-900">种子: {config.fixedSeed}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return businessGoal.objective && businessGoal.urgency && businessGoal.targetMetric;
      case 1:
        return experimentConfig.variables && experimentConfig.variables.length > 0;
      case 2:
        return recommendation !== null;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleCreateExperiment = () => {
    const fullConfig = {
      ...businessGoal,
      ...experimentConfig,
      recommendation,
      wizard: true
    };
    onCreateExperiment(fullConfig);
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="modal flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">智能实验设计向导</h2>
            <p className="text-sm text-gray-600 mt-1">AI辅助你设计科学、高效的A/B实验</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* 步骤指示器 */}
        <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  index <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step.completed ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="ml-3">
                  <div className={`text-sm font-medium ${
                    index <= currentStep ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500">{step.description}</div>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-gray-400 mx-6" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 步骤内容 */}
        <div className="p-6 overflow-y-auto flex-1">
          {currentStep === 0 && <BusinessGoalStep />}
          {currentStep === 1 && <VariableSelectionStep />}
          {currentStep === 2 && <StrategyRecommendationStep />}
          {currentStep === 3 && <ConfigurationStep />}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            上一步
          </button>

          <div className="text-sm text-gray-500">
            第 {currentStep + 1} 步，共 {steps.length} 步
          </div>

          {currentStep === steps.length - 1 ? (
            <button
              onClick={handleCreateExperiment}
              disabled={!canProceed()}
              className="flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Target className="h-4 w-4 mr-2" />
              创建实验
            </button>
          ) : (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一步
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ExperimentWizard;