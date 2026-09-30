import { verifyAccessToken } from '../utils/jwt.js';

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token missing or invalid format. Please log in.'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Session has expired or is invalid. Please log in again.'
    });
  }
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Super Admin and Company Admin can perform all company management tasks
    if (req.user.role === 'Super Admin' || req.user.role === 'Company Admin') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' does not possess required permission for this operation.`
      });
    }

    next();
  };
};

export const requireSupplier = (req, res, next) => {
  if (!req.user || !req.user.is_supplier) {
    return res.status(403).json({
      success: false,
      message: 'Access restricted to authorized supplier portal accounts only.'
    });
  }
  next();
};
