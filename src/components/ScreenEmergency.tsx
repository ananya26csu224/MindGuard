import React, { useEffect, useState } from 'react';
import {
  HeartHandshake,
  MessageSquare,
  PhoneCall,
  ShieldAlert,
  Wind,
} from 'lucide-react';
import { AppState } from '../types/mindguard';

interface EmergencyScreenProps {
  state: AppState;
  onStateUpdate: (nextState: AppState) => void;
}

export const EmergencyScreen: React.FC<EmergencyScreenProps> = ({
  state,
  onStateUpdate,
}) => {
  const { emergencyContact } = state.settings;
  const [breathingActive, setBreathingActive] = useState(false);
  const [phase, setPhase] = useState<'Inhale (4s)' | 'Hold (7s)' | 'Exhale (8s)'>(
    'Inhale (4s)'
  );
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [contactNotice, setContactNotice] = useState('');

  useEffect(() => {
    if (!breathingActive) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;
        if (phase === 'Inhale (4s)') {
          setPhase('Hold (7s)');
          return 7;
        }
        if (phase === 'Hold (7s)') {
          setPhase('Exhale (8s)');
          return 8;
        }
        setPhase('Inhale (4s)');
        return 4;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [breathingActive, phase]);

  const dismissAlert = async () => {
    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-mindguard-user': state.user.id,
      },
      body: JSON.stringify({ crisisAlertActive: false }),
    });
    if (res.ok) {
      const next = await res.json();
      onStateUpdate(next);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="rounded-3xl border border-rose-200 bg-rose-50/70 p-6 md:p-8 dark:border-rose-900/60 dark:bg-rose-950/30 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4" />
              Immediate Support & Crisis Safety
            </p>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-50">
              You do not have to carry this alone.
            </h1>
            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed max-w-2xl">
              {state.crisisAlertActive && state.crisisAlertReason
                ? `${state.crisisAlertReason} Reaching out to a trained counselor or someone you trust can bring immediate relief.`
                : 'If you are experiencing overwhelming distress, hopelessness, or thoughts of self-harm, confidential human support is available 24/7.'}
            </p>
          </div>

          {state.crisisAlertActive && (
            <button
              type="button"
              onClick={dismissAlert}
              className="min-h-[40px] rounded-xl border border-rose-200 bg-white px-3.5 text-xs font-medium text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:bg-slate-900 dark:text-rose-300"
            >
              I am safe right now
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <a
            href="tel:988"
            className="min-h-[64px] flex items-center justify-between rounded-2xl bg-rose-600 px-5 py-4 text-white hover:bg-rose-700 transition-colors"
          >
            <div>
              <p className="font-display text-base font-bold">Call or Text 988</p>
              <p className="text-xs text-rose-100">
                Suicide & Crisis Lifeline · Free, confidential, 24/7
              </p>
            </div>
            <PhoneCall className="h-5 w-5 shrink-0" />
          </a>

          <a
            href="sms:741741&body=HOME"
            className="min-h-[64px] flex items-center justify-between rounded-2xl border border-rose-200 bg-white px-5 py-4 text-slate-900 hover:bg-rose-50 dark:border-rose-800 dark:bg-slate-900 dark:text-slate-50 transition-colors"
          >
            <div>
              <p className="font-display text-base font-bold">Text HOME to 741741</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Crisis Text Line · Trained volunteer responder
              </p>
            </div>
            <MessageSquare className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
          </a>
        </div>
      </div>

      {/* Personal Emergency Contact + Grounding */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-2 text-xs font-medium text-teal-700 dark:text-teal-400">
            <HeartHandshake className="h-4 w-4" />
            Trusted Emergency Contact
          </div>
          {emergencyContact.name ? (
            <>
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-50">
                  {emergencyContact.name}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {emergencyContact.relation || 'Trusted Contact'} ·{' '}
                  <span className="font-mono">{emergencyContact.phone}</span>
                </p>
              </div>
              {emergencyContact.phone && (
                <div className="flex flex-wrap gap-3 pt-1">
                  <a
                    href={`tel:${emergencyContact.phone.replace(/[^+\d]/g, '')}`}
                    onClick={() =>
                      setContactNotice(`Dialing ${emergencyContact.name} (${emergencyContact.phone})...`)
                    }
                    className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500"
                  >
                    <PhoneCall className="h-4 w-4" />
                    Call Emergency Contact
                  </a>
                </div>
              )}
              {contactNotice && (
                <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
                  {contactNotice}
                </p>
              )}
            </>
          ) : (
            <div className="space-y-1.5">
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50">
                No Personal Contact Added Yet
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You can add a trusted friend or family member’s phone number anytime under Settings.
              </p>
            </div>
          )}
          <p className="text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
            Campus Counseling & Health Center: Available for same-day urgent walk-ins and student mental health triage.
          </p>
        </div>

        {/* Guided 4-7-8 Grounding */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
              <Wind className="h-4 w-4" />
              60-Second Physiological Reset
            </p>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-50">
              4-7-8 Nervous System Grounding
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Slowing your exhale stimulates vagal tone and lowers acute panic arousal.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/70 p-5 text-center space-y-1">
            <p className="font-display text-xl font-bold text-teal-700 dark:text-teal-300">
              {breathingActive ? phase : 'Ready when you are'}
            </p>
            <p className="font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-50">
              {breathingActive ? `${secondsLeft}s` : '4 · 7 · 8'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setBreathingActive((b) => !b);
              setPhase('Inhale (4s)');
              setSecondsLeft(4);
            }}
            className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            {breathingActive ? 'Pause Breathing Guide' : 'Start Guided Grounding'}
          </button>
        </div>
      </section>

      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        Important Notice: MindGuard AI is a predictive behavioral wellness tool and does not provide medical or psychiatric diagnoses. Always seek qualified clinical or emergency care during acute distress.
      </p>
    </div>
  );
};
