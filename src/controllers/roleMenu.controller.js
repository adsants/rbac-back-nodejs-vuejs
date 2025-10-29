import { query } from '../config/db.js';

export async function getRoleMenu(req, res, next) {
  try {
    const roleId = parseInt(req.params.roleId, 10);
    const rows = await query(`
      SELECT m.id as menu_id, m.title, m.key, m.parent_id, m.sort,
             IFNULL(rm.can_read,0) as can_read,
             IFNULL(rm.can_create,0) as can_create,
             IFNULL(rm.can_update,0) as can_update,
             IFNULL(rm.can_delete,0) as can_delete
      FROM menus m
      LEFT JOIN role_menu rm ON rm.menu_id = m.id AND rm.role_id = :roleId AND rm.deleted_at IS NULL
      WHERE m.deleted_at IS NULL
      ORDER BY m.parent_id IS NOT NULL, m.parent_id, m.sort, m.id
    `, { roleId });
    res.json(rows);
  } catch (e) { next(e); }
}

export async function updateRoleMenu(req, res, next) {
  try {
    const roleId = parseInt(req.params.roleId, 10);
    const items = req.body.items || [];
    // Strategy: delete existing and insert new
    await query('DELETE FROM role_menu WHERE role_id = :roleId;', { roleId });    

    if (items.length) {
      for (const it of items) {
        await query(`INSERT INTO role_menu (role_id, menu_id, can_read, can_create, can_update, can_delete, created_by)
                     VALUES (:roleId, :menu_id, :can_read, :can_create, :can_update, :can_delete, :uid)`,
          { roleId, menu_id: it.menu_id, can_read: it.can_read ? 1 : 0, can_create: it.can_create ? 1 : 0, can_update: it.can_update ? 1 : 0, can_delete: it.can_delete ? 1 : 0, uid: req.user.id });
      }
    }
    res.json({ message: 'saved' });
  } catch (e) { next(e); }
}
