import { DIET_PLANS, DietPlan } from '../data/dietPlans';
import { QuestionnaireAnswers } from '../context/QuestionnaireContext';

/**
 * DietResolverService
 * Resolves the appropriate diet plan based on the user's questionnaire goal.
 */
export class DietResolverService {
  /**
   * Returns the matching DietPlan for the user's goal.
   * Falls back to the balanced fitness plan if no match is found.
   */
  static resolvePlan(answers?: QuestionnaireAnswers): DietPlan {
    if (!answers?.goal) {
      return DIET_PLANS.find((p) => p.goal === 'KEEP FIT') || DIET_PLANS[0];
    }

    const goalMap: Record<string, string> = {
      'Build Muscle': 'BUILD MUSCLE',
      'Lose Weight': 'LOSE WEIGHT',
      'Keep Fit': 'KEEP FIT',
      'Get Stronger': 'BUILD MUSCLE',
      'Lose Fat': 'LOSE WEIGHT',
      'Stay Active': 'KEEP FIT',
    };

    const mappedGoal = goalMap[answers.goal] || 'KEEP FIT';
    return DIET_PLANS.find((p) => p.goal === mappedGoal) || DIET_PLANS[0];
  }

  /**
   * Returns all available diet plans.
   */
  static getAllPlans(): DietPlan[] {
    return DIET_PLANS;
  }
}