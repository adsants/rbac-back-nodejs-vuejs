import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { listMenus, getMenu, createMenu, updateMenu, deleteMenu } from '../controllers/menus.controller.js';

const router = Router();

router.use(authRequired);

router.get('/', requirePermission('menus', 'can_read'), listMenus);
router.get('/:id', requirePermission('menus', 'can_read'), getMenu);
router.post('/', requirePermission('menus', 'can_create'), createMenu);
router.put('/:id', requirePermission('menus', 'can_update'), updateMenu);
router.delete('/:id', requirePermission('menus', 'can_delete'), deleteMenu);

export default router;
