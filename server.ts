import 'dotenv/config';
import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { createEmptyUserAppState, createInitialAppState } from './src/lib/seedData.ts';
import {
  computeBehavioralInsights,
  computeBurnoutForecast,
  computeDigitalTwin,
  computeDistressPrediction,
  computePersonalBaseline,
} from './src/lib/xaiEngine.ts';
import {
  AppState,
  CheckInEntry,
  CoachMessage,
  JournalAnalysis,
  JournalEntry,
  UserSettings,
} from './src/types/mindguard.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'mindguard-db.json');

// Fast low-latency model alias for near-instant interactive AI responses
const FAST_AI_MODEL = 'gemini-3.1-flash-lite';

interface StoredAccount {
  id: string;
  email: string;
  passwordHash: string;
  state: AppState;
}

interface DatabaseSchema {
  activeUserId: string;
  accounts: Record<string, StoredAccount>;
}

function hashPassword(password: string, salt?: string): string {
  const usedSalt = salt || crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, usedSalt, 32).toString('hex');
  return `${usedSalt}:${derived}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, key] = stored.split(':');
  if (!salt || !key) return false;
  const derived = crypto.scryptSync(password, salt, 32).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(derived, 'hex'));
}

function loadDb(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    const initialState = createInitialAppState();
    const initialDb: DatabaseSchema = {
      activeUserId: initialState.user.id,
      accounts: {
        [initialState.user.id]: {
          id: initialState.user.id,
          email: initialState.user.email,
          passwordHash: hashPassword('mindguard-demo'),
          state: initialState,
        },
      },
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialDb, null, 2));
    return initialDb;
  }
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw) as DatabaseSchema;
}

function saveDb(db: DatabaseSchema): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function recalculateState(state: AppState): AppState {
  const preferredSleep = state.baseline?.sleepHours || 7.5;
  const baseline = computePersonalBaseline(state.checkIns, preferredSleep);
  const prediction = computeDistressPrediction(
    state.checkIns,
    state.journals,
    baseline
  );
  if (state.prediction?.aiSummary && state.checkIns.length > 0) {
    prediction.aiSummary = state.prediction.aiSummary;
  }
  if (state.prediction?.interventions && state.checkIns.length > 0) {
    prediction.interventions = state.prediction.interventions;
  }
  const forecast = computeBurnoutForecast(state.checkIns, prediction);
  const digitalTwin = computeDigitalTwin(state.checkIns, baseline);
  const insights = computeBehavioralInsights(state.checkIns, state.journals);

  return {
    ...state,
    baseline,
    prediction,
    forecast,
    digitalTwin,
    insights,
  };
}

function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured in environment secrets. Please set it in Settings > Secrets.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function formatGeminiError(err: unknown): { status: number; message: string } {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes('API_KEY_INVALID') || msg.includes('PERMISSION_DENIED') || msg.includes('403')) {
    return {
      status: 403,
      message: 'Gemini API key permission issue. Please verify GEMINI_API_KEY in Settings > Secrets.',
    };
  }
  if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('429')) {
    return {
      status: 429,
      message: 'Gemini API quota temporarily reached. Please retry in a moment.',
    };
  }
  return { status: 500, message: msg || 'AI service request failed.' };
}

function detectSevereCrisisKeywords(text: string): { flagged: boolean; reason?: string } {
  const lower = text.toLowerCase();
  const patterns = [
    /kill myself/,
    /end my life/,
    /want to die/,
    /suicid/,
    /self[- ]?harm/,
    /hurt myself/,
    /no reason to live/,
    /better off dead/,
    /can't go on anymore/,
  ];
  for (const rx of patterns) {
    if (rx.test(lower)) {
      return {
        flagged: true,
        reason: 'Severe distress or self-harm language detected in text.',
      };
    }
  }
  return { flagged: false };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  const getActiveAccount = (db: DatabaseSchema, req: Request): StoredAccount => {
    const requestedUserId = (req.headers['x-mindguard-user'] as string) || db.activeUserId;
    return db.accounts[requestedUserId] || Object.values(db.accounts)[0];
  };

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true, service: 'MindGuard AI API' });
  });

  app.get('/api/state', (req: Request, res: Response) => {
    const db = loadDb();
    const account = getActiveAccount(db, req);
    res.json(account.state);
  });

  // Auth: Sign Up — creates a clean, user-owned account with NO assumed/fake history
  app.post('/api/auth/signup', (req: Request, res: Response) => {
    const {
      name,
      email,
      password,
      university,
      major,
      year,
      targetSleepHours,
      emergencyContact,
      theme,
    } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    if (!university || !major) {
      return res
        .status(400)
        .json({ error: 'Please provide your university/school and field of study.' });
    }

    const db = loadDb();
    const existing = Object.values(db.accounts).find(
      (a) => a.email.toLowerCase() === String(email).toLowerCase()
    );
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const id = `usr-${crypto.randomUUID().slice(0, 8)}`;
    const newState = createEmptyUserAppState({
      id,
      name: String(name),
      email: String(email),
      university: String(university),
      major: String(major),
      year: year ? String(year) : 'Undergraduate',
      targetSleepHours: targetSleepHours ? Number(targetSleepHours) : 7.5,
      emergencyContact: emergencyContact?.name
        ? {
            name: String(emergencyContact.name),
            relation: String(emergencyContact.relation || 'Trusted Contact'),
            phone: String(emergencyContact.phone || ''),
          }
        : undefined,
      theme: theme === 'dark' ? 'dark' : 'light',
    });

    db.accounts[id] = {
      id,
      email: newState.user.email,
      passwordHash: hashPassword(String(password)),
      state: newState,
    };
    db.activeUserId = id;
    saveDb(db);
    return res.json({ userId: id, state: newState });
  });

  // Auth: Login
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password, demo } = req.body || {};
    const db = loadDb();
    if (demo) {
      const demoAcc = db.accounts['usr-maya-01'] || Object.values(db.accounts)[0];
      db.activeUserId = demoAcc.id;
      saveDb(db);
      return res.json({ userId: demoAcc.id, state: demoAcc.state });
    }
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const account = Object.values(db.accounts).find(
      (a) => a.email.toLowerCase() === String(email).toLowerCase()
    );
    if (!account || !verifyPassword(String(password), account.passwordHash)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    db.activeUserId = account.id;
    saveDb(db);
    return res.json({ userId: account.id, state: account.state });
  });

  // Daily Check-In submission
  app.post('/api/checkin', (req: Request, res: Response) => {
    const payload = req.body;
    if (!payload || !payload.mood) {
      return res.status(400).json({ error: 'Mood selection is required.' });
    }
    const db = loadDb();
    const account = getActiveAccount(db, req);
    const today = new Date().toISOString().slice(0, 10);

    const entry: CheckInEntry = {
      id: `chk-${Date.now()}`,
      date: today,
      timestamp: new Date().toISOString(),
      mood: payload.mood,
      moodScore: Number(payload.moodScore ?? 6),
      stress: Number(payload.stress ?? 5),
      anxiety: Number(payload.anxiety ?? 5),
      energy: Number(payload.energy ?? 6),
      motivation: Number(payload.motivation ?? 6),
      sleepHours: Number(payload.sleepHours ?? 7.0),
      socialLevel: payload.socialLevel || 'moderate',
      physicalActivityMins: Number(payload.physicalActivityMins ?? 20),
      waterIntakeLiters: Number(payload.waterIntakeLiters ?? 2.0),
      screenTimeHours: Number(payload.screenTimeHours ?? 5.5),
      academicWorkload: Number(payload.academicWorkload ?? 6),
      note: payload.note ? String(payload.note) : undefined,
    };

    const existingIdx = account.state.checkIns.findIndex((c) => c.date === today);
    if (existingIdx >= 0) {
      account.state.checkIns[existingIdx] = entry;
    } else {
      account.state.checkIns.push(entry);
    }

    account.state = recalculateState(account.state);
    account.state.prediction.aiSummary =
      account.state.prediction.riskTier === 'High Risk'
        ? `Today's check-in shifted your distress risk to ${account.state.prediction.riskProbability}%. Primary driver: ${account.state.prediction.factors[0]?.label || 'baseline deviation'}.`
        : account.state.prediction.riskTier === 'Moderate Risk'
          ? `Your behavioral signals place you at Moderate Risk (${account.state.prediction.riskProbability}%). Protecting tonight's sleep window will stabilize tomorrow's forecast.`
          : `You are currently within your healthy personal baseline (${account.state.prediction.riskProbability}% risk). Keep maintaining your sleep and movement anchors.`;

    saveDb(db);
    return res.json(account.state);
  });

  // Fast Gemini AI Journal / Voice Note / Daily Reflection Analysis
  app.post('/api/journal/analyze', async (req: Request, res: Response) => {
    const { content, mode = 'text', prompt, durationSec } = req.body || {};
    if (!content || String(content).trim().length < 8) {
      return res
        .status(400)
        .json({ error: 'Please write or record at least a few words to analyze.' });
    }

    const text = String(content).trim();
    const safetyPrecheck = detectSevereCrisisKeywords(text);

    try {
      const ai = getGenAI();
      const db = loadDb();
      const account = getActiveAccount(db, req);
      const latestSleep =
        account.state.checkIns[account.state.checkIns.length - 1]?.sleepHours ?? 'not logged';

      const response = await ai.models.generateContent({
        model: FAST_AI_MODEL,
        contents: `Analyze this ${mode} journal reflection (${prompt ? `Prompt: "${prompt}". ` : ''}Baseline sleep: ${account.state.baseline.sleepHours}h, recent sleep: ${latestSleep}h):
"""${text}"""`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          systemInstruction:
            'You are MindGuard NLP. Return concise structured JSON: sentimentScore (-1 to 1), primaryEmotion (2-3 words), stressLevel (0-100), burnoutIndicator (0-100), detectedSignals (1-3 items from Anxiety, Loneliness, Academic Pressure, Social Stress, Burnout Signs, Emotional Exhaustion, Positive Coping), thoughtPatterns (1-2 concise items), insightSummary (1 crisp sentence), recommendedAction (1 short practical step), crisisFlag (true ONLY for self-harm/suicide/acute hopelessness), crisisSeverity (none|elevated|critical). Never diagnose.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sentimentScore: { type: Type.NUMBER },
              primaryEmotion: { type: Type.STRING },
              stressLevel: { type: Type.INTEGER },
              burnoutIndicator: { type: Type.INTEGER },
              detectedSignals: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    intensity: { type: Type.INTEGER },
                    evidence: { type: Type.STRING },
                  },
                  required: ['label', 'intensity', 'evidence'],
                },
              },
              thoughtPatterns: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              insightSummary: { type: Type.STRING },
              recommendedAction: { type: Type.STRING },
              crisisFlag: { type: Type.BOOLEAN },
              crisisSeverity: { type: Type.STRING },
              crisisReason: { type: Type.STRING },
            },
            required: [
              'sentimentScore',
              'primaryEmotion',
              'stressLevel',
              'burnoutIndicator',
              'detectedSignals',
              'thoughtPatterns',
              'insightSummary',
              'recommendedAction',
              'crisisFlag',
              'crisisSeverity',
            ],
          },
        },
      });

      const parsed = JSON.parse((response.text || '{}').trim()) as JournalAnalysis;
      if (safetyPrecheck.flagged) {
        parsed.crisisFlag = true;
        parsed.crisisSeverity = 'critical';
        parsed.crisisReason = safetyPrecheck.reason;
      }

      const newEntry: JournalEntry = {
        id: `jrn-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        timestamp: new Date().toISOString(),
        mode,
        prompt,
        content: text,
        durationSec,
        analysis: parsed,
      };

      account.state.journals.push(newEntry);
      if (parsed.crisisFlag) {
        account.state.crisisAlertActive = true;
        account.state.crisisAlertReason =
          parsed.crisisReason ||
          'Severe emotional distress indicators detected in your recent journal entry.';
      }
      account.state = recalculateState(account.state);
      saveDb(db);

      return res.json({ entry: newEntry, state: account.state });
    } catch (err) {
      const formatted = formatGeminiError(err);
      return res.status(formatted.status).json({ error: formatted.message });
    }
  });

  // Fast Gemini AI Explainable Risk Narrative
  app.post('/api/predict/explain', async (req: Request, res: Response) => {
    try {
      const ai = getGenAI();
      const db = loadDb();
      const account = getActiveAccount(db, req);
      const { prediction, baseline } = account.state;
      const latestSleep =
        account.state.checkIns[account.state.checkIns.length - 1]?.sleepHours ?? 'none';

      const response = await ai.models.generateContent({
        model: FAST_AI_MODEL,
        contents: `Distress Risk: ${prediction.riskProbability}% (${prediction.riskTier}, Confidence ${prediction.confidenceScore}%). Sleep Baseline: ${baseline.sleepHours}h vs Current: ${latestSleep}h. Factors: ${prediction.factors
          .slice(0, 4)
          .map((f) => `${f.direction === 'risk' ? '+' : '-'}${f.contributionPct}% ${f.label}`)
          .join(', ')}.`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          systemInstruction:
            'Provide a concise 2-sentence plain-language XAI behavioral summary and 3 short 24-hour student interventions (no medical diagnosis). Return JSON.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              aiSummary: { type: Type.STRING },
              interventions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['aiSummary', 'interventions'],
          },
        },
      });

      const parsed = JSON.parse((response.text || '{}').trim());
      account.state.prediction.aiSummary = parsed.aiSummary;
      account.state.prediction.interventions = parsed.interventions;
      saveDb(db);

      return res.json({ state: account.state });
    } catch (err) {
      const formatted = formatGeminiError(err);
      return res.status(formatted.status).json({ error: formatted.message });
    }
  });

  // Fast Gemini AI Empathetic CBT Coach
  app.post('/api/coach/chat', async (req: Request, res: Response) => {
    const { message } = req.body || {};
    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    const userText = String(message).trim();
    const safetyPrecheck = detectSevereCrisisKeywords(userText);

    try {
      const ai = getGenAI();
      const db = loadDb();
      const account = getActiveAccount(db, req);
      const state = account.state;
      const latestCheckIn = state.checkIns[state.checkIns.length - 1];

      const userMsg: CoachMessage = {
        id: `msg-${Date.now()}-u`,
        role: 'user',
        content: userText,
        timestamp: new Date().toISOString(),
        crisisTriggered: safetyPrecheck.flagged,
      };
      state.coachMessages.push(userMsg);

      const historyContext = state.coachMessages
        .slice(-6)
        .map((m) => `${m.role === 'user' ? 'Student' : 'Coach'}: ${m.content}`)
        .join('\n');

      const response = await ai.models.generateContent({
        model: FAST_AI_MODEL,
        contents: `${historyContext}\n\nReply warmly and concisely to the student's latest message.`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          systemInstruction: `You are MindGuard Coach, a warm, human-sounding CBT-inspired wellness companion for ${state.user.name} (${state.user.major}). Never sound robotic or diagnose.
Snapshot: Wellness ${state.prediction.wellnessScore}/100, Risk ${state.prediction.riskProbability}% (${state.prediction.riskTier}), Sleep norm ${state.baseline.sleepHours}h (recent: ${latestCheckIn ? `${latestCheckIn.sleepHours}h` : 'not logged yet'}).
Keep reply crisp (2-4 sentences + 1 practical grounding/CBT step). Set crisisTriggered=true only for self-harm/suicide/hopelessness. Return JSON.`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: { type: Type.STRING },
              crisisTriggered: { type: Type.BOOLEAN },
              crisisReason: { type: Type.STRING },
              suggestedFollowUps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['reply', 'crisisTriggered', 'suggestedFollowUps'],
          },
        },
      });

      const parsed = JSON.parse((response.text || '{}').trim());
      const crisis = Boolean(parsed.crisisTriggered || safetyPrecheck.flagged);

      const assistantMsg: CoachMessage = {
        id: `msg-${Date.now()}-a`,
        role: 'assistant',
        content: parsed.reply,
        timestamp: new Date().toISOString(),
        crisisTriggered: crisis,
        suggestedFollowUps: parsed.suggestedFollowUps?.slice(0, 3) || [],
      };
      state.coachMessages.push(assistantMsg);

      if (crisis) {
        state.crisisAlertActive = true;
        state.crisisAlertReason =
          parsed.crisisReason ||
          safetyPrecheck.reason ||
          'Severe distress indicators appeared during your Coach conversation.';
      }

      saveDb(db);
      return res.json({ message: assistantMsg, state });
    } catch (err) {
      const formatted = formatGeminiError(err);
      return res.status(formatted.status).json({ error: formatted.message });
    }
  });

  app.patch('/api/settings', (req: Request, res: Response) => {
    const db = loadDb();
    const account = getActiveAccount(db, req);
    const { settings, user, crisisAlertActive } = req.body || {};

    if (settings) {
      account.state.settings = {
        ...account.state.settings,
        ...(settings as Partial<UserSettings>),
        emergencyContact: {
          ...account.state.settings.emergencyContact,
          ...(settings.emergencyContact || {}),
        },
      };
    }
    if (user) {
      account.state.user = {
        ...account.state.user,
        ...user,
      };
    }
    if (typeof crisisAlertActive === 'boolean') {
      account.state.crisisAlertActive = crisisAlertActive;
      if (!crisisAlertActive) {
        account.state.crisisAlertReason = undefined;
      }
    }

    saveDb(db);
    return res.json(account.state);
  });

  app.post('/api/reset-demo', (req: Request, res: Response) => {
    const db = loadDb();
    const account = getActiveAccount(db, req);
    if (account.id === 'usr-maya-01') {
      const fresh = createInitialAppState();
      fresh.settings.theme = account.state.settings.theme;
      account.state = fresh;
    } else {
      const fresh = createEmptyUserAppState({
        id: account.id,
        name: account.state.user.name,
        email: account.state.user.email,
        university: account.state.user.university,
        major: account.state.user.major,
        year: account.state.user.year,
        targetSleepHours: account.state.baseline.sleepHours,
        emergencyContact: account.state.settings.emergencyContact,
        theme: account.state.settings.theme,
      });
      account.state = fresh;
    }
    saveDb(db);
    return res.json(account.state);
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MindGuard AI server listening on http://localhost:${PORT}`);
  });
}

startServer();
