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

  // Gallery
  ADMIN_GALLERY: prefix + "gallery",
  ADMIN_GALLERY_CREATE: prefix + "gallery/create",
  ADMIN_GALLERY_EDIT: prefix + "gallery",
  ADMIN_GALLERY_DELETE: prefix + "gallery/delete",

  // Platforms
  ADMIN_PLATFORMS: prefix + "platforms",
  ADMIN_PLATFORM_CREATE: prefix + "platforms/create",
  ADMIN_PLATFORM_EDIT: prefix + "platforms",
  ADMIN_PLATFORM_DELETE: prefix + "platforms/delete",
  //

  // Social Media Posts
  ADMIN_SOCIAL_CONNECT: prefix + "social/connect",
  ADMIN_FACEBOOK: prefix + "social/facebook",
  ADMIN_INSTAGRAM: prefix + "social/instagram",
  ADMIN_WHATSAPP: prefix + "social/whatsapp",
  ADMIN_LINKEDIN: prefix + "social/linkedin",
  ADMIN_TWITTER: prefix + "social/twitter",
  ADMIN_BLUESKY: prefix + "social/bluesky",
  ADMIN_REDDIT: prefix + "social/reddit",
  ADMIN_TELEGRAM: prefix + "social/telegram",
  ADMIN_THREADS: prefix + "social/threads",

  // Social Media Posts
  ADMIN_FACEBOOK_POSTS: prefix + "social/facebook/posts",
  ADMIN_FACEBOOK_POSTS_CREATE: prefix + "social/facebook/posts/create",
  ADMIN_INSTAGRAM_POSTS: prefix + "social/instagram/posts",
  ADMIN_THREADS_POSTS: prefix + "social/threads/posts",
  ADMIN_THREADS_POSTS_CREATE: prefix + "social/threads/posts/new",
  ADMIN_YOUTUBE: prefix + "social/youtube/posts",
  ADMIN_YOUTUBE_POSTS: prefix + "social/youtube/posts",
};
