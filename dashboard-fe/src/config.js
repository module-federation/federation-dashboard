if (typeof window === "undefined") {
  /**
   * Settings exposed to the server.
   */
  const { parsed = {} } = require("dotenv").config();

  const envVars = {};

  if (parsed.WITH_AUTH) {
    if (parsed.SESSION_COOKIE_SECRET) {
      process.env.SESSION_COOKIE_SECRET = parsed.SESSION_COOKIE_SECRET;
    }
    if (parsed.AUTH0_CLIENT_SECRET) {
      process.env.AUTH0_CLIENT_SECRET = parsed.AUTH0_CLIENT_SECRET;
    }

    if (!parsed.AUTH0_CLIENT_SECRET && !process.env.AUTH0_CLIENT_SECRET) {
      throw new Error(
        "You are missing environment variables. Make sure you have an .env file or are passing args"
      );
    }
    Object.assign(envVars, {
      AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
      AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
      AUTH0_SCOPE: process.env.AUTH0_SCOPE,
      AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
      REDIRECT_URI: process.env.REDIRECT_URI,
      POST_LOGOUT_REDIRECT_URI: process.env.POST_LOGOUT_REDIRECT_URI,
      SESSION_COOKIE_SECRET: new Buffer.from(
        process.env.SESSION_COOKIE_SECRET,
        "base64"
      ).toString("ascii"),
      SESSION_COOKIE_LIFETIME: 60 * 60 * 8,
    });
  }
  Object.assign(envVars, {
    VERSION_MANAGER: process.env.VERSION_MANAGER == "true",
    PAGESPEED_KEY: process.env.PAGESPEED_KEY,
    USE_CLOUD: process.env.USE_CLOUD == "true",
  });
  module.exports = envVars;
} else {
  const envVars = {};
  /**
   * Settings exposed to the client.
   */
  if (process.env.WITH_AUTH == "true") {
    Object.assign(envVars, {
      AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
      AUTH0_SCOPE: process.env.AUTH0_SCOPE,
      AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
      REDIRECT_URI: process.env.REDIRECT_URI,
      POST_LOGOUT_REDIRECT_URI: process.env.POST_LOGOUT_REDIRECT_URI,
    });
  }
  module.exports = envVars;
}
