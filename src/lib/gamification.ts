
// Experience Points (XP) management
export const calculateRequiredXP = (level: number): number => {
  // Formula that makes higher levels require more XP
  return Math.floor(100 * (level + 1) * Math.pow(1.1, level));
};

export const calculateLevelFromXP = (totalXP: number): number => {
  let level = 0;
  let requiredXP = calculateRequiredXP(level);
  
  while (totalXP >= requiredXP) {
    level++;
    totalXP -= requiredXP;
    requiredXP = calculateRequiredXP(level);
  }
  
  return level;
};

export const calculateXPProgress = (totalXP: number): { level: number, currentXP: number, requiredXP: number } => {
  let level = 0;
  let requiredXP = calculateRequiredXP(level);
  let remainingXP = totalXP;
  
  while (remainingXP >= requiredXP) {
    level++;
    remainingXP -= requiredXP;
    requiredXP = calculateRequiredXP(level);
  }
  
  return {
    level,
    currentXP: remainingXP,
    requiredXP
  };
};

// XP rewards for different actions
export const XP_REWARDS = {
  TASK_COMPLETION: 10,
  DAILY_STREAK: 25,
  DOCUMENT_CREATION: 15,
  WEEKLY_GOAL_REACHED: 50,
  PERFECT_WEEK: 100,
};

// Class types
export type UserClass = 'TechSavant' | 'CreativeMaster' | 'StrategicMind' | 'ProductivityGuru' | 'Beginner';

// Class definitions
export const CLASS_DEFINITIONS = {
  Beginner: {
    name: 'Beginner',
    description: 'Just starting your journey',
    icon: 'user'
  },
  TechSavant: {
    name: 'Tech Savant',
    description: 'Focused on technology, coding, and data analytics',
    icon: 'code'
  },
  CreativeMaster: {
    name: 'Creative Master',
    description: 'On a path of creative growth in writing, art, or design',
    icon: 'palette'
  },
  StrategicMind: {
    name: 'Strategic Mind',
    description: 'Designed for those focused on strategy, leadership, and organization',
    icon: 'brain'
  },
  ProductivityGuru: {
    name: 'Productivity Guru',
    description: 'Aiming to master time management and task organization',
    icon: 'clock'
  },
};

// Level thresholds for rewards
export const LEVEL_REWARDS = {
  5: ['New Avatar: Initiate', 'Basic Templates Pack'],
  10: ['New Avatar: Journeyman', 'Intermediate Templates Pack', 'Class Selection Unlocked'],
  15: ['New Avatar: Expert', 'Advanced Templates Pack', 'Weekly Challenge Option'],
  20: ['New Avatar: Master', 'Specialized Templates Pack', 'Class Evolution Option'],
  30: ['New Avatar: Grandmaster', 'Premium Templates Pack', 'Custom Badge Creator'],
  40: ['New Avatar: Legend', 'All Templates Unlocked', 'All Features Unlocked'],
};
