const axios = require("axios");
const { error } = require("../../shared/utils/response");

const NOTIFICATION_API_URL = process.env.NOTIFICATION_API_URL || "http://localhost:4001/api/notifications";

exports.proxyNotificationRequest = async (req, res) => {
  try {
    const { method, body, query, headers } = req;
    
    // Construct the URL for the microservice
    const url = req.params.id ? `${NOTIFICATION_API_URL}/${req.params.id}` : NOTIFICATION_API_URL;

    // We pass the JWT token from the original request to the microservice
    // The microservice will verify this token itself
    const response = await axios({
      method,
      url,
      data: body,
      params: query,
      headers: {
        'Authorization': headers.authorization,
        'Cookie': headers.cookie,
        'Content-Type': 'application/json'
      },
      timeout: 5000,
      validateStatus: () => true // Allow all status codes to be passed back to client
    });

    return res.status(response.status).json(response.data);
  } catch (err) {
    console.error("Notification Proxy Error:", err.message);
    return error(res, {
      message: "Failed to communicate with notification service",
      statusCode: 502
    });
  }
};
