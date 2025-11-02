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
};
