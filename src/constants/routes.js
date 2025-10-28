const prefix = "/admin/";
export const ROUTES = {
  HOME: "/",
  ADMIN_LOGIN: "/auth/login",
  ADMIN_DASHBOARD: prefix + "dashboard", 
  ADMIN_USER: prefix + "users", 
  ADMIN_USER_CREATE: prefix + "users/create", 
  ADMIN_USER_EDIT: prefix + "users", 
  ADMIN_USER_DELETE: prefix + "users/delete", 
};
