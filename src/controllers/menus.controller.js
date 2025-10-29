import { query } from '../config/db.js';
import { buildPagination } from '../utils/paginator.js';

export async function listMenus(req, res, next) {
  try {
    const { q = '' } = req.query;
    const { page, limit, offset } = buildPagination(req.query);
    const where = q ? 'WHERE deleted_at IS NULL AND (`key` LIKE :like OR title LIKE :like)' : 'WHERE deleted_at IS NULL';
    const rows = await query(`SELECT id, \`key\`, title, path, icon, parent_id, sort FROM menus ${where} ORDER BY parent_id IS NOT NULL, parent_id, sort, id LIMIT :limit OFFSET :offset`, 
      { like: `%${q}%`, limit, offset });
    const [{ count }] = await query(`SELECT COUNT(*) as count FROM menus ${where}`, { like: `%${q}%` });
    res.json({ data: rows, meta: { page, limit, total: count } });
  } catch (e) { next(e); }
}

export async function getMenu(req, res, next) {
  try {
    const { id } = req.params;
    const [row] = await query('SELECT id, `key`, title, path, icon, parent_id, sort FROM menus WHERE id = :id AND deleted_at IS NULL', { id });
    if (!row) return res.status(404).json({ message: 'Not found' });
    res.json(row);
  } catch (e) { next(e); }
}

export async function createMenu(req, res, next) {
  try {
    const { key, title, path, icon, parent_id, sort = 0 } = req.body;
    if (!key || !title) return res.status(400).json({ message: 'key & title required' });
    const result = await query('INSERT INTO menus (`key`, title, path, icon, parent_id, sort, created_by) VALUES (:key, :title, :path, :icon, :parent_id, :sort, :uid)',
      { key, title, path, icon, parent_id, sort, uid: req.user.id });
    const [row] = await query('SELECT id, `key`, title, path, icon, parent_id, sort FROM menus WHERE id = :id', { id: result.insertId });
    res.status(201).json(row);
  } catch (e) { next(e); }
}

export async function updateMenu(req, res, next) {
  try {
    const { id } = req.params;
    const { key, title, path, icon, parent_id, sort = 0 } = req.body;
    await query('UPDATE menus SET `key` = :key, title = :title, path = :path, icon = :icon, parent_id = :parent_id, sort = :sort, updated_by = :uid WHERE id = :id',
      { id, key, title, path, icon, parent_id, sort, uid: req.user.id });
    const [row] = await query('SELECT id, `key`, title, path, icon, parent_id, sort FROM menus WHERE id = :id', { id });
    res.json(row);
  } catch (e) { next(e); }
}

export async function deleteMenu(req, res, next) {
  try {
    const { id } = req.params;
    await query('UPDATE menus SET deleted_at = NOW(), deleted_by = :uid WHERE id = :id', { id, uid: req.user.id });
    res.json({ message: 'deleted' });
  } catch (e) { next(e); }
}
