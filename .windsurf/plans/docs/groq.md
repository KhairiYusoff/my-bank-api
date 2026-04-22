# Groq — LLM Provider

> Docs: https://ai-sdk.dev/providers/ai-sdk-providers/groq
> API Console: https://console.groq.com

## Install

```bash
npm install @ai-sdk/groq ai
```

## Environment

```env
GROQ_API_KEY=gsk_xxxxxxxxxxxx
```

## Recommended Models

| Model | Context | Best for |
|---|---|---|
| `llama-3.3-70b-versatile` | 128k | General chat, RAG answers |
| `deepseek-r1-distill-llama-70b` | 128k | Reasoning tasks |
| `llama-3.1-8b-instant` | 128k | Fast / low-latency |
| `qwen/qwen3-32b` | 128k | Reasoning with `reasoningFormat` |

## Provider Instance

```js
import { groq } from '@ai-sdk/groq';
// Uses GROQ_API_KEY env var automatically

// Custom setup (e.g. proxy):
import { createGroq } from '@ai-sdk/groq';
const groq = createGroq({ baseURL: 'https://your-proxy/v1' });
```

## Usage — Express Route (Streaming)

```js
import { groq } from '@ai-sdk/groq';
import { streamText, convertToModelMessages } from 'ai';

router.post('/chat', authenticate, async (req, res) => {
  const { messages } = req.body;

  const result = streamText({
    model: groq('llama-3.3-70b-versatile'),
    system: 'You are a helpful banking assistant. Only answer questions about banking and financial topics.',
    messages: convertToModelMessages(messages),
    maxTokens: 1024,
  });

  result.pipeDataStreamToResponse(res);
});
```

## Usage — generateText (non-streaming, internal)

```js
import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';

const { text } = await generateText({
  model: groq('llama-3.3-70b-versatile'),
  prompt: 'Summarize this transaction history: ...',
  maxTokens: 512,
});
```

## Rate Limits (Free Tier)

- 14,400 requests/day
- 30 requests/minute
- Token limits vary by model — check console.groq.com/settings/limits

## Key Rules

- Always set `system` prompt to constrain answers to banking context
- Always set `maxTokens` to control cost and response size
- Use `llama-3.3-70b-versatile` for Phase 1 default
- Switch to `llama-3.1-8b-instant` if latency becomes an issue
- Do NOT expose `GROQ_API_KEY` to the client — server-side only
- `GROQ_API_KEY` is read automatically from env — no need to pass explicitly
