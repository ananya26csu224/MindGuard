import React, { useState } from 'react';
import {
  Activity,
  Brain,
  Clock,
  Fingerprint,
  Moon,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { AppState, InsightCardItem } from '../types/mindguard';
import { BaselineComparisonBars } from './Charts';

interface InsightsScreenProps {
  state: AppState;
}

export const InsightsScreen: React.FC<InsightsScreenProps> = ({ state }) => {
  const { insights, baseline, digitalTwin } = state;
  const [filter, setFilter] = useState<'All' | InsightCardItem['category']>('All');

  const categories: Array<'All' | InsightCardItem['category']> = [
    'All',
    'Sleep',
    'Movement',
    'Digital Habits',
    'Social',
    'Academics',
  ];

  const filtered =
    filter === 'All' ? insights : insights.filter((i) => i.category === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-50">
            AI Insights & Wellness Digital Twin
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Personalized behavioral correlations and individual baseline deviations
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={`min-h-[36px] rounded-lg px-3 text-xs font-medium transition-colors whitespace-nowrap ${
                filter === cat
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-50'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Wellness Digital Twin + Personalized Baseline Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
                <Fingerprint className="h-4 w-4" />
                Wellness Digital Twin · {digitalTwin.learningConfidence}% Accuracy Fit
              </p>
              <h2 className="font-display text-xl font-bold text-slate-900 dark:text-slate-50">
                {digitalTwin.archetypeName}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {digitalTwin.emotionalCycleSummary}
              </p>
            </div>

            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-900">
              <img
                src="/src/assets/images/digital_twin_emblem_1795083044915.jpg"
                alt="Digital Twin biometric representation"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-teal-500" />
                Chronotype & Focus Peak
              </span>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                {digitalTwin.chronotype}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Moon className="h-3.5 w-3.5 text-indigo-500" />
                Sleep Sensitivity
              </span>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                {digitalTwin.sleepSensitivity}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-slate-100 dark:border-slate-800 pt-4">
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 mb-2">
                <Zap className="h-3.5 w-3.5 text-indigo-500" />
                Learned Stress Triggers
              </p>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                {digitalTwin.topStressTriggers.map((t, idx) => (
                  <li key={idx}>• {t}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 mb-2">
                <ShieldCheck className="h-3.5 w-3.5 text-teal-500" />
                Verified Protective Habits
              </p>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                {digitalTwin.topProtectiveHabits.map((h, idx) => (
                  <li key={idx}>• {h}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Personalized Baseline Model */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4">
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5" />
              Personal Baseline Model ({baseline.calibratedDays} days)
            </p>
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50 mt-0.5">
              Your Current Deviations
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Compared strictly against your own historical norm—never other users
            </p>
          </div>
          {baseline.metrics.length > 0 ? (
            <BaselineComparisonBars metrics={baseline.metrics} />
          ) : (
            <div className="flex h-44 items-center justify-center text-center text-xs text-slate-500 dark:text-slate-400">
              Your sleep goal is anchored at {baseline.sleepHours}h/night. Log check-ins to track live personal deviations.
            </div>
          )}
        </div>
      </section>

      {/* Smart Behavioral Insights Grid */}
      {filtered.length === 0 ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900 space-y-2">
          <p className="font-display text-base font-semibold text-slate-900 dark:text-slate-50">
            Insights Unlock After 2+ Daily Check-Ins
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            As you record your sleep, movement, screen time, and mood, MindGuard discovers statistically grounded correlations unique to you.
          </p>
        </section>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <article
              key={item.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between gap-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-500 dark:text-slate-400">
                    {item.category} · Pattern Discovery
                  </span>
                  <span
                    className={`font-mono font-semibold tabular-nums ${
                      item.impactDirection === 'positive'
                        ? 'text-teal-600 dark:text-teal-400'
                        : 'text-indigo-600 dark:text-indigo-400'
                    }`}
                  >
                    {item.correlationStat}
                  </span>
                </div>
                <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50">
                  {item.headline}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.explanation}
                </p>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex items-start gap-2 text-xs text-slate-700 dark:text-slate-200">
                <Brain className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <span>
                  <span className="font-semibold">Action: </span>
                  {item.actionableStep}
                </span>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
};
