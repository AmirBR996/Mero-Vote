import { verifyToken } from '../utils/jwt.js';

/**
 * Middleware to authenticate requests using JWT
 * Extracts token from Authorization header and verifies it
 */
export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is missing',
      });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token',
      error: error.message,
    });
  }
};

/**
 * Middleware to check if user is ADMIN
 */
export const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.',
    });
  }
  next();
};

/**
 * Middleware to check if user is VOTER
 */
export const isVoter = (req, res, next) => {
  if (req.user?.role !== 'VOTER') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Voter role required.',
    });
  }
  next();
};
