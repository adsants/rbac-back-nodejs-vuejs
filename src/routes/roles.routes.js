import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { listRoles, getRole, createRole, updateRole, deleteRole } from '../controllers/roles.controller.js';

const router = Router();

router.use(authRequired);

router.get('/', requirePermission('roles', 'can_read'), listRoles);
router.get('/:id', requirePermission('roles', 'can_read'), getRole);
router.post('/', requirePermission('roles', 'can_create'), createRole);
router.put('/:id', requirePermission('roles', 'can_update'), updateRole);
router.delete('/:id', requirePermission('roles', 'can_delete'), deleteRole);

export default router;
