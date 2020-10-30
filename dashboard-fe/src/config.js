export const privateConfig = !process.browser
  ? Object.assign(
      {
        AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
        AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
        AUTH0_SCOPE: process.env.AUTH0_SCOPE,
        AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
        REDIRECT_URI: process.env.REDIRECT_URI,
        POST_LOGOUT_REDIRECT_URI: process.env.POST_LOGOUT_REDIRECT_URI,
        SESSION_COOKIE_SECRET: process.env.SESSION_COOKIE_SECRET
          ? new Buffer.from(
              process.env.SESSION_COOKIE_SECRET,
              "base64"
            ).toString("ascii")
          : undefined,
        SESSION_COOKIE_LIFETIME: 60 * 60 * 8,
        WITH_AUTH: process.env.WITH_AUTH == "true",
        VERSION_MANAGER: process.env.VERSION_MANAGER == "true",
        PAGESPEED_KEY: process.env.PAGESPEED_KEY,
        USE_CLOUD: process.env.USE_CLOUD == "true",
      },
      require("dotenv").config()?.parsed
    )
  : {};

export const publicConfig =
  typeof window === "undefined"
    ? Object.assign(
        {},
        {
          AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
          AUTH0_SCOPE: process.env.AUTH0_SCOPE,
          AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
          REDIRECT_URI: process.env.REDIRECT_URI,
          WITH_AUTH: process.env.WITH_AUTH == "true",
          POST_LOGOUT_REDIRECT_URI: process.env.POST_LOGOUT_REDIRECT_URI,
        }
      )
    : JSON.parse(document.getElementById("publicConfig").innerHTML);
