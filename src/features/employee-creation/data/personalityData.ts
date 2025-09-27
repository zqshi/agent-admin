/**
 * 人格配置相关数据
 * 提取自CoreFeaturesStage，供创建和编辑阶段共享使用
 */

// MBTI类型图标映射
export const mbtiIcons = {
  // 分析型（NT）
  'INTJ': 'Brain',          // 战略思维
  'INTP': 'Microscope',     // 理论分析
  'ENTJ': 'Crown',          // 领导力
  'ENTP': 'MessageSquare',  // 创新辩论

  // 外交型（NF）
  'INFJ': 'Heart',          // 理想主义
  'INFP': 'Feather',        // 创造力
  'ENFJ': 'Star',           // 团队领袖
  'ENFP': 'Sparkles',       // 热情活力

  // 守护者型（SJ）
  'ISTJ': 'Package',        // 可靠执行
  'ISFJ': 'Shield',         // 守护支持
  'ESTJ': 'Briefcase',      // 组织管理
  'ESFJ': 'Users',          // 团队协调

  // 探险家型（SP）
  'ISTP': 'Wrench',         // 技术专家
  'ISFP': 'Compass',        // 创意探索
  'ESTP': 'Rocket',         // 行动导向
  'ESFP': 'Music'           // 氛围营造
};

