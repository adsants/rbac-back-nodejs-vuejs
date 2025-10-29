import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { getRoleMenu, updateRoleMenu } from '../controllers/roleMenu.controller.js';

const router = Router();

router.use(authRequired);

router.get('/:roleId', requirePermission('role_menu', 'can_read'), getRoleMenu);
router.put('/:roleId', requirePermission('role_menu', 'can_update'), updateRoleMenu);

export default router;
