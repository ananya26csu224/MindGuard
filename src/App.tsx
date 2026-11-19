import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  FileCode2,
  LayoutDashboard,
  Menu,
  MessageSquareHeart,
  Moon,
  Settings as SettingsIcon,
  ShieldAlert,
  Sparkles,
  Sun,
  User as UserIcon,
  X,
} from 'lucide-react';
import { AppState, ScreenId } from './types/mindguard';
import { AuthScreen, OnboardingScreen, SplashScreen } from './components/ScreensAuth';
import { DashboardScreen } from './components/ScreenDashboard';
import { CheckInScreen } from './components/ScreenCheckIn';
import { JournalScreen } from './components/ScreenJournal';
import { InsightsScreen } from './components/ScreenInsightsTwin';
import { BurnoutForecastScreen, RiskPredictionScreen } from './components/ScreenRiskForecast';
import { CoachChatScreen } from './components/ScreenCoach';
import {
  AnalyticsScreen,
  ProfileScreen,
  SettingsScreen,
} from './components/ScreenAnalyticsProfile';
import { EmergencyScreen } from './components/ScreenEmergency';
import { BlueprintScreen } from './components/ScreenBlueprint';

const SIDEBAR_GROUPS: Array<{
  title: string;
  items: Array<{ id: ScreenId; label: string; icon: React.ComponentType<{ className?: string }> }>;
}> = [
  {
    title: 'Core Wellness',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'checkin', label: 'Daily Check-In', icon: CheckCircle2 },
      { id: 'journal', label: 'AI Journal', icon: BookOpen },
      { id: 'insights', label: 'Insights & Twin', icon: Sparkles },
    ],
  },
  {
    title: 'Predictive XAI',
    items: [
      { id: 'risk', label: 'Risk Prediction', icon: Activity },
      { id: 'forecast', label: 'Burnout Forecast', icon: CalendarClock },
      { id: 'coach', label: 'AI Coach Chat', icon: MessageSquareHeart },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Account & Safety',
    items: [
      { id: 'emergency', label: 'Emergency Support', icon: ShieldAlert },
      { id: 'profile', label: 'Profile', icon: UserIcon },
      { id: 'settings', label: 'Settings', icon: SettingsIcon },
      { id: 'blueprint', label: 'Blueprint & Pitch', icon: FileCode2 },
    ],
  },
];

