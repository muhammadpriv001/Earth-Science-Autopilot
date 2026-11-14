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
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
          message: text,
          region,
          variable,
          radiusKm,
          isRadiusLocked,
        }),
      });

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'I was unable to generate a response for this context.',
        timestamp: new Date(),
        provenance: data.provenance,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'Network error — the AI service is unreachable. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errMsg]);
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
          <h3 key={i} className="text-sm font-bold text-white mt-3 mb-1">
            {renderInline(line.slice(4))}
          </h3>
        );
      }
      // Heading H2
      if (line.startsWith('## ')) {
        return (
          <h2 key={i} className="text-sm font-bold text-cyan-300 mt-3 mb-1">
            {renderInline(line.slice(3))}
          </h2>
        );
      }
      // Bullet
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <div key={i} className="flex gap-2 mt-0.5">
            <span className="text-cyan-500 mt-0.5 shrink-0">•</span>
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
              <span className="text-cyan-400 font-mono text-[11px] mt-0.5 shrink-0 w-4 text-right">{match[1]}.</span>
              <span>{renderInline(match[2])}</span>
            </div>
          );
        }
      }
      // Block quote
      if (line.startsWith('> ')) {
        return (
          <div key={i} className="border-l-2 border-cyan-500/40 pl-3 my-1 text-slate-300 italic">
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
        return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="rounded bg-slate-800 px-1 py-0.5 text-[11px] text-cyan-300 font-mono">{part.slice(1, -1)}</code>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="flex flex-col h-full rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden">
      {/* Panel Header */}
      <div className="border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-xl px-4 py-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-md">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white">Earth Science AI</h2>
              <p className="text-[10px] text-slate-400">Context-aware research assistant</p>
            </div>
          </div>
          <button
            onClick={handleClearChat}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-900 hover:text-white transition-colors"
            title="Clear conversation"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Live Context Badge */}
        <div className="mt-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-2.5 space-y-1.5">
          <div className="flex items-center gap-2 text-[11px]">
            <MapPin className="h-3 w-3 text-cyan-400 shrink-0" />
            <span className="text-slate-300 truncate font-medium">{region.name}</span>
            {isRadiusLocked && <Lock className="h-2.5 w-2.5 text-cyan-400" />}
          </div>
          <div className="flex items-center gap-3 text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <Circle className="h-2.5 w-2.5 text-cyan-500/60" />
              {radiusKm} km radius
            </span>
            <span className="flex items-center gap-1">
              <Layers className="h-2.5 w-2.5 text-cyan-500/60" />
              {variableName}
            </span>
          </div>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-6 gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-400/20">
              <Compass className="h-7 w-7 text-cyan-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Ask about this location</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[220px]">
                Select a point on the map and ask about trends, datasets, or climate risks in that area.
              </p>
            </div>
            <div className="w-full space-y-1.5 mt-2">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(prompt)}
                  className="w-full text-left rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 p-2.5 text-[11px] text-slate-300 hover:text-white transition-colors flex items-center gap-2"
                >
                  <ArrowRight className="h-3 w-3 text-cyan-400 shrink-0" />
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-500/15 border border-cyan-400/20 mt-0.5">
                <Bot className="h-3.5 w-3.5 text-cyan-400" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[12px] leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-md'
                  : msg.role === 'system'
                  ? 'bg-slate-900/60 border border-slate-800 text-slate-400 text-[11px] italic w-full max-w-full'
                  : 'bg-slate-900/80 border border-slate-800 text-slate-200 rounded-bl-md'
              }`}
            >
              {msg.role === 'assistant' ? (
                <div className="space-y-0.5">{renderContent(msg.content)}</div>
              ) : (
                renderInline(msg.content)
              )}
              {msg.provenance && (
                <div className="mt-2 pt-2 border-t border-slate-700/60 text-[9px] text-slate-500 font-mono">
                  Source: {msg.provenance}
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 border border-slate-700 mt-0.5">
                <User className="h-3.5 w-3.5 text-slate-300" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-500/15 border border-cyan-400/20 mt-0.5">
              <Bot className="h-3.5 w-3.5 text-cyan-400" />
            </div>
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 px-4 py-3 rounded-bl-md">
              <div className="flex gap-1.5">
                <div className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <div className="border-t border-slate-800/80 bg-slate-950/95 p-3 shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder={`Ask about ${region.name}...`}
            disabled={isLoading}
            className="flex-1 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

