INSERT INTO roles (name, description) VALUES
  ('admin', 'Administrator'),
  ('manager', 'Manager'),
  ('user', 'Regular User');

-- basic menus
INSERT INTO menus (`key`, title, path, icon, parent_id, sort) VALUES
  ('dashboard', 'Dashboard', '/', 'home', NULL, 1),
  ('users', 'Users', '/users', 'users', NULL, 2),
  ('roles', 'Roles', '/roles', 'shield', NULL, 3),
  ('menus', 'Menus', '/menus', 'menu', NULL, 4),
  ('role_menu', 'Role Menu', '/role-menu', 'settings', NULL, 5);

-- default permissions
-- admin can everything
INSERT INTO role_menu (role_id, menu_id, can_read, can_create, can_update, can_delete)
  SELECT r.id, m.id, 1,1,1,1 FROM roles r CROSS JOIN menus m WHERE r.name='admin';
-- manager: read users/roles/menus, can update role_menu
INSERT INTO role_menu (role_id, menu_id, can_read, can_create, can_update, can_delete)
  SELECT r.id, m.id, 1,0,1,0 FROM roles r JOIN menus m ON m.`key` IN ('dashboard','roles','menus','users','role_menu') WHERE r.name='manager';
-- user: read dashboard only
INSERT INTO role_menu (role_id, menu_id, can_read, can_create, can_update, can_delete)
  SELECT r.id, m.id, CASE WHEN m.`key`='dashboard' THEN 1 ELSE 0 END, 0, 0, 0 FROM roles r CROSS JOIN menus m WHERE r.name='user';

-- users
-- password hashes will be filled by app or give simple default 'Admin@123' etc hashed value
-- we'll insert plain then update with hashed via comment (user will log in via seed generated below)
