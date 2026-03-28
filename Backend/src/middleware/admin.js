import { authenticateToken, isAdmin } from './auth.js';

export const adminMiddleware = (req, res, next) => {
  authenticateToken(req, res, () => isAdmin(req, res, next));
};