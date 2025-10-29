import { query } from './config/db.js';
import { hashPassword } from './utils/password.js';

async function ensureDefaultUsers() {
  const [{ cnt }] = await query('SELECT COUNT(*) as cnt FROM users WHERE deleted_at IS NULL');
  if (cnt > 0) return;
  // ensure roles exist
  const roles = await query('SELECT id, name FROM roles');
  if (!roles.length) {
    await query("INSERT INTO roles (name, description) VALUES ('admin','Administrator'),('manager','Manager'),('user','Regular User')");
  }
  const rmap = {};
  (await query('SELECT id, name FROM roles')).forEach(r => rmap[r.name] = r.id);
  const adminPass = await hashPassword('Admin@123');
  const managerPass = await hashPassword('Manager@123');
  const userPass = await hashPassword('User@123');
  await query('INSERT INTO users (name, email, password, role_id) VALUES (:n1,:e1,:p1,:r1),(:n2,:e2,:p2,:r2),(:n3,:e3,:p3,:r3)', {
    n1: 'Admin', e1: 'admin@example.com', p1: adminPass, r1: rmap['admin'],
    n2: 'Manager', e2: 'manager@example.com', p2: managerPass, r2: rmap['manager'],
    n3: 'User', e3: 'user@example.com', p3: userPass, r3: rmap['user']
  });
}

ensureDefaultUsers().catch(() => {});
