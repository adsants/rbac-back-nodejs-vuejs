import { query } from '../config/db.js';
import { buildPagination } from '../utils/paginator.js';
import { hashPassword } from '../utils/password.js';

export async function listUsers(req, res, next) {
  try {
    const { q = '' } = req.query;
    const { page, limit, offset } = buildPagination(req.query);
    const where = q ? 'WHERE u.deleted_at IS NULL AND (u.name LIKE :like OR u.email LIKE :like)' : 'WHERE u.deleted_at IS NULL';
    const rows = await query(`
      SELECT u.id, u.name, u.email, u.role_id, r.name as role_name, u.created_at
      FROM users u
      LEFT JOIN roles r ON r.id = u.role_id
      ${where}
      ORDER BY u.id DESC
      LIMIT :limit OFFSET :offset
    `, { like: `%${q}%`, limit, offset });
    const [{ count }] = await query(`SELECT COUNT(*) as count FROM users u ${where}`, { like: `%${q}%` });
    res.json({ data: rows, meta: { page, limit, total: count } });
  } catch (e) { next(e); }
}

export async function getUser(req, res, next) {
  try {
    const { id } = req.params;
    const [row] = await query('SELECT id, name, email, role_id FROM users WHERE id = :id AND deleted_at IS NULL', { id });
    if (!row) return res.status(404).json({ message: 'Not found' });
    res.json(row);
  } catch (e) { next(e); }
}

export async function createUser(req, res, next) {
  try {
    const { name, email, password, role_id } = req.body;
    if (!name || !email || !password || !role_id) return res.status(400).json({ message: 'name, email, password, role_id required' });
    const pass = await hashPassword(password);
    const result = await query('INSERT INTO users (name, email, password, role_id, created_by) VALUES (:name, :email, :password, :role_id, :created_by)', {
      name, email, password: pass, role_id, created_by: req.user.id
    });
    const [row] = await query('SELECT id, name, email, role_id FROM users WHERE id = :id', { id: result.insertId });
    res.status(201).json(row);
  } catch (e) { next(e); }
}

export async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const { name, email, password, role_id } = req.body;
    const sets = ['name = :name', 'email = :email', 'role_id = :role_id', 'updated_by = :updated_by'];
    const params = { id, name, email, role_id, updated_by: req.user.id };
    if (password) {
      sets.push('password = :password');
      params.password = await hashPassword(password);
    }
    await query(`UPDATE users SET ${sets.join(', ')} WHERE id = :id`, params);
    const [row] = await query('SELECT id, name, email, role_id FROM users WHERE id = :id', { id });
    res.json(row);
  } catch (e) { next(e); }
}

export async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    await query('UPDATE users SET deleted_at = NOW(), deleted_by = :uid WHERE id = :id', { id, uid: req.user.id });
    res.json({ message: 'deleted' });
  } catch (e) { next(e); }
}
