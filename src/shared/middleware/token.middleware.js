const jwt = require('jsonwebtoken');

/**
 * Middleware to verify the special token used for completing a profile.
 * It expects the token to be in the 'Authorization' header as 'Bearer <token>'.
 */
exports.verifyProfileCompletionToken = (req, res, next) => {
  // Get token from header
  const authHeader = req.header('Authorization');

  // Check if not token
  if (!authHeader) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // The header format is "Bearer <token>"
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ msg: 'Token format is invalid, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user ID from the token payload to the request object
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
