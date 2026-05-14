const axios = require("axios");
const { error } = require("../../shared/utils/response");

const NOTIFICATION_API_URL =
  process.env.NOTIFICATION_API_URL || "http://localhost:4001/api/notifications";

exports.proxyNotificationRequest = async (req, res) => {
  try {
    const { method, body, query } = req;

    // Construct the URL for the microservice
    const url = req.params.id
      ? `${NOTIFICATION_API_URL}/${req.params.id}`
      : NOTIFICATION_API_URL;

    // Build a Cookie header string from the parsed cookie object so the
    // notification-service cookie-parser can reconstruct req.cookies correctly.
    const cookieHeader = Object.entries(req.cookies || {})
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");

    const response = await axios({
      method,
      url,
      data: body,
      params: query,
      headers: {
        ...(cookieHeader && { Cookie: cookieHeader }),
        "Content-Type": "application/json",
      },
      withCredentials: true,
      timeout: 5000,
      validateStatus: () => true,
    });

    return res.status(response.status).json(response.data);
  } catch (err) {
    console.error("Notification Proxy Error:", err.message);
    return error(res, {
      message: "Failed to communicate with notification service",
      statusCode: 502,
    });
  }
};
