# Vercel AI SDK — Frontend Chat (`useChat`)

> Docs: https://ai-sdk.dev/docs/ai-sdk-ui/chatbot
> Version: AI SDK **v6.x** (latest as of 2026)

## Install

```bash
# Backend (my-bank-api)
npm install ai @ai-sdk/groq

# Frontend (my-bank-customer)
npm install ai @ai-sdk/react
```

## Core Concept

- **Frontend**: `useChat` from `@ai-sdk/react` manages message state + streaming UI
- **Backend**: `streamText` + `result.pipeDataStreamToResponse(res)` streams to client
- **Transport**: HTTP POST (default `/api/chat`) using Vercel AI data stream protocol

## Frontend — React Component (TypeScript)

```tsx
'use client';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState } from 'react';

export function ChatWidget() {
  const { messages, sendMessage, status, stop, error, regenerate } = useChat({
    transport: new DefaultChatTransport({
      api: `${import.meta.env.VITE_API_URL}/ai/chat`,
      headers: () => ({
        Authorization: `Bearer ${getAuthToken()}`,
      }),
    }),
    onError: (error) => {
      console.error('Chat error:', error);
    },
    onFinish: ({ message }) => {
      // Called when full response received
    },
  });

  const [input, setInput] = useState('');

  return (
    <div>
      {messages.map((message) => (
        <div key={message.id}>
          <strong>{message.role === 'user' ? 'You' : 'AI'}:</strong>{' '}
          {/* v6: render via message.parts — NOT message.content */}
          {message.parts.map((part, i) =>
            part.type === 'text' ? <span key={i}>{part.text}</span> : null
          )}
        </div>
      ))}

      {error && (
        <>
          <div>Something went wrong.</div>
          <button onClick={() => regenerate()}>Retry</button>
        </>
      )}

      {(status === 'submitted' || status === 'streaming') && (
        <button onClick={stop}>Stop</button>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim()) {
            sendMessage({ text: input });
            setInput('');
          }
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={status !== 'ready'}
          placeholder="Ask about your accounts..."
        />
        <button type="submit" disabled={status !== 'ready'}>
          Send
        </button>
      </form>
    </div>
  );
}
```

## Backend — Express Route (Node.js)

```js
// src/modules/ai/ai.routes.js
import { groq } from '@ai-sdk/groq';
import { streamText, convertToModelMessages } from 'ai';

router.post('/chat', authenticate, async (req, res) => {
  const { messages } = req.body;
  const userId = req.user._id;

  const result = streamText({
    model: groq('llama-3.3-70b-versatile'),
    system: buildSystemPrompt(userId),
    messages: convertToModelMessages(messages), // UIMessage[] → ModelMessage[]
    maxTokens: 1024,
  });

  // Pipe AI SDK data stream to Express response
  result.pipeDataStreamToResponse(res);
});
```

## `useChat` Hook — Full API Reference

| Property | Type | Description |
|---|---|---|
| `messages` | `UIMessage[]` | All messages in conversation |
| `sendMessage(msg, opts?)` | function | Send a new message |
| `status` | `'ready' \| 'streaming' \| 'submitted' \| 'error'` | Current stream state |
| `stop()` | function | Abort current stream |
| `regenerate()` | function | Re-run last assistant message |
| `setMessages(msgs)` | function | Mutate message history directly |
| `error` | `Error \| undefined` | Error object if status='error' |

## Status Flow

```
'ready' → (user sends) → 'submitted' → (stream starts) → 'streaming' → (done) → 'ready'
                                                                              ↘ 'error'
```

## Sending Auth Token (Recommended Pattern)

```tsx
// Request-level options — most reliable (takes precedence over hook-level)
sendMessage(
  { text: input },
  {
    headers: { Authorization: `Bearer ${getAuthToken()}` },
    body: { userId: currentUser._id },
  }
);
```

## Key Rules

- Import `useChat` from `@ai-sdk/react` — NOT from `ai` directly
- **v6 breaking change**: render messages via `message.parts`, NOT `message.content`
- Always disable input when `status !== 'ready'`
- Show stop button when `status === 'streaming' || status === 'submitted'`
- Show generic error message to user — never expose raw server error
- Backend must call `convertToModelMessages(messages)` before passing to `streamText`
- `pipeDataStreamToResponse(res)` handles all streaming headers automatically
