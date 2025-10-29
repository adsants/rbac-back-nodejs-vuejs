import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { listUsers, getUser, createUser, updateUser, deleteUser } from '../controllers/users.controller.js';

const router = Router();

router.use(authRequired);

router.get('/', requirePermission('users', 'can_read'), listUsers);
router.get('/:id', requirePermission('users', 'can_read'), getUser);
router.post('/', requirePermission('users', 'can_create'), createUser);
router.put('/:id', requirePermission('users', 'can_update'), updateUser);
router.delete('/:id', requirePermission('users', 'can_delete'), deleteUser);

export default router;
