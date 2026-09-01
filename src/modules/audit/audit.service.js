const ActivityLog = require("../../shared/models/ActivityLog");
const {
  ACTIVITY_TYPES,
  ACTIVITY_ACTION_VALUES,
  ACTIVITY_STATUS,
} = require("../../shared/constants/activities");

const validateActivityAction = (action) => {
  if (!ACTIVITY_ACTION_VALUES.includes(action)) {
    throw new TypeError(`Unknown activity type: ${action}`);
  }
  return action;
};

const logActivity = async (req, res, action, details = "") => {
  try {
    const validatedAction = validateActivityAction(action);
    const activityConfig = ACTIVITY_TYPES[validatedAction];

    const userId = await activityConfig.getUserId(req, res.locals.responseData);

    // For some activities like CUSTOMER_APPLICATION, userId might be null if user doesn't exist
    if (
      !userId &&
      action !== "CUSTOMER_APPLICATION" &&
      action !== "LOGIN_FAILED"
    ) {
      console.error(`Could not determine user ID for activity: ${action}`);
      return;
    }

    const activityLog = new ActivityLog({
      user: userId,
      action: validatedAction,
      details,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers["user-agent"],
      status:
        res.statusCode >= 200 && res.statusCode < 300
          ? ACTIVITY_STATUS.SUCCESS
          : ACTIVITY_STATUS.FAILED,
      severity: activityConfig.severity,
      metadata: {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        responseTime: Date.now() - req._startTime,
      },
    });

    await activityLog.save();
  } catch (error) {
    console.error("Error logging activity:", error);
  }
};

/**
 * Express middleware factory for recording audit log entries.
 * Intercepts res.json to capture the response payload before async logging.
 */
const activityLogger = (action, details = "") => {
  const validatedAction = validateActivityAction(action);

  return async (req, res, next) => {
    try {
      const originalJson = res.json;
      res.json = function (data) {
        res.locals.responseData = data;
        originalJson.call(this, data);
        logActivity(req, res, validatedAction, details);
      };
      req._startTime = Date.now();
      next();
    } catch (error) {
      console.error("Error in activityLogger middleware:", error);
      next();
    }
  };
};

// ─── Read helpers ─────────────────────────────────────────────────────────────

/**
 * Shared query builder for all three activity log read functions.
 * baseQuery: the starting filter ({ user: id } or {})
 * params: parsed query string values
 * defaultLimit: 10 for scoped reads, 20 for global admin reads
 */
async function _queryLogs(baseQuery, params, defaultLimit) {
  const {
    page = 1,
    limit = defaultLimit,
    action,
    status,
    severity,
    startDate,
    endDate,
    userId,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = params;

  const query = { ...baseQuery };
  if (userId) query.user = userId;
  if (action) query.action = action;
  if (status) query.status = status;
  if (severity) query.severity = severity;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const numPage = parseInt(page);
  const numLimit = parseInt(limit);
  const skip = (numPage - 1) * numLimit;

  const validSortFields = ["createdAt", "action", "status", "severity"];
  const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
  const sortDirection = sortOrder.toLowerCase() === "asc" ? 1 : -1;

  const total = await ActivityLog.countDocuments(query);
  const activities = await ActivityLog.find(query)
    .sort({ [sortField]: sortDirection })
    .skip(skip)
    .limit(numLimit)
    .populate("user", "name email")
    .populate("relatedEntity", "accountNumber name email");

  return {
    activities: activities.map((a) => a.format()),
    meta: {
      page: numPage,
      limit: numLimit,
      total,
      pages: Math.ceil(total / numLimit),
    },
  };
}

async function getOwnActivityLogs(userId, queryParams) {
  return _queryLogs({ user: userId }, queryParams, 10);
}

async function getUserActivityLogs(userId, queryParams) {
  return _queryLogs({ user: userId }, queryParams, 10);
}

async function getAllActivityLogs(queryParams) {
  return _queryLogs({}, queryParams, 20);
}

module.exports = {
  activityLogger,
  logActivity,
  validateActivityAction,
  ACTIVITY_TYPES,
  getOwnActivityLogs,
  getUserActivityLogs,
  getAllActivityLogs,
};
