const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");

const checkActivityAccess = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = req.userObj;

    // Admin can access any user's activity
    if (user.role === "admin") {
      return next();
    }

    // Banker can only access customer activities
    if (user.role === "banker") {
      const targetUser = await User.findById(userId);
      if (!targetUser) {
        return res.status(404).json({ msg: "User not found" });
      }
      if (targetUser.role !== "customer") {
        return res.status(403).json({
          msg: "Access denied. Bankers can only view customer activities.",
        });
      }
      return next();
    }

    // Regular users can only view their own activities
    if (userId !== user.id) {
      return res
        .status(403)
        .json({ msg: "Access denied. You can only view your own activities." });
    }

    next();
  } catch (err) {
    console.error("Activity access check error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Middleware to log user activities
const activityLogger = (action, details = "") => {
  return async (req, res, next) => {
    try {
      // Store the original res.json method
      const originalJson = res.json;

      // Override res.json method to log activity after response is sent
      res.json = function (data) {
        // Call the original res.json method
        originalJson.call(this, data);

        // Log the activity
        const logActivity = async () => {
          try {
            const activityLog = new ActivityLog({
              user: req.user.id,
              action: action,
              details: details,
              ipAddress: req.ip || req.connection.remoteAddress,
              userAgent: req.headers["user-agent"],
              status:
                res.statusCode >= 200 && res.statusCode < 300
                  ? "SUCCESS"
                  : "FAILED",
              severity: determineSeverity(action, res.statusCode),
              metadata: {
                method: req.method,
                path: req.path,
                statusCode: res.statusCode,
                responseTime: Date.now() - req._startTime,
              },
              deviceInfo: {
                type: determineDeviceType(req.headers["user-agent"]),
                browser: getBrowserInfo(req.headers["user-agent"]),
                os: getOSInfo(req.headers["user-agent"]),
              },
            });

            await activityLog.save();
          } catch (error) {
            console.error("Error logging activity:", error);
          }
        };

        // Execute logging after response is sent
        logActivity();
      };

      // Add timestamp for response time calculation
      req._startTime = Date.now();
      next();
    } catch (error) {
      console.error("Error in activityLogger middleware:", error);
      next();
    }
  };
};

// Helper function to determine severity based on action and status code
const determineSeverity = (action, statusCode) => {
  if (statusCode >= 500) return "HIGH";
  if (statusCode >= 400) return "MEDIUM";

  // Critical actions
  if (
    action.includes("SECURITY") ||
    action === "PASSWORD_CHANGE" ||
    action === "ACCOUNT_CLOSURE"
  ) {
    return "CRITICAL";
  }

  // High severity actions
  if (
    action.includes("TRANSACTION") ||
    action === "ACCOUNT_FREEZE" ||
    action === "ACCOUNT_UNFREEZE"
  ) {
    return "HIGH";
  }

  return "LOW";
};

// Helper function to determine device type
const determineDeviceType = (userAgent) => {
  if (!userAgent) return "OTHER";

  const ua = userAgent.toLowerCase();
  if (
    /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
      ua
    )
  ) {
    return "MOBILE";
  }
  if (
    /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk)|(android(?!.*mobile))/i.test(
      ua
    )
  ) {
    return "TABLET";
  }
  return "DESKTOP";
};

// Helper function to get browser info
const getBrowserInfo = (userAgent) => {
  if (!userAgent) return "Unknown";

  const ua = userAgent.toLowerCase();
  if (ua.includes("chrome")) return "Chrome";
  if (ua.includes("firefox")) return "Firefox";
  if (ua.includes("safari")) return "Safari";
  if (ua.includes("edge")) return "Edge";
  if (ua.includes("opera")) return "Opera";
  return "Other";
};

// Helper function to get OS info
const getOSInfo = (userAgent) => {
  if (!userAgent) return "Unknown";

  const ua = userAgent.toLowerCase();
  if (ua.includes("windows")) return "Windows";
  if (ua.includes("mac")) return "MacOS";
  if (ua.includes("linux")) return "Linux";
  if (ua.includes("android")) return "Android";
  if (ua.includes("ios")) return "iOS";
  return "Other";
};

module.exports = {
  checkActivityAccess,
  activityLogger,
};
