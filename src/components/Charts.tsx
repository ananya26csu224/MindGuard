import React, { useState } from 'react';
import {
  BaselineMetric,
  BurnoutForecastPoint,
  CheckInEntry,
  RiskFactor,
} from '../types/mindguard';

interface ProgressRingProps {
  value: number; // 0 - 100
  size?: number;
  strokeWidth?: number;
  colorClass?: string;
  trackClass?: string;
  label?: string;
  sublabel?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  size = 112,
  strokeWidth = 9,
  colorClass = 'text-teal-600 dark:text-teal-400',
  trackClass = 'text-slate-200 dark:text-slate-800',
  label,
  sublabel,
}) => {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className={trackClass}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${colorClass} transition-all duration-500 ease-out`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display text-2xl font-bold tracking-tight tabular-nums text-slate-900 dark:text-slate-50">
          {label ?? clamped}
        </span>
        {sublabel && (
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};

interface MoodStressChartProps {
  checkIns: CheckInEntry[];
}

export const MoodStressChart: React.FC<MoodStressChartProps> = ({ checkIns }) => {
  const data = checkIns.slice(-14);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="flex h-52 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
        Log your first daily check-in to visualize mood and stress trends.
      </div>
    );
  }

  const width = 640;
  const height = 220;
  const padL = 32;
  const padR = 16;
  const padT = 18;
  const padB = 30;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const xFor = (i: number) =>
    data.length === 1 ? padL + plotW / 2 : padL + (i / (data.length - 1)) * plotW;
  const yFor10 = (v: number) => padT + ((10 - Math.max(0, Math.min(10, v))) / 10) * plotH;

  const moodPoints = data.map((d, i) => `${xFor(i)},${yFor10(d.moodScore)}`).join(' ');
  const stressPoints = data.map((d, i) => `${xFor(i)},${yFor10(d.stress)}`).join(' ');
  const sleepPoints = data.map((d, i) => `${xFor(i)},${yFor10(d.sleepHours)}`).join(' ');

  const moodArea = `${xFor(0)},${padT + plotH} ${moodPoints} ${xFor(data.length - 1)},${padT + plotH}`;
  const activeIdx = hoverIdx !== null ? hoverIdx : data.length - 1;
  const activeItem = data[activeIdx];

  return (
    <div className="w-full">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-4 rounded-sm bg-teal-500" />
            Mood ({activeItem.moodScore}/10)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-4 rounded-sm bg-indigo-500" />
            Stress ({activeItem.stress}/10)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-4 border-t-2 border-dashed border-sky-500" />
            Sleep ({activeItem.sleepHours}h)
          </span>
        </div>
        <span className="font-mono text-[11px] tabular-nums text-slate-500 dark:text-slate-400">
          {activeItem.date}
        </span>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-52 w-full select-none">
          <defs>
            <linearGradient id="moodAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {[2, 4, 6, 8, 10].map((tick) => {
            const y = yFor10(tick);
            return (
              <g key={tick}>
                <line
                  x1={padL}
                  y1={y}
                  x2={width - padR}
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-800"
                  strokeDasharray="3 3"
                />
                <text
                  x={padL - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-slate-400 font-mono text-[10px] tabular-nums"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          <polygon points={moodArea} fill="url(#moodAreaGrad)" />

          <polyline
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="1.75"
            strokeDasharray="4 4"
            points={sleepPoints}
          />
          <polyline
            fill="none"
            stroke="#6366f1"
            strokeWidth="2.25"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={stressPoints}
          />
          <polyline
            fill="none"
            stroke="#0d9488"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={moodPoints}
          />

          {/* Interactive hover columns */}
          {data.map((d, i) => {
            const cx = xFor(i);
            const isSelected = i === activeIdx;
            const label = d.date.slice(5);
            return (
              <g key={d.id}>
                {isSelected && (
                  <line
                    x1={cx}
                    y1={padT}
                    x2={cx}
                    y2={padT + plotH}
                    stroke="currentColor"
                    className="text-slate-300 dark:text-slate-700"
                    strokeWidth="1"
                  />
                )}
                <circle
                  cx={cx}
                  cy={yFor10(d.moodScore)}
                  r={isSelected ? 4.5 : 2.5}
                  className="fill-teal-600 stroke-white dark:fill-teal-400 dark:stroke-slate-900"
                  strokeWidth="1.5"
                />
                <circle
                  cx={cx}
                  cy={yFor10(d.stress)}
                  r={isSelected ? 4.5 : 2.5}
                  className="fill-indigo-600 stroke-white dark:fill-indigo-400 dark:stroke-slate-900"
                  strokeWidth="1.5"
                />
                {(i === 0 || i === data.length - 1 || i % 3 === 0) && (
                  <text
                    x={cx}
                    y={height - 8}
                    textAnchor="middle"
                    className="fill-slate-400 font-mono text-[10px]"
                  >
                    {label}
                  </text>
                )}
                <rect
                  x={cx - plotW / (data.length * 2)}
                  y={padT}
                  width={plotW / data.length}
                  height={plotH}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoverIdx(i)}
                  onMouseLeave={() => setHoverIdx(null)}
                  onClick={() => setHoverIdx(i)}
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

interface BurnoutForecastChartProps {
  forecast: BurnoutForecastPoint[];
  activeMetric: 'burnout' | 'stress' | 'mood';
}

export const BurnoutForecastChart: React.FC<BurnoutForecastChartProps> = ({
  forecast,
  activeMetric,
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number>(forecast.length - 1);

  if (forecast.length === 0) return null;

  const width = 640;
  const height = 240;
  const padL = 36;
  const padR = 20;
  const padT = 20;
  const padB = 34;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const xFor = (i: number) =>
    forecast.length === 1 ? padL + plotW / 2 : padL + (i / (forecast.length - 1)) * plotW;
  const yFor100 = (v: number) => padT + ((100 - Math.max(0, Math.min(100, v))) / 100) * plotH;

  const getVal = (p: BurnoutForecastPoint) =>
    activeMetric === 'burnout'
      ? p.predictedBurnout
      : activeMetric === 'stress'
        ? p.predictedStress
        : p.predictedMood;

  const strokeHex =
    activeMetric === 'burnout'
      ? '#6366f1'
      : activeMetric === 'stress'
        ? '#2563eb'
        : '#0d9488';

  const linePoints = forecast.map((p, i) => `${xFor(i)},${yFor100(getVal(p))}`).join(' ');
  const bandPoly =
    activeMetric === 'burnout'
      ? [
          ...forecast.map((p, i) => `${xFor(i)},${yFor100(p.confidenceHigh)}`),
          ...[...forecast].reverse().map((p, idx) => {
            const origIdx = forecast.length - 1 - idx;
            return `${xFor(origIdx)},${yFor100(p.confidenceLow)}`;
          }),
        ].join(' ')
      : '';

  const activePoint = forecast[selectedIdx] || forecast[forecast.length - 1];

  return (
    <div className="w-full">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-medium text-slate-700 dark:text-slate-300">
          {activePoint.horizon} · {activePoint.keyDriver}
        </span>
        <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-slate-100">
          {getVal(activePoint)}% projected
        </span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full select-none">
        {[20, 40, 60, 80].map((tick) => {
          const y = yFor100(tick);
          return (
            <g key={tick}>
              <line
                x1={padL}
                y1={y}
                x2={width - padR}
                y2={y}
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-800"
                strokeDasharray="3 3"
              />
              <text
                x={padL - 8}
                y={y + 3}
                textAnchor="end"
                className="fill-slate-400 font-mono text-[10px] tabular-nums"
              >
                {tick}%
              </text>
            </g>
          );
        })}

        {bandPoly && <polygon points={bandPoly} fill={strokeHex} fillOpacity="0.12" />}

        <polyline
          fill="none"
          stroke={strokeHex}
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={linePoints}
        />

        {forecast.map((p, i) => {
          const cx = xFor(i);
          const cy = yFor100(getVal(p));
          const isActive = i === selectedIdx;
          return (
            <g
              key={p.horizon}
              className="cursor-pointer"
              onClick={() => setSelectedIdx(i)}
              onMouseEnter={() => setSelectedIdx(i)}
            >
              <circle
                cx={cx}
                cy={cy}
                r={isActive ? 6 : 4}
                fill={strokeHex}
                className="stroke-white dark:stroke-slate-900"
                strokeWidth="2"
              />
              <text
                x={cx}
                y={height - 10}
                textAnchor="middle"
                className={`font-mono text-[11px] ${
                  isActive
                    ? 'fill-slate-900 font-semibold dark:fill-slate-100'
                    : 'fill-slate-400'
                }`}
              >
                {p.dayLabel}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export const ShapWaterfallChart: React.FC<{ factors: RiskFactor[] }> = ({ factors }) => {
  return (
    <div className="space-y-3.5">
      {factors.map((f) => {
        const isRisk = f.direction === 'risk';
        const barWidth = Math.min(100, Math.max(8, f.contributionPct * 1.9));
        return (
          <div key={f.id} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <div className="min-w-0">
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {f.label}
                </span>
                <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                  {f.detail}
                </span>
              </div>
              <span
                className={`shrink-0 font-mono text-xs font-semibold tabular-nums ${
                  isRisk
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-teal-600 dark:text-teal-400'
                }`}
              >
                {isRisk ? '+' : '-'}
                {f.contributionPct}%
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isRisk
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                    : 'bg-gradient-to-r from-teal-500 to-emerald-500'
                }`}
                style={{ width: `${barWidth}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const BaselineComparisonBars: React.FC<{ metrics: BaselineMetric[] }> = ({ metrics }) => {
  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {metrics.map((m) => {
        const isAlert = m.status === 'alert';
        const isWatch = m.status === 'watch';
        const statusColor = isAlert
          ? 'text-rose-600 dark:text-rose-400'
          : isWatch
            ? 'text-amber-600 dark:text-amber-400'
            : 'text-teal-600 dark:text-teal-400';

        return (
          <div key={m.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {m.label}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                Normal: {m.baselineValue} {m.unit} · Current: {m.currentValue} {m.unit}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className={`font-mono text-sm font-semibold tabular-nums ${statusColor}`}>
                {m.deviationPct > 0 ? `+${m.deviationPct}%` : `${m.deviationPct}%`}
              </p>
              <p className="text-[11px] font-medium capitalize text-slate-500 dark:text-slate-400">
                {m.status}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const WellnessHeatmap: React.FC<{ checkIns: CheckInEntry[] }> = ({ checkIns }) => {
  const [hoveredDay, setHoveredDay] = useState<{
    date: string;
    score: number | null;
    sleep?: number;
  } | null>(null);

  // Build 56-day grid (8 weeks x 7 days) ending today
  const byDate = new Map(checkIns.map((c) => [c.date, c]));
  const cells: Array<{ date: string; entry?: CheckInEntry }> = [];
  for (let i = 55; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    cells.push({ date: iso, entry: byDate.get(iso) });
  }

  const colorFor = (entry?: CheckInEntry) => {
    if (!entry) return 'bg-slate-100 dark:bg-slate-800/80';
    if (entry.moodScore >= 8) return 'bg-teal-500 dark:bg-teal-400';
    if (entry.moodScore >= 6) return 'bg-sky-400 dark:bg-sky-500';
    if (entry.moodScore >= 5) return 'bg-indigo-400 dark:bg-indigo-500';
    return 'bg-violet-500 dark:bg-violet-400';
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span>
          {hoveredDay
            ? hoveredDay.score !== null
              ? `${hoveredDay.date} · Mood ${hoveredDay.score}/10 · Sleep ${hoveredDay.sleep}h`
              : `${hoveredDay.date} · No entry logged`
            : 'Last 8 weeks behavioral consistency'}
        </span>
        <div className="flex items-center gap-1.5">
          <span>Strained</span>
          <span className="h-3 w-3 rounded-sm bg-violet-500" />
          <span className="h-3 w-3 rounded-sm bg-indigo-400" />
          <span className="h-3 w-3 rounded-sm bg-sky-400" />
          <span className="h-3 w-3 rounded-sm bg-teal-500" />
          <span>Balanced</span>
        </div>
      </div>

      <div className="grid grid-cols-14 gap-1.5 sm:grid-cols-14">
        {cells.map((cell) => (
          <button
            key={cell.date}
            type="button"
            onMouseEnter={() =>
              setHoveredDay({
                date: cell.date,
                score: cell.entry ? cell.entry.moodScore : null,
                sleep: cell.entry?.sleepHours,
              })
            }
            onClick={() =>
              setHoveredDay({
                date: cell.date,
                score: cell.entry ? cell.entry.moodScore : null,
                sleep: cell.entry?.sleepHours,
              })
            }
            aria-label={`Date ${cell.date}`}
            className={`aspect-square w-full rounded-md transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-teal-500 ${colorFor(
              cell.entry
            )}`}
          />
        ))}
      </div>
    </div>
  );
};
