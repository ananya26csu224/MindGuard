import React, { useState } from 'react';
import {
  Check,
  Download,
  FileCode2,
  LogOut,
  Moon,
  RotateCcw,
  Sun,
} from 'lucide-react';
import { AppState, MOOD_OPTIONS, ScreenId } from '../types/mindguard';
import { BaselineComparisonBars, MoodStressChart, WellnessHeatmap } from './Charts';

export const AnalyticsScreen: React.FC<{ state: AppState }> = ({ state }) => {
  const { checkIns, baseline } = state;

  const handleExportCsv = () => {
    const header =
      'Date,Mood,MoodScore,Stress,Anxiety,Energy,Motivation,SleepHours,ActivityMins,ScreenHours,Workload\n';
    const rows = checkIns
      .map(
        (c) =>
          `${c.date},${c.mood},${c.moodScore},${c.stress},${c.anxiety},${c.energy},${c.motivation},${c.sleepHours},${c.physicalActivityMins},${c.screenTimeHours},${c.academicWorkload}`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindguard-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-50">
            Longitudinal Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            8-week behavioral consistency heatmap, baseline variance, and check-in ledger
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          disabled={checkIns.length === 0}
          className="min-h-[44px] inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 whitespace-nowrap"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50">
            8-Week Emotional Consistency Heatmap
          </h2>
          <WellnessHeatmap checkIns={checkIns} />
        </div>

        <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50">
            Baseline Deviation Snapshot
          </h2>
          {baseline.metrics.length > 0 ? (
            <BaselineComparisonBars metrics={baseline.metrics} />
          ) : (
            <div className="flex h-40 items-center justify-center text-xs text-slate-500 dark:text-slate-400 text-center">
              Log your first daily check-in to compare deviations against your baseline.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50">
          Multi-Signal Trend (Mood, Stress & Sleep)
        </h2>
        <MoodStressChart checkIns={checkIns} />
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50 mb-4">
          Daily Telemetry Ledger ({checkIns.length} Days)
        </h2>
        {checkIns.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 py-4">
            No check-ins recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-2.5 pr-4 font-medium">Date</th>
                  <th className="py-2.5 px-3 font-medium">Mood</th>
                  <th className="py-2.5 px-3 font-medium text-right">Stress</th>
                  <th className="py-2.5 px-3 font-medium text-right">Anxiety</th>
                  <th className="py-2.5 px-3 font-medium text-right">Sleep</th>
                  <th className="py-2.5 px-3 font-medium text-right">Activity</th>
                  <th className="py-2.5 pl-3 font-medium text-right">Screen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono tabular-nums">
                {[...checkIns]
                  .reverse()
                  .slice(0, 12)
                  .map((row) => {
                    const mObj = MOOD_OPTIONS.find((m) => m.id === row.mood);
                    return (
                      <tr
                        key={row.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                      >
                        <td className="py-2.5 pr-4 text-slate-700 dark:text-slate-300">
                          {row.date}
                        </td>
                        <td className="py-2.5 px-3 font-sans text-slate-900 dark:text-slate-100">
                          {mObj?.emoji} {mObj?.label} ({row.moodScore}/10)
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300">
                          {row.stress}/10
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300">
                          {row.anxiety}/10
                        </td>
                        <td className="py-2.5 px-3 text-right text-teal-600 dark:text-teal-400">
                          {row.sleepHours.toFixed(1)}h
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300">
                          {row.physicalActivityMins}m
                        </td>
                        <td className="py-2.5 pl-3 text-right text-slate-700 dark:text-slate-300">
                          {row.screenTimeHours.toFixed(1)}h
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

interface ProfileScreenProps {
  state: AppState;
  onStateUpdate: (nextState: AppState) => void;
  onNavigate: (screen: ScreenId) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  state,
  onStateUpdate,
  onNavigate,
}) => {
  const { user, digitalTwin, baseline, checkIns, journals } = state;
  const [avatarErr, setAvatarErr] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [university, setUniversity] = useState(user.university);
  const [major, setMajor] = useState(user.major);
  const [year, setYear] = useState(user.year);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  const initials = user.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-mindguard-user': user.id,
        },
        body: JSON.stringify({
          user: { name, university, major, year },
        }),
      });
      if (res.ok) {
        const next = await res.json();
        onStateUpdate(next);
        setEditing(false);
        setSavedMsg('Profile updated');
        setTimeout(() => setSavedMsg(''), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-50">
            Student Wellness Profile
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Personal identity, Digital Twin calibration, and app journey previews
          </p>
        </div>

        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="min-h-[40px] rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          {editing ? 'Cancel Edit' : 'Edit Profile'}
        </button>
      </div>

      {savedMsg && (
        <div className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-xs font-medium text-teal-800 dark:border-teal-900/50 dark:bg-teal-950/40 dark:text-teal-300 flex items-center gap-2">
          <Check className="h-4 w-4" />
          {savedMsg}
        </div>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 dark:border-slate-800 dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-teal-500/20 to-blue-500/20 flex items-center justify-center">
            {user.avatarUrl && !avatarErr ? (
              <img
                src={user.avatarUrl}
                alt={`${user.name} portrait`}
                referrerPolicy="no-referrer"
                onError={() => setAvatarErr(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="font-display text-xl font-bold text-teal-800 dark:text-teal-200">
                {initials || 'MG'}
              </span>
            )}
          </div>
          <div className="space-y-1">
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-slate-50">
              {user.name}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {user.major} · {user.university}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {user.year} · {user.email}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-5 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 pt-4 sm:pt-0 sm:pl-6 text-center font-mono tabular-nums">
          <div>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-50">
              {checkIns.length}
            </p>
            <p className="font-sans text-[11px] text-slate-500">Check-Ins</p>
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-50">
              {journals.length}
            </p>
            <p className="font-sans text-[11px] text-slate-500">Journals</p>
          </div>
          <div>
            <p className="text-xl font-bold text-teal-600 dark:text-teal-400">
              {digitalTwin.learningConfidence}%
            </p>
            <p className="font-sans text-[11px] text-slate-500">Twin Fit</p>
          </div>
        </div>
      </section>

      {editing && (
        <form
          onSubmit={handleSaveProfile}
          className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4"
        >
          <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50">
            Update Your Personal Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full min-h-[42px] rounded-xl border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                University / School
              </label>
              <input
                type="text"
                required
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full min-h-[42px] rounded-xl border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Major / Field of Study
              </label>
              <input
                type="text"
                required
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                className="w-full min-h-[42px] rounded-xl border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Academic Year
              </label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full min-h-[42px] rounded-xl border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="min-h-[42px] rounded-xl bg-slate-900 px-5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500"
            >
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50">
            Calibrated Personal Norms
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Normal Sleep</p>
              <p className="font-mono font-semibold tabular-nums">
                {baseline.sleepHours} hrs/night
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Normal Stress</p>
              <p className="font-mono font-semibold tabular-nums">
                {baseline.stressLevel}/10
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Normal Movement</p>
              <p className="font-mono font-semibold tabular-nums">
                {baseline.activityMins} mins/day
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Peak Focus</p>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                {digitalTwin.peakProductiveWindow}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50">
            App Experience & Deliverables
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Create a new personal account, switch accounts, preview onboarding, or view the system blueprint.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => onNavigate('auth')}
              className="min-h-[42px] inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500"
            >
              <LogOut className="h-3.5 w-3.5" />
              Create / Switch Account
            </button>
            <button
              type="button"
              onClick={() => onNavigate('blueprint')}
              className="min-h-[42px] inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <FileCode2 className="h-4 w-4" />
              Blueprint & Pitch
            </button>
            <button
              type="button"
              onClick={() => onNavigate('splash')}
              className="min-h-[42px] rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Splash
            </button>
            <button
              type="button"
              onClick={() => onNavigate('onboarding')}
              className="min-h-[42px] rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Onboarding
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

interface SettingsScreenProps {
  state: AppState;
  onStateUpdate: (nextState: AppState) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  state,
  onStateUpdate,
}) => {
  const { settings } = state;
  const [contactName, setContactName] = useState(settings.emergencyContact.name);
  const [contactRelation, setContactRelation] = useState(
    settings.emergencyContact.relation
  );
  const [contactPhone, setContactPhone] = useState(settings.emergencyContact.phone);
  const [reminderTime, setReminderTime] = useState(settings.dailyReminderTime);
  const [saving, setSaving] = useState(false);
  const [savedToast, setSavedToast] = useState('');

  const patchSettings = async (patch: any, msg = 'Settings saved') => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-mindguard-user': state.user.id,
        },
        body: JSON.stringify({ settings: patch }),
      });
      if (res.ok) {
        const next = await res.json();
        onStateUpdate(next);
        setSavedToast(msg);
        setTimeout(() => setSavedToast(''), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleResetDemo = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/reset-demo', {
        method: 'POST',
        headers: { 'x-mindguard-user': state.user.id },
      });
      if (res.ok) {
        const next = await res.json();
        onStateUpdate(next);
        setSavedToast('Workspace data reset');
        setTimeout(() => setSavedToast(''), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-50">
            Settings & Safety Preferences
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Appearance, baseline sensitivity, emergency contact, and data controls
          </p>
        </div>

        {savedToast && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 dark:text-teal-400">
            <Check className="h-4 w-4" />
            {savedToast}
          </span>
        )}
      </div>

      {/* Appearance */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50">
            Appearance Mode
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Switch between calm daylight and low-glare dark mode
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => patchSettings({ theme: 'light' }, 'Light mode active')}
            className={`min-h-[38px] inline-flex items-center gap-1.5 rounded-lg px-3.5 text-xs font-medium transition-colors ${
              settings.theme === 'light'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Sun className="h-3.5 w-3.5" />
            Light
          </button>
          <button
            type="button"
            onClick={() => patchSettings({ theme: 'dark' }, 'Dark mode active')}
            className={`min-h-[38px] inline-flex items-center gap-1.5 rounded-lg px-3.5 text-xs font-medium transition-colors ${
              settings.theme === 'dark'
                ? 'bg-slate-900 text-slate-50 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Moon className="h-3.5 w-3.5" />
            Dark
          </button>
        </div>
      </section>

      {/* Prediction & Reminder Controls */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-5">
        <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50">
          Baseline & Alert Preferences
        </h2>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Early Distress Notifications
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Alert when 3-day burnout trajectory crosses Moderate Risk
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              patchSettings({ predictiveAlertsEnabled: !settings.predictiveAlertsEnabled })
            }
            className={`min-h-[36px] w-14 rounded-full p-1 transition-colors ${
              settings.predictiveAlertsEnabled
                ? 'bg-teal-600'
                : 'bg-slate-300 dark:bg-slate-700'
            }`}
            aria-label="Toggle predictive alerts"
          >
            <div
              className={`h-5 w-5 rounded-full bg-white transition-transform ${
                settings.predictiveAlertsEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
          <div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Daily 30s Check-In Reminder
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Consistent evening timing improves baseline accuracy
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="min-h-[40px] rounded-xl border border-slate-200 bg-white px-3 font-mono text-xs dark:border-slate-700 dark:bg-slate-800"
            />
            <button
              type="button"
              onClick={() => patchSettings({ dailyReminderTime: reminderTime })}
              className="min-h-[40px] rounded-xl bg-slate-900 px-3.5 text-xs font-medium text-white dark:bg-teal-600"
            >
              Save
            </button>
          </div>
        </div>
      </section>

      {/* Trusted Emergency Contact */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50">
          Trusted Emergency Contact
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
              Contact Name
            </label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="e.g., Jordan Lee"
              className="w-full min-h-[42px] rounded-xl border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
              Relationship
            </label>
            <input
              type="text"
              value={contactRelation}
              onChange={(e) => setContactRelation(e.target.value)}
              placeholder="e.g., Sister / Friend"
              className="w-full min-h-[42px] rounded-xl border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+1 (555) 012-3456"
              className="w-full min-h-[42px] rounded-xl border border-slate-200 px-3 font-mono text-sm dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            disabled={saving}
            onClick={handleResetDemo}
            className="min-h-[42px] inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Workspace Data
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() =>
              patchSettings(
                {
                  emergencyContact: {
                    name: contactName,
                    relation: contactRelation,
                    phone: contactPhone,
                  },
                },
                'Emergency contact updated'
              )
            }
            className="min-h-[42px] rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500"
          >
            Save Emergency Contact
          </button>
        </div>
      </section>
    </div>
  );
};
