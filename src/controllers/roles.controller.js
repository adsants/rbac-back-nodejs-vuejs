import { query } from '../config/db.js';
import { buildPagination } from '../utils/paginator.js';

export async function listRoles(req, res, next) {
  try {
    const { q = '' } = req.query;
    const { page, limit, offset } = buildPagination(req.query);
    const where = q ? 'WHERE deleted_at IS NULL AND name LIKE :like' : 'WHERE deleted_at IS NULL';
    const rows = await query(`SELECT id, name, description, created_at FROM roles ${where} ORDER BY id DESC LIMIT :limit OFFSET :offset`, { like: `%${q}%`, limit, offset });
    const [{ count }] = await query(`SELECT COUNT(*) as count FROM roles ${where}`, { like: `%${q}%` });
    res.json({ data: rows, meta: { page, limit, total: count } });
  } catch (e) { next(e); }
}

export async function getRole(req, res, next) {
  try {
    const { id } = req.params;
    const [row] = await query('SELECT id, name, description FROM roles WHERE id = :id AND deleted_at IS NULL', { id });
    if (!row) return res.status(404).json({ message: 'Not found' });
    res.json(row);
  } catch (e) { next(e); }
}

export async function createRole(req, res, next) {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'name required' });
    const result = await query('INSERT INTO roles (name, description, created_by) VALUES (:name, :description, :uid)', { name, description, uid: req.user.id });
    const [row] = await query('SELECT id, name, description FROM roles WHERE id = :id', { id: result.insertId });
    res.status(201).json(row);
  } catch (e) { next(e); }
}

export async function updateRole(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    await query('UPDATE roles SET name = :name, description = :description, updated_by = :uid WHERE id = :id', { id, name, description, uid: req.user.id });
    const [row] = await query('SELECT id, name, description FROM roles WHERE id = :id', { id });
    res.json(row);
  } catch (e) { next(e); }
}

export async function deleteRole(req, res, next) {
  try {
    const { id } = req.params;
    await query('UPDATE roles SET deleted_at = NOW(), deleted_by = :uid WHERE id = :id', { id, uid: req.user.id });
    res.json({ message: 'deleted' });
  } catch (e) { next(e); }
}
