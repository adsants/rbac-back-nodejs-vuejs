import { query } from '../config/db.js';

export async function getRoleMenu(req, res, next) {
  try {
    const roleId = parseInt(req.params.roleId, 10);

    const rows = await query(`
      SELECT
        m.id               AS menu_id,
        m.title,
        m.key,
        m.parent_id,
        m.sort,

        -- flag bantu untuk frontend
        CASE WHEN EXISTS (
          SELECT 1 FROM menus c
          WHERE c.parent_id = m.id AND c.deleted_at IS NULL
        ) THEN 1 ELSE 0 END AS is_parent,
        (SELECT COUNT(1) FROM menus c
          WHERE c.parent_id = m.id AND c.deleted_at IS NULL
        ) AS child_count,

        IFNULL(rm.can_read,0)   AS can_read,
        IFNULL(rm.can_create,0) AS can_create,
        IFNULL(rm.can_update,0) AS can_update,
        IFNULL(rm.can_delete,0) AS can_delete,

        -- key pengurutan per-group (parent & semua anaknya)
        CASE WHEN m.parent_id IS NULL THEN m.id ELSE m.parent_id END AS root_id,
        COALESCE(p.sort, m.sort) AS root_sort

      FROM menus m
      LEFT JOIN menus p  ON p.id = m.parent_id                -- parent dari m
      LEFT JOIN role_menu rm
        ON rm.menu_id = m.id AND rm.role_id = :roleId AND rm.deleted_at IS NULL
      WHERE m.deleted_at IS NULL

      -- Urutan: kelompok per parent (urut menurut sort parent),
      --         lalu parent dulu, baru anak-anak urut sort/id
      ORDER BY
        root_sort ASC,
        root_id   ASC,
        (m.parent_id IS NOT NULL) ASC,  -- parent (0) muncul dulu, lalu child (1)
        m.sort ASC,
        m.id ASC
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
