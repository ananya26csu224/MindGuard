import React, { useMemo, useState } from 'react';
import { Check, Clock, Minus, Plus, Sparkles } from 'lucide-react';
import {
  AppState,
  MOOD_OPTIONS,
  MoodId,
  SocialLevel,
} from '../types/mindguard';
import { computeDistressPrediction } from '../lib/xaiEngine';

interface CheckInScreenProps {
  state: AppState;
  onStateUpdate: (nextState: AppState) => void;
  onDone: () => void;
}

export const CheckInScreen: React.FC<CheckInScreenProps> = ({
  state,
  onStateUpdate,
  onDone,
}) => {
  const latest = state.checkIns[state.checkIns.length - 1];

  const [mood, setMood] = useState<MoodId>(latest?.mood ?? 'calm');
  const [stress, setStress] = useState<number>(latest?.stress ?? 5);
  const [anxiety, setAnxiety] = useState<number>(latest?.anxiety ?? 5);
  const [energy, setEnergy] = useState<number>(latest?.energy ?? 6);
  const [motivation, setMotivation] = useState<number>(latest?.motivation ?? 6);
  const [sleepHours, setSleepHours] = useState<number>(latest?.sleepHours ?? 7.0);
  const [socialLevel, setSocialLevel] = useState<SocialLevel>(
    latest?.socialLevel ?? 'moderate'
  );
  const [physicalActivityMins, setPhysicalActivityMins] = useState<number>(
    latest?.physicalActivityMins ?? 25
  );
  const [waterIntakeLiters, setWaterIntakeLiters] = useState<number>(
    latest?.waterIntakeLiters ?? 2.0
  );
  const [screenTimeHours, setScreenTimeHours] = useState<number>(
    latest?.screenTimeHours ?? 6.0
  );
  const [academicWorkload, setAcademicWorkload] = useState<number>(
    latest?.academicWorkload ?? 6
  );
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);
  const [error, setError] = useState('');

  const selectedMoodObj = MOOD_OPTIONS.find((m) => m.id === mood) || MOOD_OPTIONS[1];

  // Live instant preview of XAI Distress Risk before submitting
  const livePreview = useMemo(() => {
    return computeDistressPrediction(state.checkIns, state.journals, state.baseline, {
      mood,
      moodScore: selectedMoodObj.valence,
      stress,
      anxiety,
      energy,
      motivation,
      sleepHours,
      socialLevel,
      physicalActivityMins,
      waterIntakeLiters,
      screenTimeHours,
      academicWorkload,
    });
  }, [
    state.checkIns,
    state.journals,
    state.baseline,
    mood,
    selectedMoodObj.valence,
    stress,
    anxiety,
    energy,
    motivation,
    sleepHours,
    socialLevel,
    physicalActivityMins,
    waterIntakeLiters,
    screenTimeHours,
    academicWorkload,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-mindguard-user': state.user.id,
        },
        body: JSON.stringify({
          mood,
          moodScore: selectedMoodObj.valence,
          stress,
          anxiety,
          energy,
          motivation,
          sleepHours,
          socialLevel,
          physicalActivityMins,
          waterIntakeLiters,
          screenTimeHours,
          academicWorkload,
          note,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not save check-in.');
        return;
      }
      onStateUpdate(data);
      setSavedBanner(true);
      setTimeout(() => {
        setSavedBanner(false);
        onDone();
      }, 900);
    } catch {
      setError('Network error while saving check-in.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-50">
            Daily Check-In
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
            <Clock className="h-3.5 w-3.5" />
            Designed to complete in under 30 seconds · Calibrates your personal baseline
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900 flex items-center gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400">Live Risk Preview</span>
          <span className="font-mono text-base font-bold tabular-nums text-indigo-600 dark:text-indigo-400">
            {livePreview.riskProbability}%
          </span>
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
            {livePreview.riskTier}
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      )}

      {savedBanner && (
        <div className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800 dark:border-teal-900/50 dark:bg-teal-950/40 dark:text-teal-300 flex items-center gap-2">
          <Check className="h-4 w-4" />
          Check-in logged. Updating your baseline, forecast, and Digital Twin...
        </div>
      )}

      {/* 1. Mood Selector */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50 mb-4">
          1. How are you feeling right now?
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {MOOD_OPTIONS.map((opt) => {
            const active = mood === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setMood(opt.id)}
                className={`min-h-[76px] flex flex-col items-center justify-center gap-1.5 rounded-2xl border p-3 transition-all ${
                  active
                    ? 'border-teal-600 bg-teal-50/80 text-teal-900 dark:border-teal-400 dark:bg-teal-950/40 dark:text-teal-100'
                    : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <span className="text-2xl" role="img" aria-label={opt.label}>
                  {opt.emoji}
                </span>
                <span className="text-xs font-medium">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Emotional & Cognitive Sliders */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-5">
          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50">
            2. Mental & Emotional Load
          </h2>

          {[
            { label: 'Stress Level', val: stress, set: setStress, hint: 'Calm → Tense' },
            { label: 'Anxiety Level', val: anxiety, set: setAnxiety, hint: 'Grounded → Restless' },
            { label: 'Physical Energy', val: energy, set: setEnergy, hint: 'Drained → Restored' },
            { label: 'Motivation', val: motivation, set: setMotivation, hint: 'Stuck → Focused' },
            {
              label: 'Academic Workload',
              val: academicWorkload,
              set: setAcademicWorkload,
              hint: 'Light → Heavy Deadlines',
            },
          ].map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {item.label}
                </span>
                <span className="font-mono text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                  {item.val}/10{' '}
                  <span className="font-sans text-xs font-normal text-slate-400">
                    · {item.hint}
                  </span>
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={item.val}
                onChange={(e) => item.set(Number(e.target.value))}
                className="w-full h-2 rounded-lg bg-slate-200 dark:bg-slate-800 cursor-pointer"
              />
            </div>
          ))}
        </div>

        {/* 3. Rapid Behavioral Signals */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-5">
          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50">
            3. Daily Behavioral Signals
          </h2>

          {/* Sleep Hours Stepper */}
          <div className="flex items-center justify-between gap-4 py-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Sleep Last Night
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your baseline: {state.baseline.sleepHours} hrs
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Decrease sleep"
                onClick={() => setSleepHours((v) => Math.max(2, Math.round((v - 0.5) * 10) / 10))}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-16 text-center font-mono text-sm font-semibold tabular-nums">
                {sleepHours.toFixed(1)}h
              </span>
              <button
                type="button"
                aria-label="Increase sleep"
                onClick={() => setSleepHours((v) => Math.min(12, Math.round((v + 0.5) * 10) / 10))}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Physical Activity */}
          <div className="flex items-center justify-between gap-4 py-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Physical Activity
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Walk, gym, run, or cycling
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Decrease activity"
                onClick={() => setPhysicalActivityMins((v) => Math.max(0, v - 10))}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-16 text-center font-mono text-sm font-semibold tabular-nums">
                {physicalActivityMins}m
              </span>
              <button
                type="button"
                aria-label="Increase activity"
                onClick={() => setPhysicalActivityMins((v) => Math.min(180, v + 10))}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Water & Screen Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Water Intake (Liters)
              </label>
              <input
                type="number"
                step="0.2"
                min="0"
                max="6"
                value={waterIntakeLiters}
                onChange={(e) => setWaterIntakeLiters(Number(e.target.value))}
                className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3 font-mono text-sm tabular-nums dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Screen Time (Hours)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="16"
                value={screenTimeHours}
                onChange={(e) => setScreenTimeHours(Number(e.target.value))}
                className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3 font-mono text-sm tabular-nums dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </div>

          {/* Social Interaction */}
          <div>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
              Social Interaction Level
            </p>
            <div className="grid grid-cols-4 gap-2">
              {(['isolated', 'low', 'moderate', 'high'] as SocialLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSocialLevel(lvl)}
                  className={`min-h-[44px] rounded-xl border text-xs font-medium capitalize transition-colors ${
                    socialLevel === lvl
                      ? 'border-teal-600 bg-teal-50 text-teal-800 dark:border-teal-400 dark:bg-teal-950/40 dark:text-teal-200'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Quick Note */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Quick Context Tag (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Midterm tomorrow, library study with Sam"
              className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3.5 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
        </div>
      </section>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onDone}
          className="min-h-[48px] rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="min-h-[48px] inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-teal-600 dark:hover:bg-teal-500 transition-colors"
        >
          <Sparkles className="h-4 w-4" />
          {saving ? 'Updating Baseline...' : 'Save Check-In & Update Prediction'}
        </button>
      </div>
    </form>
  );
};
