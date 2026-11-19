import {
  AppState,
  CheckInEntry,
  CoachMessage,
  EmergencyContact,
  JournalEntry,
  MoodId,
  SocialLevel,
} from '../types/mindguard';
import {
  computeBehavioralInsights,
  computeBurnoutForecast,
  computeDigitalTwin,
  computeDistressPrediction,
  computePersonalBaseline,
} from './xaiEngine';

function daysAgoIso(daysAgo: number, hour = 20): { date: string; timestamp: string } {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, 15, 0, 0);
  const date = d.toISOString().slice(0, 10);
  return { date, timestamp: d.toISOString() };
}

export interface CreateUserAccountOptions {
  id: string;
  name: string;
  email: string;
  university: string;
  major: string;
  year: string;
  targetSleepHours?: number;
  emergencyContact?: EmergencyContact;
  theme?: 'light' | 'dark';
}

export function createEmptyUserAppState(opts: CreateUserAccountOptions): AppState {
  const sleepTarget = opts.targetSleepHours ?? 7.5;
  const baseline = computePersonalBaseline([], sleepTarget);
  const prediction = computeDistressPrediction([], [], baseline);
  const forecast = computeBurnoutForecast([], prediction);
  const digitalTwin = computeDigitalTwin([], baseline);
  const insights = computeBehavioralInsights([], []);

  const firstName = opts.name.trim().split(' ')[0] || 'there';

  return {
    user: {
      id: opts.id,
      name: opts.name.trim(),
      email: opts.email.trim(),
      university: opts.university.trim(),
      major: opts.major.trim(),
      year: opts.year.trim(),
      avatarUrl: '',
      joinedDate: new Date().toISOString().slice(0, 10),
    },
    checkIns: [],
    journals: [],
    prediction,
    forecast,
    baseline,
    digitalTwin,
    insights,
    coachMessages: [
      {
        id: `msg-welcome-${Date.now()}`,
        role: 'assistant',
        timestamp: new Date().toISOString(),
        content: `Welcome to MindGuard AI, ${firstName}. Your workspace starts completely fresh and personal to you. Whenever you're ready, log a quick 30-second check-in or share how your day is going so we can start learning your personal baseline.`,
        suggestedFollowUps: [
          'How does my personal baseline work?',
          'Give me a quick evening check-in prompt',
          'Help me plan a calm study schedule',
        ],
      },
    ],
    settings: {
      theme: opts.theme ?? 'light',
      dailyReminderTime: '20:30',
      predictiveAlertsEnabled: true,
      baselineSensitivity: 'standard',
      shareAnonymizedCampusTrends: false,
      voiceTranscriptionEnabled: true,
      emergencyContact: opts.emergencyContact ?? {
        name: '',
        relation: '',
        phone: '',
      },
    },
    crisisAlertActive: false,
  };
}

