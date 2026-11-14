'use client';

import React, { useState, useRef, useEffect } from 'react';
import { GeographicRegion } from '@/types';
import {
  Sparkles,
  Send,
  MapPin,
  Lock,
  RotateCcw,
  Compass,
  Bot,
  User,
  ArrowRight,
  Layers,
  Circle,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  provenance?: string;
}

interface Props {
  region: GeographicRegion;
  variable: string;
  variableName: string;
  radiusKm: number;
  isRadiusLocked: boolean;
}

const QUICK_PROMPTS = [
  'What environmental trends should I expect here?',
  'Which NASA datasets cover this area?',
  'Is this region experiencing warming or cooling?',
  'What statistical methods should I use?',
  'Are there any known climate risks here?',
];

export function ExploreChatPanel({
  region,
  variable,
  variableName,
  radiusKm,
  isRadiusLocked,
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat container to latest message without scrolling outer page window
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // When the region coordinates or name changes, add a contextual system note
  const prevCoordRef = useRef<string>(`${region.center[0].toFixed(3)},${region.center[1].toFixed(3)}`);
  const prevNameRef = useRef<string>(region.name);

  useEffect(() => {
    const coordKey = `${region.center[0].toFixed(3)},${region.center[1].toFixed(3)}`;
    const coordChanged = coordKey !== prevCoordRef.current;
    const nameChanged = region.name !== prevNameRef.current && !region.name.startsWith('Location (');

    if (coordChanged || nameChanged) {
      prevCoordRef.current = coordKey;
      prevNameRef.current = region.name;
      const systemMsg: ChatMessage = {
        id: `sys-${Date.now()}`,
        role: 'system',
        content: `📍 Location context updated — now investigating **${region.name}** (${region.center[1].toFixed(3)}°N, ${region.center[0].toFixed(3)}°E) within a ${radiusKm} km buffer.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, systemMsg]);
    }
  }, [region.name, region.center, radiusKm]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/explore/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: text,
          region: {
            name: region.name,
            geometryType: region.geometryType,
            coordinates: region.coordinates,
            center: region.center,
          },
          variable,
        }),
      });

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.answer || 'I evaluated your inquiry against current satellite indicators.',
        timestamp: new Date(),
        provenance: data.provenance,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'Unable to reach the science AI reasoning agent. Using local heuristics and historical reanalysis baseline.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  // Simple markdown-like rendering (bold, inline code, bullet points, headings)
  const renderContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      // Heading H3
      if (line.startsWith('### ')) {
        return (
          <h3 key={i} className="text-sm font-bold text-slate-900 mt-2 mb-1">
            {renderInline(line.slice(4))}
          </h3>
        );
      }
      // Heading H2
      if (line.startsWith('## ')) {
        return (
          <h2 key={i} className="text-sm font-bold text-emerald-800 mt-2 mb-1">
            {renderInline(line.slice(3))}
          </h2>
        );
      }
      // Bullet
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <div key={i} className="flex gap-2 mt-0.5">
            <span className="text-emerald-600 mt-0.5 shrink-0">•</span>
            <span>{renderInline(line.slice(2))}</span>
          </div>
        );
      }
      // Numbered
      if (/^\d+\.\s/.test(line)) {
        const match = line.match(/^(\d+)\.\s(.*)$/);
        if (match) {
          return (
            <div key={i} className="flex gap-2 mt-0.5">
              <span className="text-emerald-700 font-mono text-[11px] mt-0.5 shrink-0 w-4 text-right font-bold">{match[1]}.</span>
              <span>{renderInline(match[2])}</span>
            </div>
          );
        }
      }
      // Block quote
      if (line.startsWith('> ')) {
        return (
          <div key={i} className="border-l-2 border-emerald-500/40 pl-3 my-1 text-slate-600 italic">
            {renderInline(line.slice(2))}
          </div>
        );
      }
      // Empty line
      if (line.trim() === '') return <div key={i} className="h-1.5" />;
      // Normal
      return <p key={i} className="mt-0.5">{renderInline(line)}</p>;
    });
  };

  const renderInline = (text: string): React.ReactNode => {
    // Bold **text**
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="rounded bg-slate-100 border border-slate-200 px-1 py-0.5 text-[11px] text-emerald-800 font-mono font-bold">{part.slice(1, -1)}</code>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="flex flex-col h-full rounded-3xl border border-slate-200/80 bg-white/95 shadow-[6px_6px_20px_rgba(0,0,0,0.03),-4px_-4px_16px_rgba(255,255,255,0.9)] backdrop-blur-md overflow-hidden">
      {/* Panel Header */}
      <div className="border-b border-slate-100 bg-[#f8faf9] px-4 py-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 shadow-xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900">Earth Science AI</h2>
              <p className="text-[10px] text-slate-500 font-medium">Context-aware research assistant</p>
            </div>
          </div>
          <button
            onClick={handleClearChat}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            title="Clear conversation"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Live Context Badge */}
        <div className="mt-2.5 rounded-2xl border border-slate-200/80 bg-white p-2.5 space-y-1 shadow-xs">
          <div className="flex items-center gap-2 text-[11px]">
            <MapPin className="h-3 w-3 text-emerald-600 shrink-0" />
            <span className="text-slate-800 truncate font-bold">{region.name}</span>
            {isRadiusLocked && <Lock className="h-2.5 w-2.5 text-emerald-600" />}
          </div>
          <div className="flex items-center gap-3 text-[10px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <Circle className="h-2.5 w-2.5 text-emerald-500" />
              {radiusKm} km radius
            </span>
            <span className="flex items-center gap-1">
              <Layers className="h-2.5 w-2.5 text-teal-600" />
              {variableName}
            </span>
          </div>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-6 gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-800">
              <Compass className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Ask about this location</p>
              <p className="text-[11px] text-slate-500 mt-0.5 max-w-[220px]">
                Select a point on the map and ask about trends, datasets, or climate risks in that area.
              </p>
            </div>
            <div className="w-full space-y-1.5 mt-1">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(prompt)}
                  className="w-full text-left rounded-xl border border-slate-200 bg-[#f8faf9] hover:bg-white hover:border-emerald-400 p-2.5 text-[11px] font-medium text-slate-700 hover:text-slate-900 transition-all flex items-center gap-2 shadow-xs"
                >
                  <ArrowRight className="h-3 w-3 text-emerald-600 shrink-0" />
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 mt-0.5">
                <Bot className="h-3.5 w-3.5" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[12px] leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-br-md shadow-md'
                  : msg.role === 'system'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium w-full max-w-full'
                  : 'bg-[#f8faf9] border border-slate-200 text-slate-800 rounded-bl-md shadow-xs'
              }`}
            >
              {msg.role === 'assistant' ? (
                <div className="space-y-0.5">{renderContent(msg.content)}</div>
              ) : (
                renderInline(msg.content)
              )}
              {msg.provenance && (
                <div className="mt-2 pt-2 border-t border-slate-200/80 text-[9px] text-slate-500 font-mono">
                  Source: {msg.provenance}
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-orange-100 border border-orange-300 text-orange-800 mt-0.5">
                <User className="h-3.5 w-3.5" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 mt-0.5">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div className="rounded-2xl bg-[#f8faf9] border border-slate-200 px-4 py-3 rounded-bl-md shadow-xs">
              <div className="flex gap-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="border-t border-slate-100 bg-white p-3 shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder={`Ask about ${region.name}...`}
            disabled={isLoading}
            className="flex-1 rounded-2xl border border-slate-200 bg-[#f8faf9] px-4 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none disabled:opacity-50 shadow-inner"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
