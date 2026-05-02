const jwt = require('jsonwebtoken');

/**
 * Robust JWT Authentication Middleware
 * 
 * Extracts the Bearer token from the Authorization header,
 * verifies it against the JWT_SECRET, and attaches the decoded
 * account payload to the request object.
 */
const authenticateAccount = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed: Missing or malformed Authorization header.',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
       return res.status(401).json({
        success: false,
        error: 'Authentication failed: Token is missing.',
      });
    }

    // Verify token validity and signature
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_fallback_key');
    
    // Attach the decoded account info to the request for downstream consumption
    req.account = decoded;
    
    next();
  } catch (error) {
    console.error('[Auth Middleware] Verification Error:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Authentication failed: Token has expired.' });
    }
    
    return res.status(401).json({ success: false, error: 'Authentication failed: Invalid token signature.' });
  }
};

/**
 * Role-Based Access Control (RBAC) Middleware Factory
 * 
 * Generates a middleware that ensures the authenticated account
 * holds one of the permitted roles to access a specific route.
 */
const authorizeRoles = (...permittedRoles) => {
  return (req, res, next) => {
    if (!req.account) {
      return res.status(401).json({ success: false, error: 'Authorization failed: Account not authenticated.' });
    }

    if (!permittedRoles.includes(req.account.role)) {
      return res.status(403).json({ 
        success: false, 
        error: `Access Denied: Your role '${req.account.role}' is insufficient. Requires: [${permittedRoles.join(', ')}]` 
      });
    }

    next();
  };
};

module.exports = {
  authenticateAccount,
  authorizeRoles
};