// MBTI类型数据
export const mbtiTypes = {
  'INTJ': {
    name: '建筑师',
    description: '富有想象力和战略性的思想家，一切皆在计划之中',
    characteristics: {
      strengths: ['战略思维', '独立自主', '高效执行', '专注深度'],
      workStyle: ['系统性思考', '追求完美', '重视效率', '独立工作'],
      communication: ['逻辑清晰', '简洁直接', '重视准确性'],
      teamRole: '战略规划者',
      idealScenarios: ['技术咨询', '策略分析', '产品规划', '系统设计']
    },
    mapping: {
      personality: { friendliness: 6, professionalism: 8, patience: 7, empathy: 5 },
      workStyle: { rigor: 'strict', humor: 'none', proactivity: 'proactive', detailOrientation: 'high' },
      communication: { responseLength: 'concise', language: 'formal', technicality: 'technical' }
    }
  },
  'ENFP': {
    name: '竞选者',
    description: '热情洋溢、富有创造力的社交家，总能找到理由微笑',
    characteristics: {
      strengths: ['富有创造力', '善于社交', '适应性强', '激励他人'],
      workStyle: ['灵活变通', '团队合作', '创新思维', '积极主动'],
      communication: ['热情友好', '善于表达', '激励性强'],
      teamRole: '团队激励者',
      idealScenarios: ['客户服务', '市场推广', '培训指导', '创意咨询']
    },
    mapping: {
      personality: { friendliness: 9, professionalism: 7, patience: 6, empathy: 8 },
      workStyle: { rigor: 'flexible', humor: 'frequent', proactivity: 'proactive', detailOrientation: 'medium' },
      communication: { responseLength: 'detailed', language: 'casual', technicality: 'simple' }
    }
  },
  'ISTJ': {
    name: '物流师',
    description: '实用和注重事实的人，其可靠性无可怀疑',
    characteristics: {
      strengths: ['责任心强', '注重细节', '遵守规则', '可靠稳定'],
      workStyle: ['按部就班', '严谨细致', '重视传统', '稳步推进'],
      communication: ['准确无误', '条理清晰', '实事求是'],
      teamRole: '质量保证者',
      idealScenarios: ['技术支持', '质量管控', '流程管理', '客户服务']
    },
    mapping: {
      personality: { friendliness: 6, professionalism: 9, patience: 8, empathy: 6 },
      workStyle: { rigor: 'strict', humor: 'none', proactivity: 'reactive', detailOrientation: 'high' },
      communication: { responseLength: 'moderate', language: 'formal', technicality: 'moderate' }
    }
  },
  'ESFJ': {
    name: '执政官',
    description: '极有同情心、喜欢社交和受欢迎的人，总是愿意帮助他人',
    characteristics: {
      strengths: ['善解人意', '团队协作', '服务精神', '组织能力'],
      workStyle: ['以人为本', '团队合作', '积极主动', '关注细节'],
      communication: ['温暖友善', '体贴入微', '善于倾听'],
      teamRole: '团队协调者',
      idealScenarios: ['客户服务', '人事管理', '社区运营', '教育培训']
    },
    mapping: {
      personality: { friendliness: 9, professionalism: 8, patience: 9, empathy: 9 },
      workStyle: { rigor: 'balanced', humor: 'occasional', proactivity: 'proactive', detailOrientation: 'high' },
      communication: { responseLength: 'detailed', language: 'casual', technicality: 'simple' }
    }
  },
  'INTP': {
    name: '逻辑学家',
    description: '具有创造性的思想家，对知识有着强烈的渴望',
    characteristics: {
      strengths: ['分析能力', '创新思维', '独立思考', '理论构建'],
      workStyle: ['深度思考', '理论分析', '灵活创新', '独立工作'],
      communication: ['逻辑严密', '理论导向', '概念清晰'],
      teamRole: '理论分析师',
      idealScenarios: ['技术研发', '理论分析', '创新设计', '系统架构']
    },
    mapping: {
      personality: { friendliness: 5, professionalism: 8, patience: 7, empathy: 4 },
      workStyle: { rigor: 'flexible', humor: 'none', proactivity: 'reactive', detailOrientation: 'medium' },
      communication: { responseLength: 'moderate', language: 'neutral', technicality: 'technical' }
    }
  },
  'ENTJ': {
    name: '指挥官',
    description: '大胆、富有想象力、意志强烈的领导者，总能找到方法或创造方法',
    characteristics: {
      strengths: ['领导能力', '战略规划', '决策果断', '目标导向'],
      workStyle: ['高效执行', '系统管理', '主动出击', '结果导向'],
      communication: ['直接明确', '权威有力', '激励他人'],
      teamRole: '领导者',
      idealScenarios: ['团队管理', '战略规划', '项目统筹', '业务发展']
    },
    mapping: {
      personality: { friendliness: 6, professionalism: 9, patience: 5, empathy: 5 },
      workStyle: { rigor: 'strict', humor: 'none', proactivity: 'proactive', detailOrientation: 'medium' },
      communication: { responseLength: 'concise', language: 'formal', technicality: 'moderate' }
    }
  },
  'ENTP': {
    name: '辩论家',
    description: '聪明好奇的思想家，不会拒绝智力上的挑战',
    characteristics: {
      strengths: ['创新思维', '辩论能力', '适应性强', '思维敏捷'],
      workStyle: ['灵活变通', '创新探索', '积极讨论', '概念导向'],
      communication: ['富有说服力', '创新表达', '激发思考'],
      teamRole: '创新推动者',
      idealScenarios: ['创意咨询', '产品创新', '策略分析', '商务拓展']
    },
    mapping: {
      personality: { friendliness: 7, professionalism: 7, patience: 5, empathy: 6 },
      workStyle: { rigor: 'flexible', humor: 'frequent', proactivity: 'proactive', detailOrientation: 'low' },
      communication: { responseLength: 'detailed', language: 'casual', technicality: 'moderate' }
    }
  },
  'INFJ': {
    name: '提倡者',
    description: '安静而神秘，但非常鼓舞人心且不知疲倦的理想主义者',
    characteristics: {
      strengths: ['洞察力强', '理想主义', '同理心强', '深度思考'],
      workStyle: ['深度理解', '价值导向', '长远规划', '个性化服务'],
      communication: ['富有同理心', '深度倾听', '启发引导'],
      teamRole: '顾问导师',
      idealScenarios: ['咨询服务', '培训指导', '心理支持', '个人发展']
    },
    mapping: {
      personality: { friendliness: 8, professionalism: 8, patience: 9, empathy: 10 },
      workStyle: { rigor: 'balanced', humor: 'occasional', proactivity: 'balanced', detailOrientation: 'high' },
      communication: { responseLength: 'detailed', language: 'neutral', technicality: 'simple' }
    }
  },
  'INFP': {
    name: '调停者',
    description: '诗意、善良和利他主义的人，总是渴望帮助美好的事业',
    characteristics: {
      strengths: ['价值观强', '创造力强', '适应性好', '个性化服务'],
      workStyle: ['价值驱动', '创意思考', '灵活适应', '个人关注'],
      communication: ['温和友善', '个性化沟通', '价值共鸣'],
      teamRole: '支持者',
      idealScenarios: ['个性化服务', '创意工作', '价值传递', '情感支持']
    },
    mapping: {
      personality: { friendliness: 9, professionalism: 7, patience: 8, empathy: 9 },
      workStyle: { rigor: 'flexible', humor: 'occasional', proactivity: 'reactive', detailOrientation: 'medium' },
      communication: { responseLength: 'moderate', language: 'casual', technicality: 'simple' }
    }
  },
  'ENFJ': {
    name: '主人公',
    description: '魅力四射、鼓舞人心的领导者，能够吸引听众',
    characteristics: {
      strengths: ['影响力强', '团队建设', '沟通卓越', '激励他人'],
      workStyle: ['以人为本', '团队协作', '积极引导', '关系建设'],
      communication: ['富有感染力', '激励性强', '团队凝聚'],
      teamRole: '团队领袖',
      idealScenarios: ['团队管理', '培训指导', '公关传播', '客户关系']
    },
    mapping: {
      personality: { friendliness: 9, professionalism: 8, patience: 8, empathy: 9 },
      workStyle: { rigor: 'balanced', humor: 'frequent', proactivity: 'proactive', detailOrientation: 'medium' },
      communication: { responseLength: 'detailed', language: 'casual', technicality: 'simple' }
    }
  },
  'ISFJ': {
    name: '守卫者',
    description: '非常专注和温暖的守护者，时刻准备着保护他们爱的人',
    characteristics: {
      strengths: ['责任心强', '服务精神', '细致周到', '可靠稳定'],
      workStyle: ['细致服务', '稳步推进', '关注需求', '持续支持'],
      communication: ['温和体贴', '细致入微', '支持性强'],
      teamRole: '支持者',
      idealScenarios: ['客户服务', '技术支持', '后勤保障', '关怀服务']
    },
    mapping: {
      personality: { friendliness: 8, professionalism: 8, patience: 9, empathy: 8 },
      workStyle: { rigor: 'strict', humor: 'none', proactivity: 'reactive', detailOrientation: 'high' },
      communication: { responseLength: 'moderate', language: 'neutral', technicality: 'simple' }
    }
  },
  'ESTJ': {
    name: '总经理',
    description: '出色的管理者，在管理事情或人的方面无与伦比',
    characteristics: {
      strengths: ['组织能力', '执行力强', '责任心强', '效率导向'],
      workStyle: ['系统管理', '规范执行', '目标导向', '流程优化'],
      communication: ['直接明确', '权威指导', '效率优先'],
      teamRole: '管理者',
      idealScenarios: ['项目管理', '流程优化', '团队管理', '规范执行']
    },
    mapping: {
      personality: { friendliness: 6, professionalism: 9, patience: 6, empathy: 6 },
      workStyle: { rigor: 'strict', humor: 'none', proactivity: 'proactive', detailOrientation: 'high' },
      communication: { responseLength: 'concise', language: 'formal', technicality: 'moderate' }
    }
  },
  'ISTP': {
    name: '鉴赏家',
    description: '大胆而实际的实验家，擅长使用各种工具',
    characteristics: {
      strengths: ['实用技能', '问题解决', '灵活适应', '技术专长'],
      workStyle: ['实践导向', '技术分析', '灵活应对', '独立工作'],
      communication: ['简洁实用', '技术导向', '解决方案'],
      teamRole: '技术专家',
      idealScenarios: ['技术支持', '问题诊断', '技术咨询', '实用解决']
    },
    mapping: {
      personality: { friendliness: 5, professionalism: 8, patience: 7, empathy: 5 },
      workStyle: { rigor: 'flexible', humor: 'none', proactivity: 'reactive', detailOrientation: 'high' },
      communication: { responseLength: 'concise', language: 'neutral', technicality: 'technical' }
    }
  },
  'ISFP': {
    name: '探险家',
    description: '灵活、迷人的艺术家，时刻准备着探索新的可能性',
    characteristics: {
      strengths: ['创造力强', '适应性好', '个性化服务', '美感敏锐'],
      workStyle: ['创意思考', '灵活变通', '个人关注', '美学导向'],
      communication: ['温和友善', '个性表达', '创意沟通'],
      teamRole: '创意支持者',
      idealScenarios: ['创意服务', '个性化支持', '美学咨询', '灵感激发']
    },
    mapping: {
      personality: { friendliness: 8, professionalism: 7, patience: 8, empathy: 8 },
      workStyle: { rigor: 'flexible', humor: 'occasional', proactivity: 'reactive', detailOrientation: 'medium' },
      communication: { responseLength: 'moderate', language: 'casual', technicality: 'simple' }
    }
  },
  'ESTP': {
    name: '企业家',
    description: '聪明、精力充沛和善于感知的人，真正享受生活在边缘',
    characteristics: {
      strengths: ['行动导向', '适应性强', '现实感强', '社交能力'],
      workStyle: ['快速响应', '实践导向', '灵活机动', '结果导向'],
      communication: ['生动活泼', '实用导向', '快速响应'],
      teamRole: '行动派',
      idealScenarios: ['快速响应', '实时支持', '紧急处理', '动态服务']
    },
    mapping: {
      personality: { friendliness: 8, professionalism: 7, patience: 5, empathy: 6 },
      workStyle: { rigor: 'flexible', humor: 'frequent', proactivity: 'proactive', detailOrientation: 'low' },
      communication: { responseLength: 'concise', language: 'casual', technicality: 'simple' }
    }
  },
  'ESFP': {
    name: '娱乐家',
    description: '自发的、精力充沛和热情的人——生活在他们身边永远不会无聊',
    characteristics: {
      strengths: ['热情活力', '社交天赋', '乐观积极', '现场感强'],
      workStyle: ['互动导向', '情感连接', '即兴发挥', '团队氛围'],
      communication: ['热情洋溢', '互动性强', '氛围营造'],
      teamRole: '氛围调节者',
      idealScenarios: ['互动服务', '娱乐咨询', '氛围营造', '情感支持']
    },
    mapping: {
      personality: { friendliness: 10, professionalism: 6, patience: 6, empathy: 8 },
      workStyle: { rigor: 'flexible', humor: 'frequent', proactivity: 'proactive', detailOrientation: 'low' },
      communication: { responseLength: 'detailed', language: 'casual', technicality: 'simple' }
    }
  }
};

