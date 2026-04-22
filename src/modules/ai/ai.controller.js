const { streamChatResponse } = require('./ai.service');
const { error } = require('../../shared/utils/response');

const chat = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return error(res, { message: 'messages array is required', statusCode: 400 });
    }

    const result = await streamChatResponse(messages, req.user);

    result.pipeUIMessageStreamToResponse(res);
  } catch (err) {
    console.error('[AI] chat error:', err);
    return error(res, { message: 'AI service error', statusCode: 500 });
  }
};

module.exports = { chat };
