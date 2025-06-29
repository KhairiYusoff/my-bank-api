const axios = require("axios");

async function sendNotification(notification) {
  const NOTIFICATION_API_URL =
    process.env.NOTIFICATION_API_URL ||
    "http://localhost:4001/api/notifications";
  const NOTIFICATION_API_KEY = process.env.NOTIFICATION_API_KEY;
  if (!NOTIFICATION_API_KEY) {
    console.error("NOTIFICATION_API_KEY is not set in environment variables.");
    return null;
  }

  try {
    const response = await axios.post(NOTIFICATION_API_URL, notification, {
      headers: {
        "x-api-key": NOTIFICATION_API_KEY,
        "Content-Type": "application/json",
      },
      timeout: 5000,
    });
    return response.data;
  } catch (err) {
    // Log but do not throw to avoid blocking main flow
    console.error(
      "Failed to send notification:",
      err.response?.data || err.message
    );
    return null;
  }
}

module.exports = {
  sendNotification,
};
