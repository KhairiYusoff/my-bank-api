const fs = require('fs');
const path = require('path');

// Polyfill Web Streams API globals for Node 16 (required by ai/eventsource-parser)
if (typeof TransformStream === 'undefined') {
  const {
    TransformStream,
    ReadableStream,
    WritableStream,
    TextEncoderStream,
    TextDecoderStream,
  } = require('stream/web');
  global.TransformStream = TransformStream;
  global.ReadableStream = ReadableStream;
  global.WritableStream = WritableStream;
  global.TextEncoderStream = TextEncoderStream;
  global.TextDecoderStream = TextDecoderStream;
}

// Polyfill Fetch API globals for Node 16 (required by ai SDK and @ai-sdk/groq)
if (typeof Headers === 'undefined') {
  const { Headers, fetch, Request, Response } = require('undici');
  global.Headers = Headers;
  global.fetch = fetch;
  global.Request = Request;
  global.Response = Response;
}

// Load product documentation at startup for system prompt context
const docsDir = path.join(__dirname, '../../shared/docs');
const productDocs = ['product-savings.md', 'product-current.md', 'product-fd.md']
  .map((file) => {
    try {
      return fs.readFileSync(path.join(docsDir, file), 'utf-8');
    } catch {
      return '';
    }
  })
  .filter(Boolean)
  .join('\n\n---\n\n');

const buildSystemPrompt = (user) => `
You are a helpful and professional banking assistant for MyBank.
You assist customers with questions about their accounts, transactions, and banking products.
Always be polite, concise, and accurate. Do not make up information.
If you do not know the answer, advise the customer to contact MyBank support.

The customer you are speaking with:
- Name: ${user.name || 'Valued Customer'}
- Email: ${user.email || 'N/A'}

MyBank Product Information:
${productDocs}

Guidelines:
- Only discuss banking topics relevant to MyBank products and services.
- Never ask for or repeat sensitive information such as passwords or full card numbers.
- For account-specific queries (balances, transactions), remind the customer to check the app dashboard.
- Keep responses brief and helpful.
`.trim();

/**
 * Stream a chat response using the Groq LLM via the AI SDK.
 * Uses dynamic import because the 'ai' and '@ai-sdk/groq' packages are ESM-only.
 *
 * @param {Array<{role: string, content: string}>} messages
 * @param {Object} user - authenticated user object from req.user
 * @returns {Promise<import('ai').StreamTextResult>}
 */
const streamChatResponse = async (messages, user) => {
  const { createGroq } = await import('@ai-sdk/groq');
  const { streamText, convertToModelMessages } = await import('ai');

  const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY,
  });

  const result = streamText({
    model: groq('llama-3.1-8b-instant'),
    system: buildSystemPrompt(user),
    messages: await convertToModelMessages(messages),
    maxTokens: 512,
    temperature: 0.5,
  });

  return result;
};

module.exports = { streamChatResponse };
