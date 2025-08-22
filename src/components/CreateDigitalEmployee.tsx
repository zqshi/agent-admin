import { useState } from 'react';
import { 
  X, 
  Save, 
  Upload, 
  Plus, 
  Minus,
  User,
  Brain,
  Shield,
  BookOpen,
  Users,
  CheckCircle
} from 'lucide-react';
import { CreateDigitalEmployeeForm, DigitalEmployeeManagement, ConversationExample, FAQItem } from '../types';

interface CreateDigitalEmployeeProps {
  onClose: () => void;
  onSave: (employee: DigitalEmployeeManagement) => void;
}

const CreateDigitalEmployee = ({ onClose, onSave }: CreateDigitalEmployeeProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CreateDigitalEmployeeForm>({
    name: '',
    employeeNumber: '',
    description: '',
    department: '',
    systemPrompt: '',
    personality: '',
    responsibilities: [''],
    exampleDialogues: [],
    enableMentor: false,
    allowedTools: [],
    resourcePermissions: [],
    canSelfLearn: false,
    initialFAQs: []
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    { id: 1, title: '基础信息', icon: User },
    { id: 2, title: '角色人设', icon: Brain },
    { id: 3, title: '权限配置', icon: Shield },
    { id: 4, title: '知识初始化', icon: BookOpen },
    { id: 5, title: '导师配置', icon: Users }
  ];

  const departments = [
    '客户服务部',
    '技术支持部', 
    '销售部',
    '人力资源部',
    '管理层',
    '产品部',
    '运营部'
  ];

  const availableTools = [
    'order_query',
    'logistics_track', 
    'customer_info',
    'faq_search',
    'tech_diagnosis',
    'solution_search',
    'crm_access',
    'product_catalog',
    'pricing_calc'
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = '请输入员工姓名';
      if (!formData.employeeNumber.trim()) newErrors.employeeNumber = '请输入员工编号';
      if (!formData.department) newErrors.department = '请选择所属部门';
    }

    if (step === 2) {
      if (!formData.systemPrompt.trim()) newErrors.systemPrompt = '请输入系统提示词';
      if (!formData.personality.trim()) newErrors.personality = '请输入性格特点';
      if (formData.responsibilities.filter(r => r.trim()).length === 0) {
        newErrors.responsibilities = '请至少添加一项职责';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const addResponsibility = () => {
    setFormData(prev => ({
      ...prev,
      responsibilities: [...prev.responsibilities, '']
    }));
  };

  const removeResponsibility = (index: number) => {
    setFormData(prev => ({
      ...prev,
      responsibilities: prev.responsibilities.filter((_, i) => i !== index)
    }));
  };

  const updateResponsibility = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      responsibilities: prev.responsibilities.map((r, i) => i === index ? value : r)
    }));
  };

  const addExampleDialogue = () => {
    setFormData(prev => ({
      ...prev,
      exampleDialogues: [...prev.exampleDialogues, {
        id: Date.now().toString(),
        userInput: '',
        expectedResponse: '',
        tags: []
      }]
    }));
  };

  const removeExampleDialogue = (index: number) => {
    setFormData(prev => ({
      ...prev,
      exampleDialogues: prev.exampleDialogues.filter((_, i) => i !== index)
    }));
  };

  const updateExampleDialogue = (index: number, field: keyof ConversationExample, value: string) => {
    setFormData(prev => ({
      ...prev,
      exampleDialogues: prev.exampleDialogues.map((dialogue, i) => 
        i === index ? { ...dialogue, [field]: value } : dialogue
      )
    }));
  };

  const addFAQ = () => {
    setFormData(prev => ({
      ...prev,
      initialFAQs: [...prev.initialFAQs, {
        id: Date.now().toString(),
        question: '',
        answer: '',
        tags: [],
        confidence: 1.0,
        usageCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }]
    }));
  };

  const removeFAQ = (index: number) => {
    setFormData(prev => ({
      ...prev,
      initialFAQs: prev.initialFAQs.filter((_, i) => i !== index)
    }));
  };

  const updateFAQ = (index: number, field: keyof FAQItem, value: string) => {
    setFormData(prev => ({
      ...prev,
      initialFAQs: prev.initialFAQs.map((faq, i) => 
        i === index ? { ...faq, [field]: value } : faq
      )
    }));
  };

  const handleSubmit = () => {
    if (!validateStep(currentStep)) return;

    const newEmployee: DigitalEmployeeManagement = {
      id: Date.now().toString(),
      name: formData.name,
      employeeNumber: formData.employeeNumber,
      description: formData.description,
      status: 'active',
      department: formData.department,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      persona: {
        systemPrompt: formData.systemPrompt,
        personality: formData.personality,
        responsibilities: formData.responsibilities.filter(r => r.trim()),
        exampleDialogues: formData.exampleDialogues
      },
      permissions: {
        allowedTools: formData.allowedTools,
        resourceAccess: formData.resourcePermissions,
        knowledgeManagement: {
          canSelfLearn: formData.canSelfLearn,
          canModifyKnowledge: false
        }
      },
      knowledgeBase: {
        documents: [],
        faqItems: formData.initialFAQs,
        autoLearnedItems: []
      },
      metrics: {
        totalSessions: 0,
        successfulSessions: 0,
        avgResponseTime: 0,
        knowledgeUtilizationRate: 0,
        toolUsageStats: {}
      }
    };

    if (formData.enableMentor && formData.mentorId) {
      newEmployee.mentorConfig = {
        mentorId: formData.mentorId,
        mentorName: 'AI-Manager', // 简化处理
        reportingCycle: formData.reportingCycle as any || 'weekly',
        reportingMethod: formData.reportingMethod || 'document'
      };
    }

    onSave(newEmployee);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                员工姓名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="例：AI-Alice"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                员工编号 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.employeeNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, employeeNumber: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.employeeNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="例：DE001"
              />
              {errors.employeeNumber && <p className="text-red-500 text-sm mt-1">{errors.employeeNumber}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                所属部门 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.department ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">请选择部门</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">描述</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="简要描述这个数字员工的用途和特点..."
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                系统提示词 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.systemPrompt}
                onChange={(e) => setFormData(prev => ({ ...prev, systemPrompt: e.target.value }))}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.systemPrompt ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="定义这个数字员工的角色、职责、性格和对话风格..."
              />
              {errors.systemPrompt && <p className="text-red-500 text-sm mt-1">{errors.systemPrompt}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                性格特点 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.personality}
                onChange={(e) => setFormData(prev => ({ ...prev, personality: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.personality ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="例：友好、耐心、专业、细心"
              />
              {errors.personality && <p className="text-red-500 text-sm mt-1">{errors.personality}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                主要职责 <span className="text-red-500">*</span>
              </label>
              {formData.responsibilities.map((responsibility, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={responsibility}
                    onChange={(e) => updateResponsibility(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="输入职责内容..."
                  />
                  {formData.responsibilities.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeResponsibility(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addResponsibility}
                className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                添加职责
              </button>
              {errors.responsibilities && <p className="text-red-500 text-sm mt-1">{errors.responsibilities}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">示例对话（可选）</label>
              {formData.exampleDialogues.map((dialogue, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">对话示例 {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeExampleDialogue(index)}
                      className="text-red-500 hover:bg-red-50 p-1 rounded"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={dialogue.userInput}
                      onChange={(e) => updateExampleDialogue(index, 'userInput', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="用户输入..."
                    />
                    <textarea
                      value={dialogue.expectedResponse}
                      onChange={(e) => updateExampleDialogue(index, 'expectedResponse', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="期望回答..."
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addExampleDialogue}
                className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                添加示例对话
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">允许使用的工具</label>
              <div className="grid grid-cols-2 gap-2">
                {availableTools.map(tool => (
                  <label key={tool} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.allowedTools.includes(tool)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            allowedTools: [...prev.allowedTools, tool]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            allowedTools: prev.allowedTools.filter(t => t !== tool)
                          }));
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">{tool}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">知识管理权限</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.canSelfLearn}
                    onChange={(e) => setFormData(prev => ({ ...prev, canSelfLearn: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">允许自主学习</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">初始FAQ</label>
              {formData.initialFAQs.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">FAQ {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeFAQ(index)}
                      className="text-red-500 hover:bg-red-50 p-1 rounded"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="问题..."
                    />
                    <textarea
                      value={faq.answer}
                      onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="答案..."
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addFAQ}
                className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                添加FAQ
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">初始文档</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">点击上传或拖拽文件到此处</p>
                <p className="text-sm text-gray-400 mt-1">支持 PDF、TXT、MD、DOC 格式</p>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div>
              <label className="flex items-center mb-4">
                <input
                  type="checkbox"
                  checked={formData.enableMentor}
                  onChange={(e) => setFormData(prev => ({ ...prev, enableMentor: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">启用导师汇报机制</span>
              </label>
            </div>

            {formData.enableMentor && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">选择导师</label>
                  <select
                    value={formData.mentorId || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, mentorId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">请选择导师</option>
                    <option value="2">AI-Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">汇报周期</label>
                  <select
                    value={formData.reportingCycle || 'weekly'}
                    onChange={(e) => setFormData(prev => ({ ...prev, reportingCycle: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">每日</option>
                    <option value="weekly">每周</option>
                    <option value="monthly">每月</option>
                    <option value="quarterly">每季度</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">汇报方式</label>
                  <select
                    value={formData.reportingMethod || 'document'}
                    onChange={(e) => setFormData(prev => ({ ...prev, reportingMethod: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="im">IM消息</option>
                    <option value="document">生成文档</option>
                  </select>
                </div>
              </>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">创建数字员工</h2>
            <p className="text-gray-600">配置新的数字员工并设定其能力</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 步骤导航 */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    isActive 
                      ? 'border-blue-500 bg-blue-500 text-white' 
                      : isCompleted
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-gray-300 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-px mx-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 p-6 overflow-y-auto">
          {renderStepContent()}
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-white">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className={`px-4 py-2 border rounded-lg ${
              currentStep === 1
                ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            上一步
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
            
            {currentStep < 5 ? (
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                下一步
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1"
              >
                <Save className="h-4 w-4" />
                创建数字员工
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateDigitalEmployee;