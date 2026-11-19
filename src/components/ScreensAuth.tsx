import React, { useState } from 'react';
import {
  ArrowRight,
  BrainCircuit,
  Lock,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
  TrendingUp,
} from 'lucide-react';
import { AppState, ScreenId } from '../types/mindguard';

interface ThemeToggleProp {
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

interface SplashScreenProps extends ThemeToggleProp {
  onNavigate: (screen: ScreenId) => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onNavigate,
  theme = 'light',
  onToggleTheme,
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between p-6 md:p-12">
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between gap-4">
        <span className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">
          MindGuard AI
        </span>
        <div className="flex items-center gap-2">
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label="Toggle dark mode"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          )}
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="min-h-[44px] px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors whitespace-nowrap"
          >
            Return to Workspace
          </button>
        </div>
      </div>

      <div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-8">
        <div className="lg:col-span-6 space-y-6">
          <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
            Proactive Mental Wellness · Explainable AI
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-50 leading-[1.12]">
            Predicting distress before it becomes a crisis.
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
            Designed for university students and young adults. MindGuard AI learns your personal sleep, mood, and academic rhythm to surface early burnout signals with transparent explanations.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigate('onboarding')}
              className="min-h-[48px] inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 transition-colors whitespace-nowrap"
            >
              Start Guided Tour
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('auth')}
              className="min-h-[48px] inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              Sign In / Create Account
            </button>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-sky-100 via-teal-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">
            {!imgError ? (
              <img
                src="/src/assets/images/mindguard_hero_calm_1795083043878.jpg"
                alt="MindGuard AI calm biometric glass sculpture"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center">
                <ShieldCheck className="h-12 w-12 text-teal-600 dark:text-teal-400 mb-3" />
                <p className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
                  MindGuard Calm Telemetry
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl w-full mx-auto flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-800 pt-6 text-xs text-slate-500 dark:text-slate-400">
        <span>Built for iOS, Android & Web · Non-Diagnostic Early Support</span>
        <span>Personal Baseline Calibration · Crisis Escalation Ready</span>
      </div>
    </div>
  );
};

interface OnboardingScreenProps extends ThemeToggleProp {
  onNavigate: (screen: ScreenId) => void;
}

