'use client';

import React, { FormEvent, useEffect, useRef, useState } from 'react';
import type { GeographicRegion, ForecastResult } from '@/types';
import {
  Bot,
  Circle,
  Compass,
  Layers,
  Lock,
  MapPin,
  RotateCcw,
  Send,
  User,
} from 'lucide-react';

interface ExploreChatPanelProps {
  region: GeographicRegion;
  variable: string;
  variableName: string;
  variableUnit: string;
  radiusKm: number;
  isRadiusLocked: boolean;
  horizonMonths?: number;
  modelType?: 'holt-winters' | 'seasonal-naive';
  forecast?: ForecastResult | null;
  mode?: 'explore' | 'forecast';
}

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  time: string;
  provenance?: string;
}

const QUICK_PROMPTS = [
  'What trends are happening locally?',
  'Which NASA datasets cover this area?',
  'Is the temperature rising or falling here?',
  'What analysis methods should I use?',
];

function formatMetric(value: unknown, digits = 3): string {
  return typeof value === 'number' && Number.isFinite(value)
    ? value.toFixed(digits)
    : 'not reported';
}

export function ExploreChatPanel({
  region,
  variable,
  variableName,
  variableUnit,
  radiusKm,
  isRadiusLocked,
  horizonMonths = 24,
  modelType = 'holt-winters',
  forecast = null,
  mode = 'explore',
}: ExploreChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text:
        mode === 'forecast'
          ? `Hello! I am your Earth-Science Forecast Assistant. I can help interpret the measured record and the forecast currently loaded for ${region.name}. Ask about the trajectory, uncertainty intervals, seasonal behaviour, or model validation.`
          : `Hello! I am your Earth-Science AI Assistant. I can investigate environmental trends, historical observations, seasonal patterns, and climate risks for ${region.name}. Ask me about the selected location and variable.`,
      time: 'Just now',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const currentTime = () =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, chatLoading]);

  // Start a fresh conversation when the investigation context changes.
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        text:
          mode === 'forecast'
            ? `Forecast context updated for ${region.name}. I am ready to discuss ${variableName}, its measured history, and the currently loaded model output.`
            : `Investigation context updated to ${region.name}. Ask me about ${variableName}, environmental trends, seasonal cycles, or climate risks.`,
        time: currentTime(),
      },
    ]);
    // Deliberately reset only when the selected place or variable changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region.name, region.center?.[0], region.center?.[1], variable, mode]);

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        text: `Conversation cleared. I am ready to investigate ${region.name}. Ask me about its environmental conditions, climate risks, or future projections.`,
        time: currentTime(),
      },
    ]);
    setInputMessage('');
  };

  const handleSendMessage = async (
    event?: FormEvent<HTMLFormElement>,
    directMessage?: string,
  ) => {
    event?.preventDefault();
    const userText = (directMessage ?? inputMessage).trim();
    if (!userText || chatLoading) return;

    setInputMessage('');
    setMessages(previous => [
      ...previous,
      { role: 'user', text: userText, time: currentTime() },
    ]);
    setChatLoading(true);

    try {
      const latestPoint = forecast?.forecastPoints?.[
        Math.max(0, Math.min(horizonMonths - 1, (forecast?.forecastPoints?.length ?? 1) - 1))
      ];

      const forecastContext = mode === 'forecast'
        ? [
          `Forecast workspace context: ${horizonMonths}-month horizon; model ${modelType}.`,
          latestPoint
            ? `The loaded forecast's selected horizon point is ${formatMetric(latestPoint.predictedValue)} ${variableUnit}; its 95% interval is ${formatMetric(latestPoint.confidenceLower95)} to ${formatMetric(latestPoint.confidenceUpper95)} ${variableUnit}. These are model outputs, not direct observations.`
            : 'No forecast output is currently loaded. Do not invent projected values.',
          `Validation RMSE: ${formatMetric(forecast?.validationMetrics?.rmse)} ${variableUnit}.`,
        ].join('\n')
        : '';

      // IMPORTANT: the API route reads body.message, not body.question.
      const message = [
        mode === 'forecast' ? `[FORECAST WORKSPACE: ${region.name}]` : `[EXPLORE INVESTIGATION: ${region.name}]`,
        `Selected variable: ${variable} (${variableName}, ${variableUnit}).`,
        `Forecast horizon: ${horizonMonths} months. Model: ${modelType}.`,
        forecastContext,
        `User question: ${userText}`,
      ].filter(Boolean).join('\n\n');

      const response = await fetch('/api/explore/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          region: {
            name: region.name,
            geometryType: region.geometryType,
            coordinates: region.coordinates,
            center: region.center ?? region.coordinates,
          },
          variable,
          radiusKm,
          isRadiusLocked,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || data.message || `Chat API returned HTTP ${response.status}`);
      }

      const reply = [data.reply, data.response, data.answer]
        .find(value => typeof value === 'string' && value.trim());

      if (!reply) {
        throw new Error('The chat API returned a successful response but no reply field.');
      }

      setMessages(previous => [
        ...previous,
        {
          role: 'assistant',
          text: reply,
          time: currentTime(),
          provenance: typeof data.provenance === 'string' ? data.provenance : undefined,
        },
      ]);
    } catch (error) {
      console.error('Earth Science AI chat error:', error);
      setMessages(previous => [
        ...previous,
        {
          role: 'assistant',
          text: `The request failed: ${error instanceof Error ? error.message : 'Unknown network or server error'}. Check the browser Network tab and the /api/explore/chat server logs.`,
          time: currentTime(),
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-3xl border border-emerald-400/70 bg-gradient-to-br from-emerald-200/90 via-emerald-100/90 to-teal-200/80 shadow-xl shadow-emerald-900/15 ring-1 ring-emerald-200/70 backdrop-blur-xl">
      <div className="shrink-0 border-b border-emerald-300/70 bg-gradient-to-r from-emerald-300/75 via-emerald-200/70 to-teal-200/70 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-orange-400/60 bg-orange-500/15 text-orange-600 shadow-xs">
              <Compass className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-emerald-950">
                {mode === 'forecast' ? 'Forecast AI Detective' : 'Earth Science AI'}
              </h2>
              <p className="text-[10px] font-medium text-emerald-800/80">
                Context-aware research assistant
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClearChat}
            className="rounded-lg p-1.5 text-emerald-800/70 transition-colors hover:bg-orange-500/10 hover:text-orange-700"
            title="Clear conversation"
            aria-label="Clear conversation"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-2.5 space-y-1 rounded-2xl border border-emerald-300/70 bg-white/75 p-2.5 shadow-xs backdrop-blur-sm">
          <div className="flex items-center gap-2 text-[11px]">
            <MapPin className="h-3 w-3 shrink-0 text-emerald-600" />
            <span className="truncate font-bold text-slate-800">{region.name}</span>
            {isRadiusLocked && <Lock className="h-2.5 w-2.5 text-emerald-600" />}
          </div>
          <div className="flex items-center gap-3 text-[10px] font-medium text-emerald-800/70">
            <span className="flex items-center gap-1">
              <Circle className="h-2.5 w-2.5 text-emerald-500" />
              {radiusKm} km radius
            </span>
            <span className="flex min-w-0 items-center gap-1 truncate">
              <Layers className="h-2.5 w-2.5 shrink-0 text-teal-600" />
              {variableName}
            </span>
          </div>
        </div>
      </div>

      <div
        ref={chatContainerRef}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-gradient-to-b from-emerald-50/60 via-emerald-100/40 to-emerald-200/50 px-4 py-3 scroll-smooth"
        aria-live="polite"
      >
        {messages.map((message, index) => (
          <div
            key={`${message.time}-${index}`}
            className={`flex gap-2.5 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-emerald-300 bg-emerald-100 text-emerald-800">
                <Bot className="h-4 w-4" />
              </div>
            )}
            <div className={`min-w-0 max-w-[85%] break-words rounded-2xl px-4 py-3 text-xs leading-relaxed ${message.role === 'user' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md' : 'border border-slate-200 bg-[#f8faf9] text-slate-800 shadow-xs'}`}>
              <p className="whitespace-pre-wrap">{message.text}</p>
              {message.provenance && (
                <p className="mt-2 border-t border-slate-200 pt-1.5 text-[9px] text-emerald-800">
                  Source: {message.provenance}
                </p>
              )}
              <div className={`mt-1.5 text-[9px] font-mono ${message.role === 'user' ? 'text-orange-100 text-right' : 'text-slate-400'}`}>
                {message.time}
              </div>
            </div>
            {message.role === 'user' && (
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-orange-300 bg-orange-100 text-orange-800">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {chatLoading && (
          <div className="flex gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-emerald-300 bg-emerald-100 text-emerald-800">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-[#f8faf9] px-4 py-3 text-xs text-slate-500">
              <span className="h-2 w-2 animate-ping rounded-full bg-emerald-500" />
              Retrieving Earth-observation evidence and preparing an answer...
            </div>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-emerald-300/70 bg-white/60 px-3.5 py-2">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {QUICK_PROMPTS.map(prompt => (
            <button
              key={prompt}
              type="button"
              disabled={chatLoading}
              onClick={() => void handleSendMessage(undefined, prompt)}
              className="whitespace-nowrap rounded-xl border border-emerald-300/70 bg-white/80 px-2.5 py-1.5 text-[10px] font-bold text-emerald-900 transition-colors hover:border-orange-400/70 hover:text-orange-700 disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <form
        onSubmit={event => void handleSendMessage(event)}
        className="shrink-0 border-t border-emerald-300/70 bg-white/80 p-3.5 backdrop-blur-sm"
      >
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputMessage}
            onChange={event => setInputMessage(event.target.value)}
            placeholder="Ask Earth Science AI..."
            disabled={chatLoading}
            className="w-full rounded-2xl border border-emerald-300/70 bg-emerald-50/70 px-4 py-3 pr-12 text-xs font-medium text-emerald-950 shadow-inner placeholder:text-emerald-700/50 focus:border-emerald-500 focus:bg-white focus:outline-none disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || chatLoading}
            className="absolute right-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 p-2.5 text-white shadow-sm transition-all hover:from-orange-600 hover:to-amber-600 disabled:opacity-40"
            title="Send message"
            aria-label="Send message"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default ExploreChatPanel;