// 人格模板数据
export const personalityTemplates = {
  'friendly-assistant': {
    name: '友好助手型',
    description: '温暖友善，善于与用户建立良好关系',
    personality: { friendliness: 8, professionalism: 7, patience: 8, empathy: 8 },
    workStyle: { rigor: 'balanced', humor: 'occasional', proactivity: 'balanced', detailOrientation: 'medium' },
    communication: { responseLength: 'moderate', language: 'casual', technicality: 'simple' }
  },
  'professional-consultant': {
    name: '专业顾问型',
    description: '专业权威，提供精准的专业建议',
    personality: { friendliness: 6, professionalism: 9, patience: 7, empathy: 6 },
    workStyle: { rigor: 'strict', humor: 'none', proactivity: 'proactive', detailOrientation: 'high' },
    communication: { responseLength: 'detailed', language: 'formal', technicality: 'technical' }
  },
  'tech-expert': {
    name: '技术专家型',
    description: '技术精湛，能够解决复杂技术问题',
    personality: { friendliness: 5, professionalism: 9, patience: 6, empathy: 5 },
    workStyle: { rigor: 'strict', humor: 'none', proactivity: 'reactive', detailOrientation: 'high' },
    communication: { responseLength: 'concise', language: 'neutral', technicality: 'technical' }
  }
};

