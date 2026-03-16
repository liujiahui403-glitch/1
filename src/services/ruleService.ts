import { db, collection, getDocs } from '../firebase';
import { CareerRule, User } from '../types';

export const evaluateCareerRules = async (user: User): Promise<string[]> => {
  const rulesSnap = await getDocs(collection(db, 'careerRules'));
  const rules = rulesSnap.docs.map(d => ({ id: d.id, ...d.data() } as CareerRule));
  
  const recommendations: string[] = [];
  
  // Simple rule engine simulation
  rules.forEach(rule => {
    // In a real app, we'd use a safe eval or a rule engine library
    // Here we simulate the condition check based on user interests
    const interests = user.careerInterests || [];
    const bio = user.bio || '';
    
    if (rule.condition.includes('interests.includes')) {
      const match = rule.condition.match(/'([^']+)'/);
      if (match && interests.includes(match[1])) {
        recommendations.push(rule.recommendation);
      }
    }
  });
  
  return recommendations;
};

// Mock Test Metrics for the report
export const getTestMetrics = () => {
  return {
    precision: 0.89,
    recall: 0.82,
    f1Score: 0.85,
    accuracy: 0.91,
    testDate: new Date().toLocaleDateString(),
    sampleSize: 500
  };
};
