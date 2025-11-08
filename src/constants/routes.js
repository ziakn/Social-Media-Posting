const prefix = "/admin/";

export const ROUTES = {
  HOME: "/",
  ADMIN_LOGIN: "/auth/login",
  ADMIN_DASHBOARD: prefix + "dashboard",

  // Users
  ADMIN_USER: prefix + "users",
  ADMIN_USER_CREATE: prefix + "users/create",
  ADMIN_USER_EDIT: prefix + "users",
  ADMIN_USER_DELETE: prefix + "users/delete",

  // Roles
  ADMIN_ROLE: prefix + "roles",
  ADMIN_ROLE_CREATE: prefix + "roles/create",
  ADMIN_ROLE_EDIT: prefix + "roles",
  ADMIN_ROLE_DELETE: prefix + "roles/delete",

  // Permissions
  ADMIN_PERMISSION: prefix + "permissions",
  ADMIN_PERMISSION_CREATE: prefix + "permissions/create",
  ADMIN_PERMISSION_EDIT: prefix + "permissions",
  ADMIN_PERMISSION_DELETE: prefix + "permissions/delete",
};
