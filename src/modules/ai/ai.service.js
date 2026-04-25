const fs = require("fs");
const path = require("path");
const {
  getSpendingBreakdown,
  getTransactionHistory,
  getAccountSummary,
  getUserProfile,
  getActivitySummary,
} = require("./ai.tools");
const {
  maskSpendingDataForLLM,
  maskTransactionsForLLM,
  maskUserProfileForLLM,
  maskActivityForLLM,
} = require("./ai.guardrails");

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

const buildSystemPrompt = (user) => {
  return `
You are a helpful and professional banking assistant for MyBank.
You assist customers with questions about their accounts, transactions, and banking products.
Always be polite, concise, and accurate. Do not make up information.
If you do not know the answer, advise the customer to contact MyBank support.

MyBank Product Information:
${productDocs}

You have access to the following tools to look up real-time data for this customer:
- getSpendingBreakdown: spending by category for a given period (week/month/quarter/year)
- getTransactionHistory: recent transactions filtered by type, date range, or limit
- getAccountSummary: account balances, types, and statuses
- getUserProfile: customer profile details (no personal identifiers)
- getActivitySummary: recent account activity events (logins, transfers, deposits, etc.)

Use tools when the customer asks about their finances. Do not guess — call the tool.
Always end responses that contain financial advice with: "This is not financial advice."

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
  const { z } = await import("zod");

  const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

  const userId = user._id;

  const result = streamText({
    model: groq("llama-3.1-8b-instant"),
    system: buildSystemPrompt(user),
    messages: await convertToModelMessages(messages),
    maxTokens: 512,
    temperature: 0.5,
    maxSteps: 3,
    tools: {
      getSpendingBreakdown: {
        description:
          "Get the user's spending breakdown by category for a given period.",
        parameters: z.object({
          period: z.enum(["week", "month", "quarter", "year"]).default("month"),
        }),
        execute: async ({ period }) => {
          const raw = await getSpendingBreakdown(userId, period);
          return maskSpendingDataForLLM(raw);
        },
      },
      getTransactionHistory: {
        description:
          "Get the user's recent transactions, optionally filtered by type and date.",
        parameters: z.object({
          type: z
            .enum(["deposit", "withdrawal", "transfer", "airdrop"])
            .optional(),
          from: z.string().optional().describe("ISO date string YYYY-MM-DD"),
          to: z.string().optional().describe("ISO date string YYYY-MM-DD"),
          limit: z.number().int().min(1).max(50).default(10),
        }),
        execute: async (filters) => {
          const raw = await getTransactionHistory(userId, filters);
          return maskTransactionsForLLM(raw);
        },
      },
      getAccountSummary: {
        description: "Get the user's account balances, types, and statuses.",
        parameters: z.object({}),
        execute: async () => {
          return getAccountSummary(userId);
        },
      },
      getUserProfile: {
        description:
          "Get the user's non-sensitive profile details: location, job, age, nationality, account status.",
        parameters: z.object({}),
        execute: async () => {
          const raw = await getUserProfile(userId);
          return maskUserProfileForLLM(raw);
        },
      },
      getActivitySummary: {
        description:
          "Get the user's recent account activity events such as logins, transfers, deposits.",
        parameters: z.object({
          action: z
            .string()
            .optional()
            .describe("Event type e.g. LOGIN, TRANSFER_COMPLETED, DEPOSIT"),
          from: z.string().optional().describe("ISO date string YYYY-MM-DD"),
          to: z.string().optional().describe("ISO date string YYYY-MM-DD"),
          limit: z.number().int().min(1).max(20).default(10),
        }),
        execute: async (filters) => {
          const raw = await getActivitySummary(userId, filters);
          return maskActivityForLLM(raw);
        },
      },
    },
  });

  return result;
};

module.exports = { streamChatResponse, generateInsightsText };
