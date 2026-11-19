import React, { useMemo, useState } from 'react';
import { RefreshCw, ShieldAlert, Sliders, TrendingUp } from 'lucide-react';
import { AppState } from '../types/mindguard';
import { computeDistressPrediction } from '../lib/xaiEngine';
import { BurnoutForecastChart, ProgressRing, ShapWaterfallChart } from './Charts';

interface RiskPredictionScreenProps {
  state: AppState;
  onStateUpdate: (nextState: AppState) => void;
}

export const RiskPredictionScreen: React.FC<RiskPredictionScreenProps> = ({
  state,
  onStateUpdate,
}) => {
  const { prediction, checkIns, journals, baseline } = state;
  const latest = checkIns[checkIns.length - 1];

  const [simSleep, setSimSleep] = useState<number>(latest?.sleepHours ?? baseline.sleepHours);
  const [simActivity, setSimActivity] = useState<number>(
    latest?.physicalActivityMins ?? 25
  );
  const [simScreen, setSimScreen] = useState<number>(latest?.screenTimeHours ?? 5.5);
  const [simWorkload, setSimWorkload] = useState<number>(
    latest?.academicWorkload ?? 5
  );

  const [refreshingAI, setRefreshingAI] = useState(false);
  const [error, setError] = useState('');

  const simulated = useMemo(() => {
    return computeDistressPrediction(checkIns, journals, baseline, {
      sleepHours: simSleep,
      physicalActivityMins: simActivity,
      screenTimeHours: simScreen,
      academicWorkload: simWorkload,
    });
  }, [checkIns, journals, baseline, simSleep, simActivity, simScreen, simWorkload]);

  const riskDelta = simulated.riskProbability - prediction.riskProbability;

  const handleExplainWithAI = async () => {
    setRefreshingAI(true);
    setError('');
    try {
      const res = await fetch('/api/predict/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-mindguard-user': state.user.id,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not refresh Gemini XAI summary.');
        return;
      }
      onStateUpdate(data.state);
    } catch {
      setError('Unable to reach Gemini XAI service.');
    } finally {
      setRefreshingAI(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-50">
            Explainable Distress Prediction (XAI)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            SHAP-style additive risk attribution across sleep, sentiment, movement, and workload
          </p>
        </div>

        <button
          type="button"
          disabled={refreshingAI}
          onClick={handleExplainWithAI}
          className="min-h-[44px] inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 whitespace-nowrap"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshingAI ? 'animate-spin' : ''}`} />
          {refreshingAI ? 'Synthesizing XAI Brief...' : 'Refresh Gemini XAI Summary'}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between gap-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Distress Probability
              </p>
              <h2 className="font-display text-xl font-bold text-slate-900 dark:text-slate-50 mt-0.5">
                {prediction.riskTier}
              </h2>
            </div>
            <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
              Confidence {prediction.confidenceScore}%
            </span>
          </div>

          <div className="flex items-center justify-center py-2">
            <ProgressRing
              value={prediction.riskProbability}
              size={156}
              strokeWidth={12}
              colorClass={
                prediction.riskTier === 'High Risk'
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : prediction.riskTier === 'Moderate Risk'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-teal-600 dark:text-teal-400'
              }
              label={`${prediction.riskProbability}%`}
              sublabel="Distress Risk"
            />
          </div>

          <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4">
            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
              {prediction.aiSummary}
            </p>
            {prediction.interventions && prediction.interventions.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Recommended 24h De-Escalation Plan
                </p>
                {prediction.interventions.map((step, idx) => (
                  <p key={idx} className="text-xs text-slate-600 dark:text-slate-300">
                    {idx + 1}. {step}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-5">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50">
              Why This Prediction Occurred (Feature Attribution)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Weighted percentage contribution of each behavioral factor compared to your baseline
            </p>
          </div>
          {prediction.factors.length > 0 ? (
            <ShapWaterfallChart factors={prediction.factors} />
          ) : (
            <div className="flex h-48 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
              Log your first Daily Check-In to generate personalized SHAP risk factors.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <Sliders className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              What-If Intervention Simulator
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Adjust tonight’s sleep, movement, or screen load to preview real-time XAI risk reduction
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 px-4 py-2.5">
            <div className="text-right">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Simulated Risk</p>
              <p className="font-mono text-lg font-bold tabular-nums text-slate-900 dark:text-slate-50">
                {simulated.riskProbability}%{' '}
                <span
                  className={`text-xs ${
                    riskDelta <= 0
                      ? 'text-teal-600 dark:text-teal-400'
                      : 'text-indigo-600 dark:text-indigo-400'
                  }`}
                >
                  ({riskDelta > 0 ? `+${riskDelta}%` : `${riskDelta}%`})
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSimSleep(7.5);
                setSimActivity(35);
                setSimScreen(5.0);
                setSimWorkload(latest?.academicWorkload ?? 5);
              }}
              className="min-h-[38px] rounded-lg bg-teal-600 px-3 text-xs font-semibold text-white hover:bg-teal-500 whitespace-nowrap"
            >
              Test Optimal Night
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300">Sleep Tonight</span>
              <span className="font-mono font-semibold tabular-nums">{simSleep.toFixed(1)}h</span>
            </div>
            <input
              type="range"
              min={4}
              max={10}
              step={0.5}
              value={simSleep}
              onChange={(e) => setSimSleep(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300">Movement</span>
              <span className="font-mono font-semibold tabular-nums">{simActivity}m</span>
            </div>
            <input
              type="range"
              min={0}
              max={90}
              step={5}
              value={simActivity}
              onChange={(e) => setSimActivity(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300">Screen Time</span>
              <span className="font-mono font-semibold tabular-nums">{simScreen.toFixed(1)}h</span>
            </div>
            <input
              type="range"
              min={2}
              max={12}
              step={0.5}
              value={simScreen}
              onChange={(e) => setSimScreen(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-300">Academic Load</span>
              <span className="font-mono font-semibold tabular-nums">{simWorkload}/10</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={simWorkload}
              onChange={(e) => setSimWorkload(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export const BurnoutForecastScreen: React.FC<{ state: AppState }> = ({ state }) => {
  const { forecast } = state;
  const [activeMetric, setActiveMetric] = useState<'burnout' | 'stress' | 'mood'>('burnout');

  const tomorrow = forecast[1];
  const threeDay = forecast[3];
  const nextWeek = forecast[forecast.length - 1];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-50">
            Student Burnout Forecast
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Predictive 7-day mental wellness trajectory across Tomorrow, +3 Days, and Next Week
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {(
            [
              { id: 'burnout', label: 'Burnout Risk' },
              { id: 'stress', label: 'Stress Trend' },
              { id: 'mood', label: 'Mood Trend' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveMetric(tab.id)}
              className={`min-h-[38px] rounded-lg px-3.5 text-xs font-medium transition-colors whitespace-nowrap ${
                activeMetric === tab.id
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-50'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {forecast.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900 space-y-2">
          <p className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
            Burnout Forecast Awaiting First Check-In
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Log at least one 30-second Daily Check-In to project Tomorrow, +3 Days, and Next Week trends.
          </p>
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: "Tomorrow's Mental State", item: tomorrow },
              { title: 'Next 3 Days Outlook', item: threeDay },
              { title: 'Next Week Trajectory', item: nextWeek },
            ].map(({ title, item }) =>
              item ? (
                <div
                  key={title}
                  className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-3"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{title}</span>
                    <span className="font-mono">{item.dayLabel}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 font-mono tabular-nums">
                    <div>
                      <p className="text-[11px] font-sans text-slate-400">Burnout</p>
                      <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                        {item.predictedBurnout}%
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-sans text-slate-400">Stress</p>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {item.predictedStress}%
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-sans text-slate-400">Mood</p>
                      <p className="text-lg font-bold text-teal-600 dark:text-teal-400">
                        {item.predictedMood}%
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 pt-2.5">
                    {item.keyDriver}
                  </p>
                </div>
              ) : null
            )}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-indigo-500" />
                  7-Day Predictive Trajectory & Confidence Band
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Shaded corridor indicates upper/lower uncertainty bounds if current habits continue unchanged
                </p>
              </div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <ShieldAlert className="h-3.5 w-3.5 text-teal-500" />
                Early Prevention Window Active
              </span>
            </div>

            <BurnoutForecastChart forecast={forecast} activeMetric={activeMetric} />
          </section>
        </>
      )}
    </div>
  );
};