export default function App() {
  const [state, setState] = useState<AppState | null>(null);
  const [screen, setScreen] = useState<ScreenId>('dashboard');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const savedUserId = window.localStorage.getItem('mindguard_user_id');
        const res = await fetch('/api/state', {
          headers: savedUserId ? { 'x-mindguard-user': savedUserId } : {},
        });
        if (!res.ok) throw new Error('Failed to load workspace');
        const data: AppState = await res.json();
        setState(data);
      } catch {
        setLoadError('Unable to reach MindGuard AI backend.');
      } finally {
        setLoading(false);
      }
    };
    hydrate();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (state?.settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [state?.settings.theme]);

  const navigateTo = (next: ScreenId) => {
    setScreen(next);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleTheme = async () => {
    if (!state) return;
    const nextTheme = state.settings.theme === 'dark' ? 'light' : 'dark';
    setState({
      ...state,
      settings: { ...state.settings, theme: nextTheme },
    });
    await fetch('/api/settings', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-mindguard-user': state.user.id,
      },
      body: JSON.stringify({ settings: { theme: nextTheme } }),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center space-y-2">
          <p className="font-display text-xl font-bold text-slate-900 dark:text-slate-50">
            MindGuard AI
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Loading your wellness workspace...
          </p>
        </div>
      </div>
    );
  }

  if (loadError || !state) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-sm w-full rounded-3xl border border-slate-200 bg-white p-6 text-center space-y-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="font-display text-lg font-bold text-slate-900 dark:text-slate-50">
            Connection Interrupted
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {loadError || 'Workspace state unavailable.'}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="min-h-[44px] w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white dark:bg-teal-600"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'splash') {
    return (
      <SplashScreen
        onNavigate={navigateTo}
        theme={state.settings.theme}
        onToggleTheme={toggleTheme}
      />
    );
  }
  if (screen === 'onboarding') {
    return (
      <OnboardingScreen
        onNavigate={navigateTo}
        theme={state.settings.theme}
        onToggleTheme={toggleTheme}
      />
    );
  }
  if (screen === 'auth') {
    return (
      <AuthScreen
        onNavigate={navigateTo}
        theme={state.settings.theme}
        onToggleTheme={toggleTheme}
        onAuthSuccess={(nextState, userId) => {
          window.localStorage.setItem('mindguard_user_id', userId);
          setState(nextState);
          navigateTo('dashboard');
        }}
      />
    );
  }

  const userInitials = state.user.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex h-16 items-center px-6 border-b border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => navigateTo('dashboard')}
            className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50 whitespace-nowrap"
          >
            MindGuard AI
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
          {SIDEBAR_GROUPS.map((group) => (
            <div key={group.title} className="space-y-1">
              <p className="px-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                {group.title}
              </p>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = screen === item.id;
                const isEmergency = item.id === 'emergency';
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigateTo(item.id)}
                    className={`w-full min-h-[42px] flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-slate-900 text-white dark:bg-teal-600 dark:text-white'
                        : isEmergency
                          ? 'text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Bottom User & Prominent Dark Mode Switch */}
        <div className="border-t border-slate-100 p-4 dark:border-slate-800 space-y-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="w-full min-h-[40px] flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <span className="flex items-center gap-2">
              {state.settings.theme === 'dark' ? (
                <Moon className="h-3.5 w-3.5 text-teal-400" />
              ) : (
                <Sun className="h-3.5 w-3.5 text-amber-500" />
              )}
              {state.settings.theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </span>
            <span className="text-[11px] text-slate-400">Switch</span>
          </button>

          <button
            type="button"
            onClick={() => navigateTo('profile')}
            className="w-full min-w-0 flex items-center gap-2.5 text-left"
          >
            {state.user.avatarUrl ? (
              <img
                src={state.user.avatarUrl}
                alt={state.user.name}
                referrerPolicy="no-referrer"
                className="h-8 w-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
              />
            ) : (
              <span className="h-8 w-8 rounded-full bg-teal-600/15 text-teal-800 dark:text-teal-200 flex items-center justify-center font-display text-xs font-bold shrink-0">
                {userInitials || 'MG'}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">
                {state.user.name}
              </p>
              <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                {state.prediction.wellnessScore}/100 Wellness
              </p>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content Shell */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 pb-20 lg:pb-8">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-30 h-14 lg:h-16 border-b border-slate-200 bg-white/85 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/85 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-6">
          {/* Zone 1: Brand Title */}
          <button
            type="button"
            onClick={() => navigateTo('dashboard')}
            className="font-display text-base lg:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50 whitespace-nowrap shrink-0"
          >
            MindGuard AI
          </button>

          {/* Zone 2: Concise Single-Line Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            {(
              [
                ['dashboard', 'Dashboard'],
                ['risk', 'Risk XAI'],
                ['forecast', 'Forecast'],
                ['blueprint', 'Blueprint'],
              ] as Array<[ScreenId, string]>
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => navigateTo(id)}
                className={`whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 dark:hover:text-white ${
                  screen === id
                    ? 'text-teal-700 font-semibold dark:text-teal-400'
                    : ''
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Zone 3: Quick Theme + Primary Action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              title={state.settings.theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
            >
              {state.settings.theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-700" />
              )}
            </button>
            <button
              type="button"
              onClick={() => navigateTo('checkin')}
              className="min-h-[40px] rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 transition-colors whitespace-nowrap shrink-0"
            >
              Log Check-In
            </button>
          </div>
        </header>

        {/* Active Crisis Escalation Banner */}
        {state.crisisAlertActive && screen !== 'emergency' && (
          <div className="bg-rose-600 text-white px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>
                Elevated distress signal detected. Immediate confidential human support is available.
              </span>
            </div>
            <button
              type="button"
              onClick={() => navigateTo('emergency')}
              className="min-h-[36px] rounded-lg bg-white px-3.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 whitespace-nowrap"
            >
              Open Support Resources
            </button>
          </div>
        )}

        {/* Active Screen Viewport */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {screen === 'dashboard' && (
            <DashboardScreen state={state} onNavigate={navigateTo} />
          )}
          {screen === 'checkin' && (
            <CheckInScreen
              state={state}
              onStateUpdate={setState}
              onDone={() => navigateTo('dashboard')}
            />
          )}
          {screen === 'journal' && (
            <JournalScreen
              state={state}
              onStateUpdate={setState}
              onNavigate={navigateTo}
            />
          )}
          {screen === 'insights' && <InsightsScreen state={state} />}
          {screen === 'risk' && (
            <RiskPredictionScreen state={state} onStateUpdate={setState} />
          )}
          {screen === 'forecast' && <BurnoutForecastScreen state={state} />}
          {screen === 'coach' && (
            <CoachChatScreen
              state={state}
              onStateUpdate={setState}
              onNavigate={navigateTo}
            />
          )}
          {screen === 'analytics' && <AnalyticsScreen state={state} />}
          {screen === 'profile' && (
            <ProfileScreen
              state={state}
              onStateUpdate={setState}
              onNavigate={navigateTo}
            />
          )}
          {screen === 'settings' && (
            <SettingsScreen state={state} onStateUpdate={setState} />
          )}
          {screen === 'emergency' && (
            <EmergencyScreen state={state} onStateUpdate={setState} />
          )}
          {screen === 'blueprint' && <BlueprintScreen onNavigate={navigateTo} />}
        </main>
      </div>

      {/* Mobile Fixed Bottom Tab Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 h-16 border-t border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 grid grid-cols-5 items-center"
      >
        {(
          [
            { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
            { id: 'checkin', label: 'Check-In', icon: CheckCircle2 },
            { id: 'journal', label: 'Journal', icon: BookOpen },
            { id: 'coach', label: 'Coach', icon: MessageSquareHeart },
          ] as Array<{ id: ScreenId; label: string; icon: React.ComponentType<{ className?: string }> }>
        ).map((tab) => {
          const Icon = tab.icon;
          const active = screen === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => navigateTo(tab.id)}
              className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 ${
                active
                  ? 'text-teal-600 dark:text-teal-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 ${
            mobileMenuOpen
              ? 'text-teal-600 dark:text-teal-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Menu className="h-5 w-5" />
          <span className="text-[10px] tracking-tight">More</span>
        </button>
      </nav>

      {/* Mobile Bottom Sheet Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-sm">
          <div className="rounded-t-3xl bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-5 max-h-[82vh] overflow-y-auto space-y-5">
            <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto" />
            <div className="flex items-center justify-between">
              <span className="font-display text-base font-bold">All MindGuard Views</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  {state.settings.theme === 'dark' ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pb-4">
              {SIDEBAR_GROUPS.flatMap((g) => g.items).map((item) => {
                const Icon = item.icon;
                const active = screen === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigateTo(item.id)}
                    className={`min-h-[48px] flex items-center gap-2.5 rounded-2xl border px-3.5 text-left text-xs font-medium ${
                      active
                        ? 'border-teal-600 bg-teal-50 text-teal-900 dark:border-teal-400 dark:bg-teal-950/40 dark:text-teal-100'
                        : item.id === 'emergency'
                          ? 'border-rose-200 bg-rose-50/70 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300'
                          : 'border-slate-200 text-slate-700 dark:border-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
