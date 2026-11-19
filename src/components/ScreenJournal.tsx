import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { AppState, JournalEntry, ScreenId } from '../types/mindguard';

interface JournalScreenProps {
  state: AppState;
  onStateUpdate: (nextState: AppState) => void;
  onNavigate: (screen: ScreenId) => void;
}

const REFLECTION_PROMPTS = [
  'What felt heaviest today, and what gave you even 5% relief?',
  'Which upcoming deadline is taking up the most mental bandwidth right now?',
  'If a close friend had your exact day today, what would you tell them?',
  'What is one small boundary you can protect before midnight tonight?',
];

export const JournalScreen: React.FC<JournalScreenProps> = ({
  state,
  onStateUpdate,
  onNavigate,
}) => {
  const [mode, setMode] = useState<'text' | 'voice' | 'reflection'>('text');
  const [selectedPrompt, setSelectedPrompt] = useState(REFLECTION_PROMPTS[0]);
  const [content, setContent] = useState('');
  const [recording, setRecording] = useState(false);
  const [durationSec, setDurationSec] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(
    state.journals[state.journals.length - 1] ?? null
  );

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const toggleVoiceRecording = () => {
    if (recording) {
      setRecording(false);
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      return;
    }

    setError('');
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    setRecording(true);
    setDurationSec(0);
    timerRef.current = window.setInterval(() => {
      setDurationSec((s) => s + 1);
    }, 1000);

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      let finalTranscript = content ? content + ' ' : '';

      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const piece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += piece + ' ';
          } else {
            interim += piece;
          }
        }
        setContent((finalTranscript + interim).trim());
      };

      recognition.onerror = () => {
        setError(
          'Microphone speech recognition unavailable in this browser context. You can type or edit your voice transcript below.'
        );
        setRecording(false);
        if (timerRef.current) window.clearInterval(timerRef.current);
      };

      recognitionRef.current = recognition;
      try {
        recognition.start();
      } catch {
        setError('Could not start microphone transcription. You can type your note directly.');
        setRecording(false);
        if (timerRef.current) window.clearInterval(timerRef.current);
      }
    } else {
      setError(
        'Live SpeechRecognition is not supported by this browser. Type your voice reflection below to analyze it with Gemini AI.'
      );
      setRecording(false);
      if (timerRef.current) window.clearInterval(timerRef.current);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim().length < 8) {
      setError('Please write at least a sentence so MindGuard AI can analyze emotional signals.');
      return;
    }

    if (recording) toggleVoiceRecording();

    setAnalyzing(true);
    setError('');
    try {
      const res = await fetch('/api/journal/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-mindguard-user': state.user.id,
        },
        body: JSON.stringify({
          content: content.trim(),
          mode,
          prompt: mode === 'reflection' ? selectedPrompt : undefined,
          durationSec: mode === 'voice' ? durationSec : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Journal analysis failed.');
        return;
      }
      onStateUpdate(data.state);
      setSelectedEntry(data.entry);
      setContent('');
      setDurationSec(0);

      if (data.entry?.analysis?.crisisFlag) {
        onNavigate('emergency');
      }
    } catch {
      setError('Unable to connect to the Gemini NLP analysis service.');
    } finally {
      setAnalyzing(false);
    }
  };

  const activeEntry =
    selectedEntry || state.journals[state.journals.length - 1] || null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-50">
            AI Journal & NLP Reflection
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Sentiment, thought patterns, academic pressure, and burnout signal detection
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {(
            [
              { id: 'text', label: 'Text Entry' },
              { id: 'voice', label: 'Voice Note' },
              { id: 'reflection', label: 'Daily Reflection' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMode(tab.id)}
              className={`min-h-[38px] rounded-lg px-3.5 text-xs font-medium transition-colors whitespace-nowrap ${
                mode === tab.id
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-50'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Composer */}
        <form
          onSubmit={handleAnalyze}
          className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4"
        >
          {mode === 'reflection' && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Guided Prompt
              </label>
              <div className="grid grid-cols-1 gap-2">
                {REFLECTION_PROMPTS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSelectedPrompt(p)}
                    className={`text-left rounded-xl border px-3.5 py-2.5 text-xs transition-colors ${
                      selectedPrompt === p
                        ? 'border-teal-600 bg-teal-50/70 text-teal-900 dark:border-teal-400 dark:bg-teal-950/40 dark:text-teal-100'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === 'voice' && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleVoiceRecording}
                  className={`min-h-[48px] min-w-[48px] flex items-center justify-center rounded-2xl transition-colors ${
                    recording
                      ? 'bg-rose-600 text-white'
                      : 'bg-teal-600 text-white hover:bg-teal-500'
                  }`}
                  aria-label={recording ? 'Stop recording' : 'Start voice note'}
                >
                  {recording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {recording ? 'Listening & transcribing...' : 'Tap to record voice note'}
                  </p>
                  <p className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
                    Duration: {Math.floor(durationSec / 60)}:
                    {String(durationSec % 60).padStart(2, '0')}
                  </p>
                </div>
              </div>
              <Volume2 className="h-5 w-5 text-slate-400" />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
              Your Thoughts (Private & Encrypted)
            </label>
            <textarea
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write freely about your day, classes, sleep, or anything weighing on your mind..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-sm leading-relaxed text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 dark:focus:bg-slate-800"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-slate-400">
              Analyzed via MindGuard NLP · Updates Distress Risk & Digital Twin
            </span>
            <button
              type="submit"
              disabled={analyzing}
              className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-teal-600 dark:hover:bg-teal-500 transition-colors"
            >
              <Send className="h-4 w-4" />
              {analyzing ? 'Analyzing with Gemini...' : 'Analyze & Save Entry'}
            </button>
          </div>
        </form>

        {/* Active NLP Analysis Panel */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-5">
          {activeEntry ? (
            <>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-medium text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    NLP Emotional Analysis
                  </p>
                  <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50 mt-0.5">
                    {activeEntry.analysis.primaryEmotion}
                  </h2>
                </div>
                <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
                  {activeEntry.date}
                </span>
              </div>

              {activeEntry.analysis.crisisFlag && (
                <div className="rounded-2xl border border-rose-300 bg-rose-50 p-3.5 dark:border-rose-800 dark:bg-rose-950/50 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-rose-800 dark:text-rose-200">
                      Support Resources Recommended
                    </p>
                    <p className="text-rose-700 dark:text-rose-300">
                      {activeEntry.analysis.crisisReason}
                    </p>
                    <button
                      type="button"
                      onClick={() => onNavigate('emergency')}
                      className="font-semibold underline text-rose-800 dark:text-rose-200"
                    >
                      Open Immediate Support
                    </button>
                  </div>
                </div>
              )}

              {/* Metrics Row */}
              <div className="grid grid-cols-3 gap-3 border-y border-slate-100 dark:border-slate-800 py-3.5">
                <div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Sentiment</p>
                  <p className="font-mono text-base font-bold tabular-nums text-slate-900 dark:text-slate-100">
                    {activeEntry.analysis.sentimentScore >= 0 ? '+' : ''}
                    {activeEntry.analysis.sentimentScore.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Stress Signal</p>
                  <p className="font-mono text-base font-bold tabular-nums text-indigo-600 dark:text-indigo-400">
                    {activeEntry.analysis.stressLevel}%
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Burnout Sign</p>
                  <p className="font-mono text-base font-bold tabular-nums text-blue-600 dark:text-blue-400">
                    {activeEntry.analysis.burnoutIndicator}%
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Key Insight
                </p>
                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                  {activeEntry.analysis.insightSummary}
                </p>
              </div>

              {/* Detected Signals */}
              <div className="space-y-2.5">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Detected Indicators
                </p>
                {activeEntry.analysis.detectedSignals.map((sig, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {sig.label}
                      </span>
                      <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                        {sig.intensity}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-teal-500 to-indigo-500"
                        style={{ width: `${sig.intensity}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {sig.evidence}
                    </p>
                  </div>
                ))}
              </div>

              {activeEntry.analysis.thoughtPatterns?.length > 0 && (
                <div className="text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    Thought Patterns:{' '}
                  </span>
                  {activeEntry.analysis.thoughtPatterns.join(' · ')}
                </div>
              )}

              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3.5 text-xs text-slate-700 dark:text-slate-200">
                <span className="font-semibold">Gentle Next Step: </span>
                {activeEntry.analysis.recommendedAction}
              </div>
            </>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center text-center text-sm text-slate-500">
              <BookOpen className="h-8 w-8 mb-2 text-slate-400" />
              Select or submit a journal entry to view NLP emotional analysis.
            </div>
          )}
        </div>
      </div>

      {/* Past Entries Timeline */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50 mb-4">
          Recent Journal History ({state.journals.length})
        </h2>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {[...state.journals].reverse().map((entry) => {
            const isSelected = activeEntry?.id === entry.id;
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => setSelectedEntry(entry)}
                className={`w-full text-left py-4 px-3 rounded-xl transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-slate-50 dark:bg-slate-800/70'
                    : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-mono tabular-nums">{entry.date}</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{entry.mode}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {entry.analysis.primaryEmotion}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
                    {entry.content}
                  </p>
                </div>
                <div className="shrink-0 text-right font-mono text-xs tabular-nums">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    Sentiment {entry.analysis.sentimentScore >= 0 ? '+' : ''}
                    {entry.analysis.sentimentScore.toFixed(2)}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    Burnout {entry.analysis.burnoutIndicator}%
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
