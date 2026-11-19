import React from 'react';
import {
  Activity,
  ArrowUpRight,
  Brain,
  CalendarClock,
  MessageSquareHeart,
  Moon,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { AppState, ScreenId } from '../types/mindguard';
import { MoodStressChart, ProgressRing, ShapWaterfallChart } from './Charts';

interface ScreenDashboardProps {
  state: AppState;
  onNavigate: (screen: ScreenId) => void;
}

export const DashboardScreen: React.FC<ScreenDashboardProps> = ({ state, onNavigate }) => {
  const { prediction, checkIns, forecast, baseline, digitalTwin, insights, user } = state;
  const latest = checkIns[checkIns.length - 1];
  const tomorrow = forecast[1] || forecast[0];
  const nextWeek = forecast[forecast.length - 1];

  const riskBadgeColor =
    prediction.riskTier === 'High Risk'
      ? 'text-rose-700 dark:text-rose-300'
      : prediction.riskTier === 'Moderate Risk'
        ? 'text-amber-700 dark:text-amber-300'
        : 'text-teal-700 dark:text-teal-300';

  const ringColor =
    prediction.wellnessScore >= 70
      ? 'text-teal-600 dark:text-teal-400'
      : prediction.wellnessScore >= 50
        ? 'text-blue-600 dark:text-blue-400'
        : 'text-indigo-600 dark:text-indigo-400';

  const sleepMetric = baseline.metrics.find((m) => m.id === 'sleep');

  return (
    <div className="space-y-6">
      {/* Hero Summary Band */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>{user.university}</span>
              <span aria-hidden="true">·</span>
              <span>
                {baseline.calibratedDays > 0
                  ? `${baseline.calibratedDays}-Day Personal Baseline`
                  : 'Baseline Calibration Ready'}
              </span>
              <span aria-hidden="true">·</span>
              <span className={`font-semibold ${riskBadgeColor}`}>{prediction.riskTier}</span>
            </div>

            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
              {user.name.split(' ')[0]}.
            </h1>

            <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              {prediction.aiSummary ||
                `Your current distress probability is ${prediction.riskProbability}% with ${prediction.confidenceScore}% model confidence.`}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => onNavigate('checkin')}
                className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 transition-colors whitespace-nowrap"
              >
                30s Daily Check-In
                <ArrowUpRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('journal')}
                className="min-h-[44px] inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
              >
                Write Reflection
              </button>
              <button
                type="button"
                onClick={() => onNavigate('coach')}
                className="min-h-[44px] inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
              >
                <MessageSquareHeart className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                Talk to Coach
              </button>
            </div>
          </div>

          {/* Primary Wellness Score Ring + Pillar Readouts */}
          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-row items-center justify-between gap-6 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 pt-6 lg:pt-0 lg:pl-8">
            <div className="flex flex-col items-center text-center shrink-0">
              <ProgressRing
                value={prediction.wellnessScore}
                size={132}
                strokeWidth={10}
                colorClass={ringColor}
                label={`${prediction.wellnessScore}`}
                sublabel="Wellness / 100"
              />
            </div>

            <div className="w-full space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Emotional Stability</span>
                <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                  {prediction.emotionalStabilityScore}/100
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Stress Load</span>
                <span className="font-mono font-semibold tabular-nums text-indigo-600 dark:text-indigo-400">
                  {prediction.stressScore}/100
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Burnout Risk</span>
                <span className="font-mono font-semibold tabular-nums text-blue-600 dark:text-blue-400">
                  {prediction.burnoutRiskScore}/100
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Sleep Health</span>
                <span className="font-mono font-semibold tabular-nums text-teal-600 dark:text-teal-400">
                  {prediction.sleepHealthScore}/100
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Status Cards: Current Status, Weekly Change, Prediction for Next 7 Days */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => onNavigate('risk')}
          className="text-left rounded-2xl border border-slate-200 bg-white p-5 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Current Status
            </span>
            <ShieldAlert className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-50">
              {prediction.riskProbability}%
            </span>
            <span className={`text-xs font-semibold ${riskBadgeColor}`}>
              {prediction.riskTier}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {prediction.factors.length > 0
              ? `Distress probability · ${prediction.confidenceScore}% XAI confidence · Top driver: ${prediction.factors[0]?.label}`
              : 'Log a check-in or journal entry to activate XAI attribution'}
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('analytics')}
          className="text-left rounded-2xl border border-slate-200 bg-white p-5 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Weekly Change
            </span>
            {prediction.weeklyWellnessDelta >= 0 ? (
              <TrendingUp className="h-4 w-4 text-teal-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-amber-500" />
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-50">
              {prediction.weeklyWellnessDelta > 0
                ? `+${prediction.weeklyWellnessDelta}%`
                : `${prediction.weeklyWellnessDelta}%`}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              vs 7-day norm
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {latest && sleepMetric
              ? `Sleep deviation: ${sleepMetric.deviationPct}% (${latest.sleepHours}h vs ${baseline.sleepHours}h personal norm)`
              : `Your target sleep baseline is ${baseline.sleepHours}h/night`}
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('forecast')}
          className="text-left rounded-2xl border border-slate-200 bg-white p-5 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Prediction for Next 7 Days
            </span>
            <CalendarClock className="h-4 w-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-50">
              {nextWeek?.predictedBurnout ?? prediction.burnoutRiskScore}%
            </span>
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
              Projected Burnout
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {tomorrow
              ? `Tomorrow mood ${tomorrow.predictedMood}% · ${nextWeek?.keyDriver}`
              : 'Log your first daily check-in to generate a 7-day forecast'}
          </p>
        </button>
      </section>

      {/* Main Analytics Split: Mood Trend Graph + Explainable Risk Factors */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50">
                14-Day Mood, Stress & Sleep Trajectory
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hover or tap any day to inspect behavioral correlation
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('analytics')}
              className="text-xs font-medium text-teal-700 hover:underline dark:text-teal-400 whitespace-nowrap"
            >
              Full Analytics
            </button>
          </div>
          <MoodStressChart checkIns={checkIns} />
        </div>

        <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50">
                Explainable Risk Drivers
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                SHAP-style attribution vs your personal baseline
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('risk')}
              className="text-xs font-medium text-teal-700 hover:underline dark:text-teal-400 whitespace-nowrap"
            >
              Simulate Fix
            </button>
          </div>
          {prediction.factors.length > 0 ? (
            <ShapWaterfallChart factors={prediction.factors.slice(0, 4)} />
          ) : (
            <div className="flex h-48 flex-col items-center justify-center text-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <p>No behavioral drivers computed yet.</p>
              <button
                type="button"
                onClick={() => onNavigate('checkin')}
                className="min-h-[40px] rounded-xl bg-slate-900 px-4 text-xs font-semibold text-white dark:bg-teal-600"
              >
                Log First Check-In
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Bottom Split: Wellness Digital Twin + Smart Behavioral Insight */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                Wellness Digital Twin · {digitalTwin.learningConfidence}% Model Fit
              </p>
              <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
                {digitalTwin.archetypeName}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {digitalTwin.emotionalCycleSummary}
              </p>
            </div>
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-900">
              <img
                src="/src/assets/images/digital_twin_emblem_1795083044915.jpg"
                alt="Wellness Digital Twin harmonic sphere"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                <Activity className="h-3.5 w-3.5 text-teal-500" />
                Peak Focus Window
              </span>
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {digitalTwin.peakProductiveWindow}
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                <Moon className="h-3.5 w-3.5 text-indigo-500" />
                Vulnerability Window
              </span>
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {digitalTwin.vulnerabilityWindow}
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <Brain className="h-4 w-4" />
                Top Behavioral Correlation
              </span>
              <button
                type="button"
                onClick={() => onNavigate('insights')}
                className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              >
                View insights
              </button>
            </div>
            {insights[0] ? (
              <>
                <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
                  {insights[0].headline}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {insights[0].explanation}
                </p>
              </>
            ) : (
              <>
                <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
                  Behavioral patterns unlock after 2+ check-ins
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  MindGuard correlates your own sleep, movement, screen exposure, and mood logs without relying on generic population assumptions.
                </p>
              </>
            )}
          </div>

          {insights[0] && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 pt-4 text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-200">
                Suggested micro-step: {insights[0].actionableStep}
              </span>
              <span className="font-mono font-semibold tabular-nums text-indigo-600 dark:text-indigo-400">
                {insights[0].correlationStat}
              </span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