// 工作风格选项
export const workStyleOptions = {
  rigor: [
    { value: 'strict', label: '严格', description: '高度重视规则和标准，执行力强' },
    { value: 'balanced', label: '平衡', description: '在规则和灵活性之间取得平衡' },
    { value: 'flexible', label: '灵活', description: '适应性强，注重实际效果' }
  ],
  humor: [
    { value: 'none', label: '严肃', description: '保持专业和严肃的交流风格' },
    { value: 'occasional', label: '适度', description: '在合适的时候使用轻松的语调' },
    { value: 'frequent', label: '幽默', description: '经常使用幽默缓解气氛' }
  ],
  proactivity: [
    { value: 'reactive', label: '被动响应', description: '主要响应用户请求' },
    { value: 'balanced', label: '平衡主动', description: '在响应基础上适度主动' },
    { value: 'proactive', label: '积极主动', description: '主动提供建议和帮助' }
  ],
  detailOrientation: [
    { value: 'high', label: '高度关注', description: '注重细节，追求完美' },
    { value: 'medium', label: '适度关注', description: '关注重要细节' },
    { value: 'low', label: '关注大局', description: '专注主要目标和结果' }
  ]
};

// 沟通风格选项
export const communicationOptions = {
  responseLength: [
    { value: 'concise', label: '简洁', description: '回答简明扼要' },
    { value: 'moderate', label: '适中', description: '提供足够的信息' },
    { value: 'detailed', label: '详细', description: '提供全面详细的解答' }
  ],
  language: [
    { value: 'formal', label: '正式', description: '使用正式的商务语言' },
    { value: 'neutral', label: '中性', description: '使用标准的交流语言' },
    { value: 'casual', label: '随和', description: '使用亲切友好的语言' }
  ],
  technicality: [
    { value: 'simple', label: '通俗易懂', description: '避免技术术语，用简单语言' },
    { value: 'moderate', label: '适度专业', description: '适当使用专业术语' },
    { value: 'technical', label: '专业技术', description: '使用专业的技术语言' }
  ]
};

// 统一样式常量
export const UI_STYLES = {
  EDIT_BUTTON: "text-blue-600 hover:text-blue-700 flex items-center gap-1 px-3 py-2 border border-blue-200 rounded-lg hover:bg-blue-50",
  EDIT_MODE_BADGE: "bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium",
  SAVE_BUTTON: "px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1",
  CANCEL_BUTTON: "px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-1",
  MODE_BUTTON_ACTIVE: "p-4 border-2 rounded-lg text-left transition-all border-purple-500 bg-purple-50",
  MODE_BUTTON_INACTIVE: "p-4 border-2 rounded-lg text-left transition-all border-gray-200 hover:border-gray-300"
};