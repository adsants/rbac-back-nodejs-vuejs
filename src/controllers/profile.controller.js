import path from 'path';
import fs from 'fs/promises';
import { query } from '../config/db.js';
import { hashPassword } from '../utils/password.js';

export async function getProfile(req, res, next) {
  try {
    const [u] = await query(
      'SELECT id, name, email, role_id, photo FROM users WHERE id=:id AND deleted_at IS NULL',
      { id: req.user.id }
    );
    if (!u) return res.status(404).json({ message: 'User not found' });
    res.json(u);
  } catch (e) { next(e); }
}

export async function updateProfile(req, res, next) {
  try {
    const id = req.user.id;
    const { name, email, password } = req.body;

    // cek user lama untuk tahu foto sebelumnya
    const [oldU] = await query('SELECT * FROM users WHERE id=:id AND deleted_at IS NULL', { id });
    if (!oldU) return res.status(404).json({ message: 'User not found' });

    // jika email berubah -> cek unik
    if (email && email !== oldU.email) {
      const dup = await query('SELECT id FROM users WHERE email=:email AND id<>:id AND deleted_at IS NULL', { email, id });
      if (dup.length) return res.status(409).json({ message: 'Email already in use' });
    }

    // handle foto
    let photoPath = oldU.photo;
    if (req.file) {
      const rel = '/uploads/avatars/' + req.file.filename;
      // hapus file lama (jika ada, dan berbeda)
      if (oldU.photo && oldU.photo !== rel) {
        try { await fs.unlink(path.join(process.cwd(), oldU.photo.replace(/^\//, ''))); } catch {}
      }
      photoPath = rel;
    }

    // build set
    const sets = ['name=:name', 'updated_by=:uid'];
    const params = { id, name: name ?? oldU.name, uid: id, email: email ?? oldU.email, photo: photoPath };
    if (email) { sets.push('email=:email'); }
    if (password && password.trim()) { sets.push('password=:password'); params.password = await hashPassword(password); }
    if (photoPath !== oldU.photo) { sets.push('photo=:photo'); }

    await query(`UPDATE users SET ${sets.join(', ')} WHERE id=:id`, params);

    const [user] = await query('SELECT id, name, email, role_id, photo FROM users WHERE id=:id', { id });
    res.json(user);
  } catch (e) { next(e); }
}
