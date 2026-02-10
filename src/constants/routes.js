const prefix = "/portal/";

export const ROUTES = {
  HOME: "/",
  PORTAL_LOGIN: "/auth/login",
  PORTAL_DASHBOARD: prefix + "dashboard",

  // Users
  PORTAL_USER: prefix + "users",
  PORTAL_USER_CREATE: prefix + "users/create",
  PORTAL_USER_EDIT: prefix + "users",
  PORTAL_USER_DELETE: prefix + "users/delete",

  // Roles
  PORTAL_ROLE: prefix + "roles",
  PORTAL_ROLE_CREATE: prefix + "roles/create",
  PORTAL_ROLE_EDIT: prefix + "roles",
  PORTAL_ROLE_DELETE: prefix + "roles/delete",

  // Permissions
  PORTAL_PERMISSION: prefix + "permissions",
  PORTAL_PERMISSION_CREATE: prefix + "permissions/create",
  PORTAL_PERMISSION_EDIT: prefix + "permissions",
  PORTAL_PERMISSION_DELETE: prefix + "permissions/delete",

  // Gallery
  PORTAL_GALLERY: prefix + "gallery",
  PORTAL_GALLERY_CREATE: prefix + "gallery/create",
  PORTAL_GALLERY_EDIT: prefix + "gallery",
  PORTAL_GALLERY_DELETE: prefix + "gallery/delete",

  // Platforms
  PORTAL_PLATFORMS: prefix + "platforms",
  PORTAL_PLATFORM_CREATE: prefix + "platforms/create",
  PORTAL_PLATFORM_EDIT: prefix + "platforms",
  PORTAL_PLATFORM_DELETE: prefix + "platforms/delete",
  //

  // Social Media Posts
  PORTAL_SOCIAL_CONNECT: prefix + "social/connect",
  PORTAL_FACEBOOK: prefix + "social/facebook",
  PORTAL_INSTAGRAM: prefix + "social/instagram",
  PORTAL_WHATSAPP: prefix + "social/whatsapp",
  PORTAL_LINKEDIN: prefix + "social/linkedin",
  PORTAL_LINKEDIN_POSTS: prefix + "social/linkedin/posts",
  PORTAL_TWITTER: prefix + "social/twitter",
  PORTAL_BLUESKY: prefix + "social/bluesky",
  PORTAL_REDDIT: prefix + "social/reddit",
  PORTAL_TELEGRAM: prefix + "social/telegram",
  PORTAL_THREADS: prefix + "social/threads",

  // Social Media Posts
  PORTAL_FACEBOOK_POSTS: prefix + "social/facebook/posts",
  PORTAL_FACEBOOK_POSTS_CREATE: prefix + "social/facebook/posts/create",
  PORTAL_INSTAGRAM_POSTS: prefix + "social/instagram/posts",
  PORTAL_THREADS_POSTS: prefix + "social/threads/posts",
  PORTAL_BLUESKY_POSTS: prefix + "social/bluesky/posts",
  PORTAL_THREADS_POSTS_CREATE: prefix + "social/threads/posts/new",
  PORTAL_YOUTUBE: prefix + "social/youtube/posts",
  PORTAL_YOUTUBE_POSTS: prefix + "social/youtube/posts",
  PORTAL_TIKTOK: prefix + "social/tiktok",
  PORTAL_TIKTOK_POSTS: prefix + "social/tiktok/posts",
  PORTAL_PINTEREST: prefix + "social/pinterest",
  PORTAL_PINTEREST_POSTS: prefix + "social/pinterest/posts",
  PORTAL_AI_HUB: prefix + "ai-hub",
  PORTAL_CONTACT: prefix + "contact",
};
