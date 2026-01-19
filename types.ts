
export enum ProficiencyLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced'
}

export enum Topic {
  GREETINGS = 'Daily Greetings',
  HOBBIES = 'Hobbies & Interests',
  FOOD = 'Food & Culture',
  TRAVEL = 'Travel & Adventure',
  TECH = 'Technology & Future',
  BUSINESS = 'Business English',
  NATURE = 'Nature & Environment'
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  correction?: string;
  explanation?: string;
  audioData?: string;
}

export interface TeacherState {
  level: ProficiencyLevel;
  topic: Topic;
  isGenerating: boolean;
  isSpeaking: boolean;
}
