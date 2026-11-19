import React, { useState } from 'react';
import {
  Cpu,
  Database,
  FolderTree,
  GitBranch,
  Layers,
  LayoutGrid,
  Palette,
  Presentation,
  Rocket,
  Server,
} from 'lucide-react';
import { ScreenId } from '../types/mindguard';

interface BlueprintProps {
  onNavigate: (screen: ScreenId) => void;
}

type SectionKey =
  | 'architecture'
  | 'schema'
  | 'flows'
  | 'ai_ml'
  | 'api_folder'
  | 'roadmap_design'
  | 'pitch';

export const BlueprintScreen: React.FC<BlueprintProps> = ({ onNavigate }) => {
  const [section, setSection] = useState<SectionKey>('architecture');

  const tabs: Array<{ id: SectionKey; label: string }> = [
    { id: 'architecture', label: '01–02. Architecture & DB' },
    { id: 'flows', label: '03–05. Flows, Screens & UI' },
    { id: 'ai_ml', label: '06–07. AI & ML Pipeline' },
    { id: 'api_folder', label: '08–11. API, Features & Tree' },
    { id: 'roadmap_design', label: '10–12. Roadmap & Figma' },
    { id: 'pitch', label: '13–14. Startup & Hackathon' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-50">
            MindGuard AI — Technical Blueprint & Pitch Deck
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Complete 14-deliverable architecture, ML workflow, API contracts, design system, and investor narrative
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="min-h-[40px] rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          Back to Live App
        </button>
      </div>

      {/* Section Switcher */}
      <div className="flex flex-wrap gap-1.5 rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-800">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSection(t.id)}
            className={`min-h-[38px] rounded-xl px-3.5 text-xs font-medium transition-colors whitespace-nowrap ${
              section === t.id
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-50'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {section === 'architecture' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h2 className="font-display text-lg font-semibold flex items-center gap-2">
              <Server className="h-5 w-5 text-teal-600" />
              01. Complete System Architecture
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Multi-tier mobile-first architecture built for sub-200ms check-in ingestion, asynchronous NLP sentiment scoring, and real-time SHAP explainability.
            </p>
            <div className="space-y-3 text-xs">
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4">
                <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  Client Tier (Flutter / React Native / Responsive Web)
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  Biometric/Firebase Auth token · Offline-first 30s Check-In queue · Native Microphone / Web Speech Voice Notes · Interactive SVG/Canvas XAI Charts.
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4">
                <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  API Gateway & Orchestration (Node.js + Express)
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  JWT Verification · Rate-limited REST endpoints · Crisis Keyword Pre-Screen (&lt;5ms) · Gemini 4 Hydrogen Structured JSON Gateway · Webhook Triggering.
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4">
                <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  ML Microservice & Data Tier (Python + MongoDB / Firestore)
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  FastAPI inference worker running Scikit-Learn Gradient Boosting + TensorFlow LSTM/GRU temporal forecaster + SHAP TreeExplainer + MongoDB time-series collections.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h2 className="font-display text-lg font-semibold flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              02. Production Database Schema (MongoDB / NoSQL)
            </h2>
            <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 font-mono text-[11px] leading-relaxed text-slate-200">
{`users: {
  _id, firebaseUid, name, email, university, major,
  emergencyContact: { name, relation, phone },
  baselineNorms: { sleepHours, stress, mood, activityMins, screenHours }
}

daily_checkins (Time-Series): {
  _id, userId, date, mood, moodScore, stress, anxiety,
  energy, motivation, sleepHours, socialLevel,
  physicalActivityMins, waterLiters, screenHours, academicWorkload
}

journals: {
  _id, userId, mode: 'text'|'voice'|'reflection', content,
  analysis: {
    sentimentScore, primaryEmotion, stressLevel, burnoutIndicator,
    detectedSignals: [{ label, intensity, evidence }],
    thoughtPatterns: [String], crisisFlag, crisisSeverity
  }
}

predictions_xai: {
  _id, userId, riskProbability, confidenceScore, riskTier,
  wellnessScore, shapFactors: [{ label, contributionPct, direction }],
  forecast7d: [{ dayLabel, burnout, stress, mood, ciLow, ciHigh }]
}`}
            </pre>
          </div>
        </div>
      )}

      {section === 'flows' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <h2 className="font-display text-base font-semibold flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-teal-600" />
              03. User Flow Architecture
            </h2>
            <ol className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <li>1. Splash → 3-Slide Value Onboarding → Firebase / Email Auth</li>
              <li>2. Baseline Calibration (Days 1–7) → Digital Twin initialization</li>
              <li>3. Daily Loop: 30s Check-In → Instant Risk & Forecast recompute</li>
              <li>4. Reflective Loop: Text/Voice Journal → Gemini NLP + Thought Patterns</li>
              <li>5. Prevention Loop: Moderate/High Risk → XAI Factor View + What-If Simulator → Empathetic CBT Coach</li>
              <li>6. Safety Interrupt: Crisis Signal → Immediate Support Screen (988 + Trusted Contact)</li>
            </ol>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <h2 className="font-display text-base font-semibold flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-blue-600" />
              04. Complete 14 Screen Inventory
            </h2>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {(
                [
                  ['1. Splash', 'splash'],
                  ['2. Onboarding', 'onboarding'],
                  ['3. Sign Up / Login', 'auth'],
                  ['4. AI Dashboard', 'dashboard'],
                  ['5. Daily Check-In', 'checkin'],
                  ['6. AI Journal', 'journal'],
                  ['7. AI Insights', 'insights'],
                  ['8. Risk Prediction', 'risk'],
                  ['9. Burnout Forecast', 'forecast'],
                  ['10. AI Coach', 'coach'],
                  ['11. Analytics', 'analytics'],
                  ['12. Profile', 'profile'],
                  ['13. Settings', 'settings'],
                  ['14. Emergency', 'emergency'],
                ] as Array<[string, ScreenId]>
              ).map(([label, target]) => (
                <button
                  key={target}
                  type="button"
                  onClick={() => onNavigate(target)}
                  className="text-left rounded-lg border border-slate-200 px-2.5 py-2 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <h2 className="font-display text-base font-semibold flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-600" />
              05. Core UI Component Library
            </h2>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li>• <strong>ProgressRing</strong>: SVG radial telemetry ring with tabular figures</li>
              <li>• <strong>MoodStressChart</strong>: Interactive multi-series spline & area graph</li>
              <li>• <strong>ShapWaterfallChart</strong>: Additive risk/protective factor bars</li>
              <li>• <strong>BurnoutForecastChart</strong>: Predictive line with uncertainty corridor</li>
              <li>• <strong>WellnessHeatmap</strong>: 56-day consistency intensity grid</li>
              <li>• <strong>BaselineComparisonBars</strong>: Personal norm vs current deviation rows</li>
              <li>• <strong>GroundingTimer</strong>: 4-7-8 vagal breathing guide</li>
            </ul>
          </div>
        </div>
      )}

      {section === 'ai_ml' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h2 className="font-display text-lg font-semibold flex items-center gap-2">
              <Cpu className="h-5 w-5 text-teal-600" />
              06. End-to-End AI Pipeline
            </h2>
            <ol className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <li className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3.5">
                <strong>1. Multimodal Ingestion:</strong> Structured Likert/continuous check-ins + unstructured text & Speech-to-Text journal transcripts.
              </li>
              <li className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3.5">
                <strong>2. Personal Baseline Normalization:</strong> Rolling 14-day Z-score & percentage deviation computed per student (e.g., sleep -26% from 7.4h personal norm).
              </li>
              <li className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3.5">
                <strong>3. Transformer NLP Layer:</strong> Gemini structured extraction of sentiment (-1..+1), cognitive distortions, academic pressure, and crisis flags.
              </li>
              <li className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3.5">
                <strong>4. Explainable Fusion Engine:</strong> Additive feature attribution (SHAP) translates latent risk scores into human-readable causal drivers.
              </li>
            </ol>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h2 className="font-display text-lg font-semibold flex items-center gap-2">
              <Cpu className="h-5 w-5 text-indigo-600" />
              07. ML Model Workflow & XAI Stack
            </h2>
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5">
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  Model 1 — Sentiment & Thought Pattern Classifier
                </p>
                <p>Fine-tuned transformer + Gemini structured schema for cognitive distortions (Catastrophizing, All-or-Nothing) and campus stressors.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5">
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  Model 2 — Distress Risk Classifier (Scikit-Learn XGBoost / GBM)
                </p>
                <p>Predicts 72-hour distress probability using baseline-normalized deltas; calibrated with Platt scaling for honest confidence scores.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5">
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  Model 3 — 7-Day Burnout Forecaster (TensorFlow LSTM)
                </p>
                <p>Autoregressive sequence model outputting Tomorrow, +3d, and +7d Stress, Mood, and Burnout curves with confidence intervals.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5">
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  Model 4 — Explainable AI Layer (SHAP Values)
                </p>
                <p>Computes exact marginal contribution of each feature (e.g., +35% Sleep Reduction) and powers the real-time What-If Recovery Simulator.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {section === 'api_folder' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h2 className="font-display text-lg font-semibold flex items-center gap-2">
              <Server className="h-5 w-5 text-blue-600" />
              08–09. REST API Structure & Feature Matrix
            </h2>
            <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 font-mono text-[11px] leading-relaxed text-slate-200">
{`GET    /api/state            -> Hydrate user profile, baseline, twin & predictions
POST   /api/auth/signup      -> Create student account & initialize baseline
POST   /api/auth/login       -> Authenticate session or demo student workspace
POST   /api/checkin          -> Log 30s telemetry & recompute XAI + 7d forecast
POST   /api/journal/analyze  -> Gemini NLP sentiment, signals & crisis guard
POST   /api/predict/explain  -> Generate plain-language XAI behavioral brief
POST   /api/coach/chat       -> Context-aware CBT coaching + crisis escalation
PATCH  /api/settings         -> Theme, emergency contact, alert thresholds
POST   /api/reset-demo       -> Restore 18-day student baseline dataset`}
            </pre>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h2 className="font-display text-lg font-semibold flex items-center gap-2">
              <FolderTree className="h-5 w-5 text-teal-600" />
              11. Production Folder Structure
            </h2>
            <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 font-mono text-[11px] leading-relaxed text-slate-200">
{`mindguard-ai/
├── server.ts                  # Express API + Vite SSR/SPA + Gemini SDK
├── data/mindguard-db.json     # Persistent telemetry & account store
├── src/
│   ├── types/mindguard.ts     # Strict TypeScript domain contracts
│   ├── lib/
│   │   ├── xaiEngine.ts       # Baseline deviations, SHAP & 7d forecast
│   │   └── seedData.ts        # 18-day longitudinal student dataset
│   ├── components/
│   │   ├── Charts.tsx         # ProgressRing, SHAP, Forecast, Heatmap
│   │   ├── ScreensAuth.tsx    # Splash, Onboarding, Sign Up / Login
│   │   ├── ScreenDashboard.tsx
│   │   ├── ScreenCheckIn.tsx
│   │   ├── ScreenJournal.tsx
│   │   ├── ScreenInsightsTwin.tsx
│   │   ├── ScreenRiskForecast.tsx
│   │   ├── ScreenCoach.tsx
│   │   ├── ScreenAnalyticsProfile.tsx
│   │   ├── ScreenEmergency.tsx
│   │   └── ScreenBlueprint.tsx
│   └── App.tsx                # Responsive Sidebar + Mobile Thumb Nav`}
            </pre>
          </div>
        </div>
      )}

      {section === 'roadmap_design' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h2 className="font-display text-lg font-semibold flex items-center gap-2">
              <Rocket className="h-5 w-5 text-indigo-600" />
              10. Phased Development Roadmap
            </h2>
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3.5">
                <strong>Phase 1 (Weeks 1–4 · MVP):</strong> 30s Check-in, Personal Baseline engine, Gemini Journal NLP, Crisis 988 guard, Dashboard & Forecast.
              </div>
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3.5">
                <strong>Phase 2 (Weeks 5–8 · Passive Signals):</strong> Apple HealthKit / Google Fit sleep & HRV sync, Canvas/Calendar exam deadline load ingestion.
              </div>
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3.5">
                <strong>Phase 3 (Months 3–6 · Campus Pilot):</strong> University counseling warm-handoff portal, HIPAA/FERPA compliance audit, longitudinal federated learning.
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h2 className="font-display text-lg font-semibold flex items-center gap-2">
              <Palette className="h-5 w-5 text-teal-600" />
              12. Figma Style Design Guidelines
            </h2>
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <p>
                <strong>Color System (60-30-10):</strong> Canvas <code className="font-mono">#F8FAFC</code> / <code className="font-mono">#020617</code> · Surfaces <code className="font-mono">#FFFFFF</code> / <code className="font-mono">#0F172A</code> · Accents Teal <code className="font-mono">#0D9488</code>, Cobalt <code className="font-mono">#2563EB</code>, Indigo <code className="font-mono">#6366F1</code>.
              </p>
              <p>
                <strong>Typography Scale:</strong> Display <code className="font-mono">Plus Jakarta Sans</code> (600/700), Body <code className="font-mono">DM Sans</code> (15px, 1.6 leading), Telemetry <code className="font-mono">JetBrains Mono</code> with <code className="font-mono">tabular-nums</code>.
              </p>
              <p>
                <strong>Geometry & Ergonomics:</strong> Cards <code className="font-mono">24px</code> radius, buttons <code className="font-mono">12px</code> radius, minimum <code className="font-mono">44×44px</code> mobile touch targets, hairline <code className="font-mono">1px</code> borders without nested card clutter.
              </p>
            </div>
          </div>
        </div>
      )}

      {section === 'pitch' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h2 className="font-display text-lg font-semibold flex items-center gap-2">
              <Rocket className="h-5 w-5 text-teal-600" />
              13. Investor Startup Pitch Narrative
            </h2>
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                <strong>Problem:</strong> 60%+ of university students experience overwhelming anxiety or burnout, yet campus counseling centers face 3-week waitlists and existing mood apps only react <em>after</em> a breakdown.
              </p>
              <p>
                <strong>Solution:</strong> MindGuard AI is an early-warning mental wellness radar. By calibrating a Wellness Digital Twin around each student’s personal baseline, it forecasts burnout 3–7 days ahead and explains <em>why</em> using transparent XAI.
              </p>
              <p>
                <strong>Business Model:</strong> B2B2C Campus Wellness Licensing ($6–$12/student/year for universities to reduce dropouts and triage counseling waitlists) + Freemium Pro Insights for young professionals.
              </p>
              <p>
                <strong>Moat:</strong> Longitudinal individualized baseline + multi-modal NLP/behavioral SHAP explainability + non-diagnostic ethical safety escalation.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h2 className="font-display text-lg font-semibold flex items-center gap-2">
              <Presentation className="h-5 w-5 text-indigo-600" />
              14. Hackathon Presentation Outline (5-Min Demo)
            </h2>
            <ol className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li><strong>0:00–0:45 Hook:</strong> Why reactive mood trackers fail during finals week. Introduce Maya’s 72-hour burnout warning.</li>
              <li><strong>0:45–1:45 Live 30s Check-In & Personal Baseline:</strong> Show how logging 5.5h sleep vs Maya’s 7.4h norm triggers a -26% personal deviation.</li>
              <li><strong>1:45–2:45 Explainable AI & What-If Simulator:</strong> Show +35% Sleep Reduction SHAP breakdown and simulate recovering +2h sleep.</li>
              <li><strong>2:45–3:45 Gemini NLP Journal & Empathetic Coach:</strong> Submit a real stressful entry, show instant thought-pattern detection & CBT coaching.</li>
              <li><strong>3:45–4:30 Crisis Safety Demo:</strong> Show instant escalation to 988 & trusted contact without clinical diagnosis.</li>
              <li><strong>4:30–5:00 Impact & Scalability:</strong> Campus pilot architecture, privacy-first design, Q&A.</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};
