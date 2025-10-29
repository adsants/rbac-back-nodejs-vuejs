import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { query } from '../config/db.js';

export function authRequired(req, res, next) {
  const bearer = req.headers.authorization;
  const token = req.cookies.access_token || (bearer && bearer.startsWith('Bearer ') ? bearer.slice(7) : null);
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

export async function loadUser(req, _res, next) {
  if (!req.user) return next();
  const [user] = await query('SELECT id, name, email, role_id FROM users WHERE id = :id AND deleted_at IS NULL', { id: req.user.id });
  req.currentUser = user || null;
  next();
}
