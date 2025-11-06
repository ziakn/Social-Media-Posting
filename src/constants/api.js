// For API endpoints
const API_PREFIX = "/api/admin";

export const API_ROUTES = {
  LOGIN: `${API_PREFIX}/auth/login`,
  LOGOUT: `${API_PREFIX}/auth/logout`,


   VERIFY_AUTH: API_PREFIX+'/auth/verify',

  // Users
  USERS: `${API_PREFIX}/users`,
  USERS_CREATE: `${API_PREFIX}/users`,
  USERS_EDIT: `${API_PREFIX}/users`,

  // Roles
  ROLES: `${API_PREFIX}/roles`,
  ROLES_CREATE: `${API_PREFIX}/roles`,
  ROLES_EDIT: `${API_PREFIX}/roles`,
};