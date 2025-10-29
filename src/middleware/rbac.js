import { query } from '../config/db.js';

/**
 * Map HTTP method to permission flag.
 */
const methodToAction = {
  GET: 'can_read',
  POST: 'can_create',
  PUT: 'can_update',
  PATCH: 'can_update',
  DELETE: 'can_delete'
};

/**
 * Require explicit permission for a given menu key and action.
 * Optionally, you can omit action to infer from HTTP method.
 */
export function requirePermission(menuKey, action = null) {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.role_id) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const roleId = req.user.role_id;
      const [menu] = await query('SELECT id FROM menus WHERE `key` = :key AND deleted_at IS NULL', { key: menuKey });
      if (!menu) return res.status(403).json({ message: 'Menu not found or inactive' });

      const flag = action || methodToAction[req.method] || 'can_read';
      const rows = await query(
        'SELECT ' + flag + ' as allowed FROM role_menu WHERE role_id = :roleId AND menu_id = :menuId AND deleted_at IS NULL',
        { roleId, menuId: menu.id }
      );
      const allowed = rows.length ? rows[0].allowed === 1 : false;
      if (!allowed) return res.status(403).json({ message: 'Forbidden' });
      next();
    } catch (e) {
      next(e);
    }
  }
}
