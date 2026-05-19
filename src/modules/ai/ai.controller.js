const { streamChatResponse, generateInsightsText } = require("./ai.service");
const { getSpendingBreakdown } = require("./ai.tools");
const { maskSpendingDataForLLM } = require("./ai.guardrails");
const { success, error } = require("../../shared/utils/response");

const ALLOWED_PERIODS = ["week", "month", "quarter", "year"];

exports.chat = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return error(res, {
        message: "messages array is required",
        statusCode: 400,
      });
    }

    const result = await streamChatResponse(messages, req.user);

    result.pipeUIMessageStreamToResponse(res);
  } catch (err) {
    console.error("[AI] chat error:", err);
    return error(res, { message: "AI service error", statusCode: 500 });
  }
};

exports.getInsights = async (req, res) => {
  try {
    const period = req.query.period || "month";

    if (!ALLOWED_PERIODS.includes(period)) {
      return error(res, {
        message: `Invalid period. Allowed values: ${ALLOWED_PERIODS.join(", ")}`,
        statusCode: 400,
      });
    }

    const spendData = await getSpendingBreakdown(req.user._id, period);
    const maskedData = maskSpendingDataForLLM(spendData);
    const aiNarrative = await generateInsightsText(maskedData);

    return success(res, {
      data: {
        ...spendData,
        aiNarrative,
      },
    });
  } catch (err) {
    console.error("[AI] insights error:", err);
    return error(res, { message: "AI insights error", statusCode: 500 });
  }
};
