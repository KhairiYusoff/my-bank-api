const fs = require("fs");
const path = require("path");
const { getSpendingBreakdown } = require("./ai.tools");
const { maskSpendingDataForLLM } = require("./ai.guardrails");

// Polyfill Web Streams API globals for Node 16 (required by ai/eventsource-parser)
if (typeof TransformStream === "undefined") {
  const {
    TransformStream,
    ReadableStream,
    WritableStream,
    TextEncoderStream,
    TextDecoderStream,
  } = require("stream/web");
  global.TransformStream = TransformStream;
  global.ReadableStream = ReadableStream;
  global.WritableStream = WritableStream;
  global.TextEncoderStream = TextEncoderStream;
  global.TextDecoderStream = TextDecoderStream;
}

// Polyfill structuredClone for Node 16 (added in Node 17)
if (typeof structuredClone === "undefined") {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

// Polyfill Fetch API globals for Node 16 (required by ai SDK and @ai-sdk/groq)
if (typeof Headers === "undefined") {
  const { Headers, fetch, Request, Response } = require("undici");
  global.Headers = Headers;
  global.fetch = fetch;
  global.Request = Request;
  global.Response = Response;
}

// Load product documentation at startup for system prompt context
const docsDir = path.join(__dirname, "../../shared/docs");
const productDocs = [
  "product-savings.md",
  "product-current.md",
  "product-fd.md",
]
  .map((file) => {
    try {
      return fs.readFileSync(path.join(docsDir, file), "utf-8");
    } catch {
      return "";
    }
  })
  .filter(Boolean)
  .join("\n\n---\n\n");

const buildSystemPrompt = (user, spendContext = null) => {
  const spendSection = spendContext
    ? `
Current month spending summary (pre-anonymised — no account numbers):
- Total spent: ${spendContext.totalSpent} (period: last ${spendContext.period})
- Top categories: ${spendContext.topCategories.map((c) => `${c.category} ${c.pct}%`).join(", ")}
- Accounts on file: ${spendContext.accounts.map((a) => `${a.accountType} (${a.currency} ${a.balance})`).join(", ")}

Use this data to answer questions like "how much did I spend on food?" accurately.
`
    : `
For account-specific queries (balances, transactions), remind the customer to check the app dashboard.
`;

  return `
You are a helpful and professional banking assistant for MyBank.
You assist customers with questions about their accounts, transactions, and banking products.
Always be polite, concise, and accurate. Do not make up information.
If you do not know the answer, advise the customer to contact MyBank support.

MyBank Product Information:
${productDocs}
${spendSection}
Guidelines:
- Only discuss banking topics relevant to MyBank products and services.
- Never ask for or repeat sensitive information such as passwords or full card numbers.
- Keep responses brief and helpful.
`.trim();
};

/**
 * Generate a one-shot AI narrative for a user's spending data.
 * Uses generateText() (not streaming) — designed for the insights card.
 *
 * @param {object} maskedSpendData - Output of maskSpendingDataForLLM()
 * @returns {Promise<string>} Plain-text narrative (3-4 sentences)
 */
const generateInsightsText = async (maskedSpendData) => {
  const { createGroq } = await import("@ai-sdk/groq");
  const { generateText } = await import("ai");

  const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

  const prompt = `You are a personal finance analyst for MyBank.
Analyse the following spending data and write a brief, friendly narrative summary (3-4 sentences).
Highlight the top spending category, any notable pattern, and one actionable saving tip.
Respond in plain text only — no markdown, no bullet points, no headers.

Spending data:
${JSON.stringify(maskedSpendData, null, 2)}`.trim();

  const { text } = await generateText({
    model: groq("llama-3.1-8b-instant"),
    prompt,
    maxTokens: 200,
    temperature: 0.4,
  });

  return text;
};

/**
 * Stream a chat response using the Groq LLM via the AI SDK.
 * Uses dynamic import because the 'ai' and '@ai-sdk/groq' packages are ESM-only.
 *
 * @param {Array<{role: string, content: string}>} messages
 * @param {Object} user - authenticated user object from req.user
 * @returns {Promise<import('ai').StreamTextResult>}
 */
const streamChatResponse = async (messages, user) => {
  const { createGroq } = await import("@ai-sdk/groq");
  const { streamText, convertToModelMessages } = await import("ai");

  const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY,
  });

  // Fetch spend context for this user — non-critical, proceed without if it fails
  let spendContext = null;
  try {
    const rawSpend = await getSpendingBreakdown(user._id, "month");
    spendContext = maskSpendingDataForLLM(rawSpend);
  } catch (err) {
    console.warn("[AI] Could not load spend context for chat:", err.message);
  }

  const result = streamText({
    model: groq("llama-3.1-8b-instant"),
    system: buildSystemPrompt(user, spendContext),
    messages: await convertToModelMessages(messages),
    maxTokens: 512,
    temperature: 0.5,
  });

  return result;
};

module.exports = { streamChatResponse, generateInsightsText };
