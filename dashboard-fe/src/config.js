const cleanObject = (object) => {
  return Object.entries(object).reduce((acc, [key, value]) => {
    if (value === "true") return { ...acc, [key]: true };
    if (value === "false") return { ...acc, [key]: false };
    if (value === "null") return { ...acc, [key]: null };
    if (!isNaN(Number(value))) return { ...acc, [key]: Number(value) };
    return { ...acc, [key]: value };
  }, {});
};

module.exports.privateConfig = !process.browser
  ? cleanObject(
      Object.assign(
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
          WITH_AUTH: process.env.WITH_AUTH,
          VERSION_MANAGER: process.env.VERSION_MANAGER,
          PAGESPEED_KEY: process.env.PAGESPEED_KEY,
          USE_CLOUD: process.env.USE_CLOUD,
        },
        require("dotenv").config().parsed || {}
      )
    )
  : {};

module.exports.publicConfig =
  typeof window === "undefined"
    ? cleanObject(
        Object.assign(
          {},
          {
            AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
            AUTH0_SCOPE: process.env.AUTH0_SCOPE,
            AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
            REDIRECT_URI: process.env.REDIRECT_URI,
            WITH_AUTH: process.env.WITH_AUTH,
            POST_LOGOUT_REDIRECT_URI: process.env.POST_LOGOUT_REDIRECT_URI,
          }
        )
      )
    : JSON.parse(document.getElementById("publicConfig").innerHTML);