const ONBOARDING_STEPS = [
  {
    title: 'Personal Baseline, Never Peer Comparison',
    subtitle: '01. Adaptive Baseline Model',
    description:
      'Instead of comparing you against generic averages, MindGuard learns your own normal sleep duration, stress response, and social cadence—detecting subtle -20% shifts days before burnout hits.',
    icon: TrendingUp,
    metricTitle: 'Normal Sleep: 7.4h → Current: 5.5h',
    metricNote: '-26% personal deviation flagged early',
  },
  {
    title: 'Explainable AI You Can Actually Trust',
    subtitle: '02. Transparent SHAP Attribution',
    description:
      'Every distress probability comes with an explicit breakdown of why it moved—such as sleep debt, late-night screen exposure, or midterm journal sentiment—plus a What-If recovery simulator.',
    icon: BrainCircuit,
    metricTitle: 'Distress Risk = 74% · Confidence 91%',
    metricNote: '+35% Sleep Reduction · +25% Academic Load',
  },
  {
    title: 'Empathetic CBT Coach & Instant Crisis Safety',
    subtitle: '03. Human-Centered Support',
    description:
      'Journal by text or voice, receive CBT-inspired grounding guidance tailored to your Digital Twin, and rely on automatic crisis detection that surfaces immediate human support when needed.',
    icon: ShieldCheck,
    metricTitle: '30-Second Check-In · 7-Day Burnout Forecast',
    metricNote: 'Private, encrypted student wellness companion',
  },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onNavigate,
  theme = 'light',
  onToggleTheme,
}) => {
  const [stepIdx, setStepIdx] = useState(0);
  const step = ONBOARDING_STEPS[stepIdx];
  const Icon = step.icon;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between p-6 md:p-12">
      <div className="max-w-3xl w-full mx-auto flex items-center justify-between">
        <span className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
          MindGuard AI
        </span>
        <div className="flex items-center gap-2">
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label="Toggle dark mode"
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          )}
          <button
            type="button"
            onClick={() => onNavigate('auth')}
            className="min-h-[44px] px-3 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            Skip to Sign In
          </button>
        </div>
      </div>

      <div className="max-w-3xl w-full mx-auto my-8 rounded-3xl border border-slate-200 bg-white p-6 md:p-10 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-medium text-teal-700 dark:text-teal-400">
            {step.subtitle}
          </span>
          <div className="flex items-center gap-2">
            {ONBOARDING_STEPS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Step ${idx + 1}`}
                onClick={() => setStepIdx(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === stepIdx
                    ? 'w-8 bg-teal-600 dark:bg-teal-400'
                    : 'w-2 bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500/15 to-blue-500/15 text-teal-700 dark:text-teal-300">
          <Icon className="h-7 w-7" />
        </div>

        <h2 className="font-display text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-50 mb-4">
          {step.title}
        </h2>
        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
          {step.description}
        </p>

        <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
            {step.metricTitle}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">{step.metricNote}</span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            disabled={stepIdx === 0}
            onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
            className="min-h-[44px] rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Back
          </button>

          {stepIdx < ONBOARDING_STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStepIdx((i) => i + 1)}
              className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate('auth')}
              className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-500"
            >
              Create or Access Account
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="max-w-3xl w-full mx-auto text-center text-xs text-slate-500 dark:text-slate-400">
        MindGuard AI provides supportive behavioral awareness and does not replace clinical diagnosis.
      </div>
    </div>
  );
};

interface AuthScreenProps extends ThemeToggleProp {
  onAuthSuccess: (state: AppState, userId: string) => void;
  onNavigate: (screen: ScreenId) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onAuthSuccess,
  onNavigate,
  theme = 'light',
  onToggleTheme,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [university, setUniversity] = useState('');
  const [major, setMajor] = useState('');
  const [year, setYear] = useState('Sophomore');
  const [targetSleepHours, setTargetSleepHours] = useState(7.5);
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const body =
        mode === 'login'
          ? { email, password }
          : {
              name,
              email,
              password,
              university,
              major,
              year,
              targetSleepHours,
              theme,
              emergencyContact: emergencyName.trim()
                ? {
                    name: emergencyName.trim(),
                    relation: emergencyRelation.trim() || 'Trusted Support',
                    phone: emergencyPhone.trim(),
                  }
                : undefined,
            };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Authentication failed.');
        setLoading(false);
        return;
      }
      onAuthSuccess(data.state, data.userId);
    } catch {
      setError('Unable to reach server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demo: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Demo login failed.');
      } else {
        onAuthSuccess(data.state, data.userId);
      }
    } catch {
      setError('Connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center p-6">
      <div className="max-w-lg w-full mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigate('splash')}
            className="font-display text-xl font-bold text-slate-900 dark:text-slate-50"
          >
            MindGuard AI
          </button>
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label="Toggle dark mode"
              className="min-h-[40px] inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-3.5 w-3.5" /> Light
                </>
              ) : (
                <>
                  <Moon className="h-3.5 w-3.5" /> Dark
                </>
              )}
            </button>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 dark:border-slate-800 dark:bg-slate-900 space-y-5">
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError('');
              }}
              className={`min-h-[40px] rounded-lg text-sm font-medium transition-colors ${
                mode === 'signup'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-50'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Create Account
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`min-h-[40px] rounded-lg text-sm font-medium transition-colors ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-50'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Sign In
            </button>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Set up your own personal profile. Nothing is pre-filled or assumed for you—your check-ins and baseline start fresh.
                </p>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      University or School
                    </label>
                    <input
                      type="text"
                      required
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      placeholder="e.g., UCLA"
                      className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Major / Field of Study
                    </label>
                    <input
                      type="text"
                      required
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      placeholder="e.g., Psychology"
                      className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Academic Year
                    </label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    >
                      <option value="Freshman">Freshman</option>
                      <option value="Sophomore">Sophomore</option>
                      <option value="Junior">Junior</option>
                      <option value="Senior">Senior</option>
                      <option value="Graduate Student">Graduate Student</option>
                      <option value="Young Professional">Young Professional</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Your Normal Sleep Goal ({targetSleepHours.toFixed(1)}h)
                    </label>
                    <input
                      type="range"
                      min={5.5}
                      max={9.5}
                      step={0.5}
                      value={targetSleepHours}
                      onChange={(e) => setTargetSleepHours(Number(e.target.value))}
                      className="w-full mt-3"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create or enter your password"
                className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 focus:border-teal-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            {mode === 'signup' && (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Trusted Emergency Contact (Optional — you can edit anytime in Settings)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <input
                    type="text"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    placeholder="Contact name"
                    className="min-h-[40px] rounded-xl border border-slate-200 bg-white px-3 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                  <input
                    type="text"
                    value={emergencyRelation}
                    onChange={(e) => setEmergencyRelation(e.target.value)}
                    placeholder="Relation"
                    className="min-h-[40px] rounded-xl border border-slate-200 bg-white px-3 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                  <input
                    type="tel"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="Phone number"
                    className="min-h-[40px] rounded-xl border border-slate-200 bg-white px-3 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-teal-600 dark:hover:bg-teal-500 transition-colors"
            >
              {loading
                ? 'Setting up...'
                : mode === 'login'
                  ? 'Sign In to My Account'
                  : 'Create My Personal Account'}
            </button>
          </form>

          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
            <span className="mx-3 shrink-0 text-xs text-slate-400">or explore sample data</span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={handleDemoLogin}
            className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50/70 px-4 py-2.5 text-sm font-medium text-teal-800 hover:bg-teal-100 dark:border-teal-900/60 dark:bg-teal-950/40 dark:text-teal-300 dark:hover:bg-teal-950/70 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            Explore Sample Demo Account (Maya Chen)
          </button>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <Lock className="h-3.5 w-3.5" />
            <span>Your personal profile · Private encrypted session</span>
          </div>
        </div>
      </div>
    </div>
  );
};
