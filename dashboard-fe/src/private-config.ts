export interface IPrivateConfig {
  AUTH0_CLIENT_ID?: string;
  AUTH0_CLIENT_SECRET?: string;
  AUTH0_SCOPE?: string;
  AUTH0_DOMAIN?: string;
  REDIRECT_URI?: string;
  POST_LOGOUT_REDIRECT_URI?: string;
  SESSION_COOKIE_SECRET?: Buffer;
  SESSION_COOKIE_LIFETIME?: number;
  WITH_AUTH?: string;
  VERSION_MANAGER?: string;
  PAGESPEED_KEY?: string;
  USE_CLOUD?: string;
}
