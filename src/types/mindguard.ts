export type ScreenId =
  | 'splash'
  | 'onboarding'
  | 'auth'
  | 'dashboard'
  | 'checkin'
  | 'journal'
  | 'insights'
  | 'risk'
  | 'forecast'
  | 'coach'
  | 'analytics'
  | 'profile'
  | 'settings'
  | 'emergency'
  | 'blueprint';

export type MoodId =
  | 'happy'
  | 'calm'
  | 'neutral'
  | 'sad'
  | 'anxious'
  | 'overwhelmed';

export interface MoodOption {
  id: MoodId;
  emoji: string;
  label: string;
  valence: number; // 1 to 10
}

export const MOOD_OPTIONS: MoodOption[] = [
  { id: 'happy', emoji: '😊', label: 'Happy', valence: 9 },
  { id: 'calm', emoji: '😌', label: 'Calm', valence: 8 },
  { id: 'neutral', emoji: '😐', label: 'Neutral', valence: 6 },
  { id: 'sad', emoji: '😔', label: 'Sad', valence: 4 },
  { id: 'anxious', emoji: '😟', label: 'Anxious', valence: 3 },
  { id: 'overwhelmed', emoji: '😫', label: 'Overwhelmed', valence: 2 },
];

export type SocialLevel = 'isolated' | 'low' | 'moderate' | 'high';
export type RiskTier = 'Low Risk' | 'Moderate Risk' | 'High Risk';

export interface CheckInEntry {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: string;
  mood: MoodId;
  moodScore: number; // 1-10
  stress: number; // 1-10
  anxiety: number; // 1-10
  energy: number; // 1-10
  motivation: number; // 1-10
  sleepHours: number; // e.g., 5.5
  socialLevel: SocialLevel;
  physicalActivityMins: number;
  waterIntakeLiters: number;
  screenTimeHours: number;
  academicWorkload: number; // 1-10
  note?: string;
}

export interface DetectedSignal {
  label:
    | 'Anxiety'
    | 'Loneliness'
    | 'Academic Pressure'
    | 'Social Stress'
    | 'Burnout Signs'
    | 'Emotional Exhaustion'
    | 'Positive Coping';
  intensity: number; // 0-100
  evidence: string;
}

export interface JournalAnalysis {
  sentimentScore: number; // -1.0 to 1.0
  primaryEmotion: string;
  stressLevel: number; // 0-100
  burnoutIndicator: number; // 0-100
  detectedSignals: DetectedSignal[];
  thoughtPatterns: string[];
  insightSummary: string;
  recommendedAction: string;
  crisisFlag: boolean;
  crisisSeverity: 'none' | 'elevated' | 'critical';
  crisisReason?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  timestamp: string;
  mode: 'text' | 'voice' | 'reflection';
  prompt?: string;
  content: string;
  durationSec?: number;
  analysis: JournalAnalysis;
}

export interface RiskFactor {
  id: string;
  label: string;
  contributionPct: number; // e.g. +35
  direction: 'risk' | 'protective';
  detail: string;
  baselineValue: string;
  currentValue: string;
}

export interface DistressPrediction {
  riskProbability: number; // 0-100
  confidenceScore: number; // 0-100
  riskTier: RiskTier;
  wellnessScore: number; // 0-100
  emotionalStabilityScore: number; // 0-100
  stressScore: number; // 0-100
  burnoutRiskScore: number; // 0-100
  sleepHealthScore: number; // 0-100
  weeklyWellnessDelta: number; // e.g. -6 or +4
  factors: RiskFactor[];
  aiSummary?: string;
  interventions?: string[];
  updatedAt: string;
}

export interface BurnoutForecastPoint {
  horizon: string; // 'Today', 'Tomorrow', '+2 Days', '+3 Days', '+5 Days', '+7 Days'
  dayLabel: string;
  predictedStress: number; // 0-100
  predictedMood: number; // 0-100
  predictedBurnout: number; // 0-100
  confidenceLow: number;
  confidenceHigh: number;
  keyDriver: string;
}

export interface BaselineMetric {
  id: string;
  label: string;
  unit: string;
  baselineValue: number;
  currentValue: number;
  deviationPct: number;
  status: 'optimal' | 'watch' | 'alert';
  directionGood: 'higher' | 'lower' | 'target';
}

export interface PersonalBaseline {
  calibratedDays: number;
  sleepHours: number;
  stressLevel: number;
  moodScore: number;
  activityMins: number;
  screenTimeHours: number;
  waterLiters: number;
  metrics: BaselineMetric[];
}

export interface DigitalTwinProfile {
  archetypeName: string;
  learningConfidence: number;
  chronotype: string;
  peakProductiveWindow: string;
  vulnerabilityWindow: string;
  topStressTriggers: string[];
  topProtectiveHabits: string[];
  emotionalCycleSummary: string;
  sleepSensitivity: string;
  screenSensitivity: string;
}

export interface InsightCardItem {
  id: string;
  category: 'Sleep' | 'Movement' | 'Digital Habits' | 'Social' | 'Academics';
  headline: string;
  correlationStat: string;
  explanation: string;
  impactDirection: 'positive' | 'negative';
  actionableStep: string;
}

export interface CoachMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  crisisTriggered?: boolean;
  suggestedFollowUps?: string[];
}

export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  dailyReminderTime: string;
  predictiveAlertsEnabled: boolean;
  baselineSensitivity: 'standard' | 'high';
  shareAnonymizedCampusTrends: boolean;
  voiceTranscriptionEnabled: boolean;
  emergencyContact: EmergencyContact;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  university: string;
  major: string;
  year: string;
  avatarUrl: string;
  joinedDate: string;
}

export interface AppState {
  user: UserProfile;
  checkIns: CheckInEntry[];
  journals: JournalEntry[];
  prediction: DistressPrediction;
  forecast: BurnoutForecastPoint[];
  baseline: PersonalBaseline;
  digitalTwin: DigitalTwinProfile;
  insights: InsightCardItem[];
  coachMessages: CoachMessage[];
  settings: UserSettings;
  crisisAlertActive: boolean;
  crisisAlertReason?: string;
}