export function createInitialAppState(overrides?: {
  name?: string;
  email?: string;
  university?: string;
  major?: string;
  year?: string;
}): AppState {
  const rawDays: Array<{
    daysAgo: number;
    mood: MoodId;
    moodScore: number;
    stress: number;
    anxiety: number;
    energy: number;
    motivation: number;
    sleepHours: number;
    socialLevel: SocialLevel;
    physicalActivityMins: number;
    waterIntakeLiters: number;
    screenTimeHours: number;
    academicWorkload: number;
  }> = [
    { daysAgo: 17, mood: 'calm', moodScore: 8, stress: 4, anxiety: 3, energy: 7, motivation: 8, sleepHours: 7.6, socialLevel: 'moderate', physicalActivityMins: 40, waterIntakeLiters: 2.2, screenTimeHours: 4.8, academicWorkload: 5 },
    { daysAgo: 16, mood: 'happy', moodScore: 9, stress: 3, anxiety: 3, energy: 8, motivation: 8, sleepHours: 7.8, socialLevel: 'high', physicalActivityMins: 45, waterIntakeLiters: 2.4, screenTimeHours: 4.5, academicWorkload: 5 },
    { daysAgo: 15, mood: 'calm', moodScore: 8, stress: 4, anxiety: 4, energy: 7, motivation: 7, sleepHours: 7.4, socialLevel: 'moderate', physicalActivityMins: 30, waterIntakeLiters: 2.1, screenTimeHours: 5.2, academicWorkload: 6 },
    { daysAgo: 14, mood: 'neutral', moodScore: 6, stress: 5, anxiety: 5, energy: 6, motivation: 6, sleepHours: 6.9, socialLevel: 'moderate', physicalActivityMins: 20, waterIntakeLiters: 1.9, screenTimeHours: 6.1, academicWorkload: 6 },
    { daysAgo: 13, mood: 'calm', moodScore: 7, stress: 4, anxiety: 4, energy: 7, motivation: 7, sleepHours: 7.5, socialLevel: 'high', physicalActivityMins: 35, waterIntakeLiters: 2.3, screenTimeHours: 5.0, academicWorkload: 5 },
    { daysAgo: 12, mood: 'happy', moodScore: 8, stress: 3, anxiety: 3, energy: 8, motivation: 8, sleepHours: 8.0, socialLevel: 'high', physicalActivityMins: 50, waterIntakeLiters: 2.5, screenTimeHours: 4.4, academicWorkload: 4 },
    { daysAgo: 11, mood: 'calm', moodScore: 8, stress: 4, anxiety: 3, energy: 7, motivation: 8, sleepHours: 7.7, socialLevel: 'moderate', physicalActivityMins: 35, waterIntakeLiters: 2.2, screenTimeHours: 5.1, academicWorkload: 5 },
    { daysAgo: 10, mood: 'neutral', moodScore: 6, stress: 6, anxiety: 5, energy: 6, motivation: 6, sleepHours: 6.8, socialLevel: 'low', physicalActivityMins: 25, waterIntakeLiters: 1.8, screenTimeHours: 6.4, academicWorkload: 7 },
    { daysAgo: 9, mood: 'anxious', moodScore: 5, stress: 7, anxiety: 7, energy: 5, motivation: 6, sleepHours: 6.1, socialLevel: 'low', physicalActivityMins: 15, waterIntakeLiters: 1.6, screenTimeHours: 7.2, academicWorkload: 8 },
    { daysAgo: 8, mood: 'calm', moodScore: 7, stress: 5, anxiety: 4, energy: 7, motivation: 7, sleepHours: 7.4, socialLevel: 'moderate', physicalActivityMins: 40, waterIntakeLiters: 2.2, screenTimeHours: 5.4, academicWorkload: 6 },
    { daysAgo: 7, mood: 'happy', moodScore: 8, stress: 4, anxiety: 3, energy: 8, motivation: 8, sleepHours: 7.9, socialLevel: 'high', physicalActivityMins: 45, waterIntakeLiters: 2.4, screenTimeHours: 4.9, academicWorkload: 5 },
    { daysAgo: 6, mood: 'neutral', moodScore: 6, stress: 5, anxiety: 5, energy: 6, motivation: 7, sleepHours: 7.1, socialLevel: 'moderate', physicalActivityMins: 30, waterIntakeLiters: 2.0, screenTimeHours: 5.8, academicWorkload: 6 },
    { daysAgo: 5, mood: 'neutral', moodScore: 6, stress: 6, anxiety: 6, energy: 5, motivation: 6, sleepHours: 6.5, socialLevel: 'low', physicalActivityMins: 20, waterIntakeLiters: 1.7, screenTimeHours: 6.8, academicWorkload: 7 },
    { daysAgo: 4, mood: 'sad', moodScore: 5, stress: 7, anxiety: 6, energy: 5, motivation: 5, sleepHours: 6.0, socialLevel: 'low', physicalActivityMins: 15, waterIntakeLiters: 1.5, screenTimeHours: 7.5, academicWorkload: 8 },
    { daysAgo: 3, mood: 'anxious', moodScore: 4, stress: 7, anxiety: 7, energy: 4, motivation: 5, sleepHours: 5.8, socialLevel: 'isolated', physicalActivityMins: 10, waterIntakeLiters: 1.4, screenTimeHours: 8.1, academicWorkload: 8 },
    { daysAgo: 2, mood: 'anxious', moodScore: 4, stress: 8, anxiety: 8, energy: 4, motivation: 4, sleepHours: 5.6, socialLevel: 'isolated', physicalActivityMins: 10, waterIntakeLiters: 1.4, screenTimeHours: 8.4, academicWorkload: 9 },
    { daysAgo: 1, mood: 'overwhelmed', moodScore: 3, stress: 8, anxiety: 8, energy: 3, motivation: 4, sleepHours: 5.5, socialLevel: 'low', physicalActivityMins: 12, waterIntakeLiters: 1.3, screenTimeHours: 8.2, academicWorkload: 9 },
  ];

  const checkIns: CheckInEntry[] = rawDays.map((item, idx) => {
    const { date, timestamp } = daysAgoIso(item.daysAgo, 21);
    return {
      id: `chk-${idx + 1}`,
      date,
      timestamp,
      ...item,
    };
  });

  const j1Time = daysAgoIso(4, 22);
  const j2Time = daysAgoIso(1, 22);

  const journals: JournalEntry[] = [
    {
      id: 'jrn-1',
      date: j1Time.date,
      timestamp: j1Time.timestamp,
      mode: 'reflection',
      prompt: 'What felt heaviest today, and what gave you even 5% relief?',
      content:
        'Spent most of the evening debugging our Distributed Systems lab while trying to prep for Friday’s Cognitive Neuro seminar. Studying alone in my dorm made the deadline feel twice as large, though grabbing tea with Sam for 20 minutes helped me breathe again.',
      analysis: {
        sentimentScore: -0.28,
        primaryEmotion: 'Academic Pressure',
        stressLevel: 68,
        burnoutIndicator: 54,
        detectedSignals: [
          {
            label: 'Academic Pressure',
            intensity: 76,
            evidence: 'Distributed Systems lab + Cognitive Neuro seminar overlap',
          },
          {
            label: 'Loneliness',
            intensity: 48,
            evidence: 'Studying alone in dorm amplified perceived load',
          },
          {
            label: 'Positive Coping',
            intensity: 62,
            evidence: '20-minute tea break with Sam lowered overwhelm',
          },
        ],
        thoughtPatterns: ['Catastrophizing under isolation', 'Task-switching fatigue'],
        insightSummary:
          'Social support appears to improve your mood even during heavy coursework blocks.',
        recommendedAction:
          'Move tomorrow’s lab review to a shared library table for 45 minutes.',
        crisisFlag: false,
        crisisSeverity: 'none',
      },
    },
    {
      id: 'jrn-2',
      date: j2Time.date,
      timestamp: j2Time.timestamp,
      mode: 'text',
      content:
        'Slept around 5.5 hours again because I kept checking Canvas updates past 1 AM. My shoulders feel tight all day and I keep thinking if I fall behind on this project I’ll ruin my whole semester GPA. I skipped my run because there’s just no time.',
      analysis: {
        sentimentScore: -0.62,
        primaryEmotion: 'Overwhelmed & Exhausted',
        stressLevel: 81,
        burnoutIndicator: 74,
        detectedSignals: [
          {
            label: 'Academic Pressure',
            intensity: 88,
            evidence: 'Checking Canvas past 1 AM and worrying about semester GPA',
          },
          {
            label: 'Burnout Signs',
            intensity: 74,
            evidence: 'Physical tension, skipped movement, cumulative 5.5h sleep',
          },
          {
            label: 'Anxiety',
            intensity: 79,
            evidence: 'All-or-nothing worry about ruining the entire semester',
          },
        ],
        thoughtPatterns: ['All-or-Nothing Thinking', 'Catastrophizing'],
        insightSummary:
          'Your journal indicates increasing academic stress compounded by 3 nights of sleep restriction.',
        recommendedAction:
          'Use a 15-minute reset walk and set a hard 11:45 PM screen cutoff tonight.',
        crisisFlag: false,
        crisisSeverity: 'none',
      },
    },
  ];

  const baseline = computePersonalBaseline(checkIns);
  const prediction = computeDistressPrediction(checkIns, journals, baseline);
  prediction.aiSummary =
    'Your distress risk is elevated primarily due to a 26% sleep reduction below your 7.4h personal baseline, late-night screen exposure, and high midterm workload—not a permanent decline. Restoring even one 7.5h sleep night and 20 minutes of movement shifts your 7-day forecast back toward Moderate-Low risk.';
  prediction.interventions = [
    'Anchor tonight’s sleep window by silencing coursework notifications at 11:30 PM.',
    'Replace 1 hour of solo dorm screen scrolling with a 20-minute outdoor walk.',
    'Reframe GPA all-or-nothing thoughts with a realistic single-assignment milestone.',
  ];

  const forecast = computeBurnoutForecast(checkIns, prediction);
  const digitalTwin = computeDigitalTwin(checkIns, baseline);
  const insights = computeBehavioralInsights(checkIns, journals);

  const coachMessages: CoachMessage[] = [
    {
      id: 'msg-1',
      role: 'assistant',
      timestamp: daysAgoIso(0, 9).timestamp,
      content:
        "Good morning, Maya. I noticed your sleep dipped to 5.5 hours over the last three nights while your Distributed Systems workload spiked. That kind of sleep debt naturally makes normal deadlines feel heavier. How is your energy feeling right now, and would you like to unpack what's weighing on you most today?",
      suggestedFollowUps: [
        'Help me calm down before my lab deadline',
        'Why is my burnout risk elevated?',
        'Give me a 2-minute CBT thought reframe',
      ],
    },
  ];

  return {
    user: {
      id: 'usr-maya-01',
      name: overrides?.name || 'Maya Chen',
      email: overrides?.email || 'maya.chen@stanford.edu',
      university: overrides?.university || 'Pacific Coast University',
      major: overrides?.major || 'Computer Science & Cognitive Science',
      year: overrides?.year || 'Junior · Class of 2027',
      avatarUrl: '/src/assets/images/student_avatar_maya_1795083044741.jpg',
      joinedDate: daysAgoIso(45).date,
    },
    checkIns,
    journals,
    prediction,
    forecast,
    baseline,
    digitalTwin,
    insights,
    coachMessages,
    settings: {
      theme: 'light',
      dailyReminderTime: '20:30',
      predictiveAlertsEnabled: true,
      baselineSensitivity: 'high',
      shareAnonymizedCampusTrends: true,
      voiceTranscriptionEnabled: true,
      emergencyContact: {
        name: 'Elena Chen (Sister)',
        relation: 'Family · Primary Support',
        phone: '+1 (415) 555-0192',
      },
    },
    crisisAlertActive: false,
  };
}
