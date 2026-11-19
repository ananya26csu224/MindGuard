import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, MessageSquareHeart, Send, Sparkles } from 'lucide-react';
import { AppState, CoachMessage, ScreenId } from '../types/mindguard';

interface CoachChatScreenProps {
  state: AppState;
  onStateUpdate: (nextState: AppState) => void;
  onNavigate: (screen: ScreenId) => void;
}

const STARTER_PROMPTS = [
  'Help me reframe catastrophic thoughts about my grades',
  'I feel overwhelmed by deadlines and cannot start studying',
  'Give me a 2-minute grounding exercise for late-night anxiety',
  'Give me a gentle journaling prompt for tonight',
];

export const CoachChatScreen: React.FC<CoachChatScreenProps> = ({
  state,
  onStateUpdate,
  onNavigate,
}) => {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [optimisticMsg, setOptimisticMsg] = useState<CoachMessage | null>(null);
  const [error, setError] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const visibleMessages = optimisticMsg
    ? [...state.coachMessages, optimisticMsg]
    : state.coachMessages;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [visibleMessages.length, sending]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setError('');
    setInput('');
    setOptimisticMsg({
      id: `opt-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    });

    try {
      const res = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-mindguard-user': state.user.id,
        },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Coach could not respond right now.');
        setOptimisticMsg(null);
        setInput(trimmed);
        return;
      }
      setOptimisticMsg(null);
      onStateUpdate(data.state);
      if (data.message?.crisisTriggered) {
        onNavigate('emergency');
      }
    } catch {
      setError('Connection issue reaching MindGuard Coach.');
      setOptimisticMsg(null);
      setInput(trimmed);
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const lastAssistant = [...state.coachMessages]
    .reverse()
    .find((m) => m.role === 'assistant');

  return (
    <div className="flex flex-col h-[calc(100vh-11rem)] lg:h-[calc(100vh-8.5rem)] min-h-[520px] rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
      {/* Coach Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500/15 to-blue-500/15 text-teal-700 dark:text-teal-300">
            <MessageSquareHeart className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50">
              MindGuard AI Coach
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              CBT-inspired guidance · Aware of your {state.baseline.sleepHours}h baseline & recent signals
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('emergency')}
          className="min-h-[38px] inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/70 px-3 text-xs font-medium text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 whitespace-nowrap"
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          Crisis Support
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-5">
        {visibleMessages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3.5 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-slate-900 text-white dark:bg-teal-600 dark:text-white'
                    : 'bg-slate-50 text-slate-800 border border-slate-200/70 dark:bg-slate-800/80 dark:text-slate-100 dark:border-slate-700'
                }`}
              >
                <p className="whitespace-pre-line">{msg.content}</p>
                {msg.crisisTriggered && (
                  <button
                    type="button"
                    onClick={() => onNavigate('emergency')}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 underline dark:text-rose-300"
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    View Immediate Support Resources
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {sending && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-teal-500" />
              Replying...
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick CBT & Grounding Prompts */}
      <div className="border-t border-slate-100 px-5 pt-3 pb-2 dark:border-slate-800">
        {error && (
          <p className="mb-2 text-xs font-medium text-rose-600 dark:text-rose-400">
            {error}
          </p>
        )}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(lastAssistant?.suggestedFollowUps?.length
            ? lastAssistant.suggestedFollowUps
            : STARTER_PROMPTS
          ).map((prompt) => (
            <button
              key={prompt}
              type="button"
              disabled={sending}
              onClick={() => sendMessage(prompt)}
              className="shrink-0 min-h-[36px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-slate-100 px-5 py-3.5 dark:border-slate-800"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Share what's on your mind—stress, sleep, exams, or a thought to reframe..."
          className="flex-1 min-h-[44px] rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-sm text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          aria-label="Send message"
          className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-40 dark:bg-teal-600 dark:hover:bg-teal-500 transition-colors"
        >
          <Send className="h-4 w-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
};
