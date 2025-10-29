INSERT INTO `menus` (`id`, `key`, `title`, `path`, `icon`, `parent_id`, `sort`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`) VALUES
(1, 'dashboard', 'Dashboard', '/', 'home', NULL, 1, '2025-10-29 08:03:26', NULL, '2025-10-29 08:59:31', 1, NULL, NULL),
(2, 'users', 'Users', '/users', 'users', 6, 2, '2025-10-29 08:03:26', NULL, '2025-10-29 08:59:36', 1, NULL, NULL),
(3, 'roles', 'Roles', '/roles', 'shield', 6, 3, '2025-10-29 08:03:26', NULL, '2025-10-29 09:04:55', 1, NULL, NULL),
(4, 'menus', 'Menus', '/menus', 'menu', 6, 4, '2025-10-29 08:03:26', NULL, '2025-10-29 09:04:48', 1, NULL, NULL),
(5, 'role_menu', 'Role Menu', '/role-menu', 'settings', 6, 5, '2025-10-29 08:03:26', NULL, '2025-10-29 08:59:43', 1, NULL, NULL),
(6, 'master', 'Master', '-', 'master', NULL, 2, '2025-10-29 08:59:26', 1, '2025-10-29 10:00:24', NULL, NULL, NULL),
(7, 'profile', 'Profil', '/profile', 'user', NULL, 3, '2025-10-29 10:16:21', 7, '2025-10-29 10:19:29', 7, NULL, NULL);

INSERT INTO `roles` (`id`, `name`, `description`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`) VALUES
(1, 'Admin', 'Administrator', '2025-10-29 08:03:26', NULL, '2025-10-29 10:02:16', 7, NULL, NULL),
(2, 'Manager', 'Manager', '2025-10-29 08:03:26', NULL, '2025-10-29 10:02:12', 7, NULL, NULL),
(3, 'User', 'Regular User', '2025-10-29 08:03:26', NULL, '2025-10-29 10:02:00', 7, NULL, NULL);

INSERT INTO `role_menu` (`id`, `role_id`, `menu_id`, `can_read`, `can_create`, `can_update`, `can_delete`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`) VALUES
(49, 2, 1, 1, 0, 0, 0, '2025-10-29 10:02:37', 7, NULL, NULL, NULL, NULL),
(50, 2, 6, 0, 0, 0, 0, '2025-10-29 10:02:37', 7, NULL, NULL, NULL, NULL),
(51, 2, 2, 1, 0, 0, 0, '2025-10-29 10:02:37', 7, NULL, NULL, NULL, NULL),
(52, 2, 3, 1, 0, 0, 0, '2025-10-29 10:02:37', 7, NULL, NULL, NULL, NULL),
(53, 2, 4, 1, 0, 0, 0, '2025-10-29 10:02:38', 7, NULL, NULL, NULL, NULL),
(54, 2, 5, 1, 0, 0, 0, '2025-10-29 10:02:38', 7, NULL, NULL, NULL, NULL),
(67, 1, 1, 1, 1, 1, 1, '2025-10-29 10:16:32', 7, NULL, NULL, NULL, NULL),
(68, 1, 6, 0, 0, 0, 0, '2025-10-29 10:16:32', 7, NULL, NULL, NULL, NULL),
(69, 1, 7, 1, 1, 1, 1, '2025-10-29 10:16:32', 7, NULL, NULL, NULL, NULL),
(70, 1, 2, 1, 1, 1, 1, '2025-10-29 10:16:32', 7, NULL, NULL, NULL, NULL),
(71, 1, 3, 1, 1, 1, 1, '2025-10-29 10:16:32', 7, NULL, NULL, NULL, NULL),
(72, 1, 4, 1, 1, 1, 1, '2025-10-29 10:16:32', 7, NULL, NULL, NULL, NULL),
(73, 1, 5, 1, 1, 1, 1, '2025-10-29 10:16:32', 7, NULL, NULL, NULL, NULL),
(88, 3, 1, 1, 0, 0, 0, '2025-10-29 10:21:05', 7, NULL, NULL, NULL, NULL),
(89, 3, 6, 1, 0, 0, 0, '2025-10-29 10:21:05', 7, NULL, NULL, NULL, NULL),
(90, 3, 7, 0, 0, 0, 0, '2025-10-29 10:21:05', 7, NULL, NULL, NULL, NULL),
(91, 3, 2, 0, 0, 0, 0, '2025-10-29 10:21:05', 7, NULL, NULL, NULL, NULL),
(92, 3, 3, 0, 0, 0, 0, '2025-10-29 10:21:05', 7, NULL, NULL, NULL, NULL),
(93, 3, 4, 0, 0, 0, 0, '2025-10-29 10:21:05', 7, NULL, NULL, NULL, NULL),
(94, 3, 5, 0, 0, 0, 0, '2025-10-29 10:21:05', 7, NULL, NULL, NULL, NULL);


INSERT INTO `users` (`id`, `name`, `email`, `password`, `role_id`, `photo`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`) VALUES
(1, 'Admin', 'admin@example.com', '$2a$10$sC4w7xRH3m/AgTVBG4i48O.uwS53Zhcx5kx0RyseoAQU/WvLIleYW', 1, NULL, '2025-10-29 08:53:28', NULL, '2025-10-29 08:57:20', NULL, NULL, NULL),
(2, 'Manager', 'manager@example.com', '$2a$10$yDbvdzf1DZmMnphDwpKK.e.9ITcdIEPRLd3wGqDEXttCS6L7p1cq2', 2, NULL, '2025-10-29 08:53:28', NULL, '2025-10-29 08:57:20', NULL, NULL, NULL),
(3, 'User', 'user@example.com', '$2a$10$YWCSVV0wI12MyKf1ipRhwOdsIgvJFpjGHPylHEDu7D8fqheni3XBu', 3, NULL, '2025-10-29 08:53:28', NULL, '2025-10-29 08:57:20', NULL, NULL, NULL);


