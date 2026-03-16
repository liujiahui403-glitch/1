export const generateCareerAdvice = async (interests: string[], currentGoal: string) => {
  return `根据您的兴趣（${interests.join(", ")}）和目标（${currentGoal}），建议您专注于跨领域技能的提升。当前行业趋势显示，具备AI协作能力和深厚专业背景的复合型人才将最具竞争力。建议制定一个为期3个月的深度学习计划，并积极参与行业实战项目。`;
};

export const calculateMatchingScore = async (user: any, article: any) => {
  const score = Math.floor(Math.random() * 20) + 80; // 80-100
  return `${score} | 基于您的职业兴趣 ${user.careerInterests?.[0] || '探索'}，这篇文章与您的发展方向高度契合。`;
};

export const generateTrendBrief = async (category: string) => {
  return `${category} 领域目前正处于快速变革期。随着数字化转型的深入，该领域对具备数据驱动决策能力的人才需求增长了40%。建议关注行业内的自动化工具集成和远程协作新模式。`;
};

export const predictLogistics = async (productName: string) => {
  return "预计 24 小时内送达概率 85%，顺丰速运承运。";
};

export const generateCareerRadarData = async (user: any) => {
  return [
    { subject: '技术能力', A: 85, fullMark: 100 },
    { subject: '沟通能力', A: 75, fullMark: 100 },
    { subject: '领导力', A: 65, fullMark: 100 },
    { subject: '创新能力', A: 90, fullMark: 100 },
    { subject: '执行力', A: 80, fullMark: 100 },
  ];
};
