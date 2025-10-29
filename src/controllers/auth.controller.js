import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { query } from '../config/db.js';
import { hashPassword, comparePassword } from '../utils/password.js';

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role_id: user.role_id }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

function setAuthCookie(res, token) {
  res.cookie('access_token', token, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  });
}

async function getMenusForRole(role_id) {
  const rows = await query(`
    SELECT m.*,
           IFNULL(rm.can_read, 0) as can_read,
           IFNULL(rm.can_create, 0) as can_create,
           IFNULL(rm.can_update, 0) as can_update,
           IFNULL(rm.can_delete, 0) as can_delete
    FROM menus m
    LEFT JOIN role_menu rm ON rm.menu_id = m.id AND rm.role_id = :role_id AND rm.deleted_at IS NULL
    WHERE m.deleted_at IS NULL
    ORDER BY m.parent_id IS NOT NULL, m.parent_id, m.sort, m.id
  `, { role_id });
  // Build tree
  const byId = new Map();
  rows.forEach(r => byId.set(r.id, { ...r, children: [] }));
  const tree = [];
  rows.forEach(r => {
    const node = byId.get(r.id);
    if (r.parent_id) {
      const parent = byId.get(r.parent_id);
      if (parent) parent.children.push(node);
    } else {
      tree.push(node);
    }
  });
  // only keep menus with can_read = 1 somewhere in subtree
  function filterReadable(n) {
    n.children = n.children.map(filterReadable).filter(Boolean);
    if (n.can_read === 1 || n.children.length) return n;
    return null;
  }
  return tree.map(filterReadable).filter(Boolean);
}

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'name, email, password required' });
    const exists = await query('SELECT id FROM users WHERE email = :email AND deleted_at IS NULL', { email });
    if (exists.length) return res.status(409).json({ message: 'Email already registered' });
    const [role] = await query('SELECT id FROM roles WHERE name = :name AND deleted_at IS NULL', { name: 'user' });
    const role_id = role ? role.id : 3;
    const passwordHash = await hashPassword(password);
    const result = await query(
      'INSERT INTO users (name, email, password, role_id) VALUES (:name, :email, :password, :role_id)',
      { name, email, password: passwordHash, role_id }
    );
    const [user] = await query('SELECT id, name, email, photo,  FROM users WHERE id = :id', { id: result.insertId });
    const token = signToken(user);
    setAuthCookie(res, token);
    const menus = await getMenusForRole(user.role_id);
    res.json({ user, menus });
  } catch (e) {
    next(e);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email & password required' });
    const [user] = await query('SELECT * FROM users WHERE email = :email AND deleted_at IS NULL', { email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await comparePassword(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const payload = { id: user.id, email: user.email, role_id: user.role_id };
    const token = signToken(payload);
    setAuthCookie(res, token);
    const menus = await getMenusForRole(user.role_id);
    res.json({ user: { id: user.id, name: user.name, email: user.email, photo: user.photo, role_id: user.role_id }, menus });
  } catch (e) {
    next(e);
  }
}

export async function me(req, res, next) {
  try {
    const [user] = await query('SELECT id, name, email,photo,role_id FROM users WHERE id = :id AND deleted_at IS NULL', { id: req.user.id });
    if (!user) return res.status(404).json({ message: 'User not found' });
  
    const menus = await getMenusForRole(user.role_id);

    res.json({ user, menus });
  } catch (e) {
    next(e);
  }
}

export async function logout(_req, res, _next) {
  res.clearCookie('access_token', { httpOnly: true, sameSite: 'lax', secure: env.COOKIE_SECURE });
  res.json({ message: 'logged out' });
}

async function menusForRole(role_id) {
  const [r] = await query('SELECT name FROM roles WHERE id=:id', { id: role_id });

  let rows;
  if (r?.name === 'admin') {
    // admin selalu dapat semua menu
    rows = await query(`
      SELECT m.*, 1 can_read, 1 can_create, 1 can_update, 1 can_delete
      FROM menus m
      WHERE m.deleted_at IS NULL
      ORDER BY m.parent_id IS NOT NULL, m.parent_id, m.sort, m.id
    `);
  } else {
    rows = await query(`
      SELECT m.*,
             IFNULL(rm.can_read,0) can_read, IFNULL(rm.can_create,0) can_create,
             IFNULL(rm.can_update,0) can_update, IFNULL(rm.can_delete,0) can_delete
      FROM menus m
      LEFT JOIN role_menu rm ON rm.menu_id=m.id AND rm.role_id=:role_id AND rm.deleted_at IS NULL
      WHERE m.deleted_at IS NULL
      ORDER BY m.parent_id IS NOT NULL, m.parent_id, m.sort, m.id
    `, { role_id });
  }

  const byId = new Map(); rows.forEach(r => byId.set(r.id, { ...r, children: [] }));
  const tree = []; rows.forEach(r => { const n = byId.get(r.id); (r.parent_id ? byId.get(r.parent_id)?.children : tree)?.push(n); });
  const filterReadable = n => { n.children = n.children.map(filterReadable).filter(Boolean); return (n.can_read===1 || n.children.length) ? n : null; };
  return tree.map(filterReadable).filter(Boolean);
}
