// ==============================================================================
// THE EARTH SCIENCE AUTOPILOT — GROQ INFERENCE CLIENT
// ==============================================================================
// Groq retires models regularly, which previously made every AI request fall
// back to a static template. This helper negotiates the live model catalogue:
// it tries the configured model first, then a short preference list, and only
// reports failure once every candidate has been rejected.
//
// Server-only: the API key must never reach the browser.
// ==============================================================================

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqResult {
  content: string;
  model: string;
}

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/** Models observed as available on the GroqAPI catalogue, best first. */
const MODEL_PREFERENCE = ['openai/gpt-oss-120b', 'qwen/qwen3.8-27b', 'openai/gpt-oss-20b'];

export function getGroqApiKey(): string | undefined {
  const key = process.env.AI_API_KEY;
  return key && key.startsWith('gsk_') ? key : undefined;
}

export function isGroqConfigured(): boolean {
  return Boolean(getGroqApiKey());
}

function candidateModels(): string[] {
  const configured = process.env.AI_MODEL;
  const models = [
    configured && configured.startsWith('llama-3.3') ? undefined : configured,
    ...MODEL_PREFERENCE,
  ].filter((m): m is string => Boolean(m));
  return [...new Set(models)];
}

export interface GroqRequest {
  messages: GroqMessage[];
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  /** Set to "json_object" when the caller expects strict JSON back. */
  responseFormat?: 'json_object';
}

/**
 * Calls Groq chat completions, walking the model preference list until one is
 * accepted. Returns null when the provider is unconfigured or every model fails.
 */
export async function generateGroqCompletion(req: GroqRequest): Promise<GroqResult | null> {
  const apiKey = getGroqApiKey();
  if (!apiKey) return null;

  const timeoutMs = req.timeoutMs ?? 25000;

  for (const model of candidateModels()) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          messages: req.messages,
          temperature: req.temperature ?? 0.3,
          max_tokens: req.maxTokens ?? 900,
          ...(req.responseFormat ? { response_format: { type: req.responseFormat } } : {}),
        }),
      });

      if (!res.ok) {
        const detail = await res.text().catch(() => '');
        console.warn(`Groq model ${model} rejected (HTTP ${res.status}): ${detail.slice(0, 160)}`);
        continue;
      }

      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (typeof content === 'string' && content.trim().length > 0) {
        return { content: content.trim(), model };
      }
    } catch (err) {
      console.warn(`Groq model ${model} failed:`, err instanceof Error ? err.message : err);
    } finally {
      clearTimeout(timer);
    }
  }

  return null;
}
