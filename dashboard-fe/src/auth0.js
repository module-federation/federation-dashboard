const { initAuth0 } = require("@auth0/nextjs-auth0");
const { privateConfig } = require("./config");
module.exports = privateConfig.WITH_AUTH
  ? initAuth0({
      clientId: privateConfig.AUTH0_CLIENT_ID,
      clientSecret: privateConfig.AUTH0_CLIENT_SECRET,
      scope: privateConfig.AUTH0_SCOPE,
      domain: privateConfig.AUTH0_DOMAIN,
      redirectUri: privateConfig.REDIRECT_URI,
      postLogoutRedirectUri: privateConfig.POST_LOGOUT_REDIRECT_URI,
      session: {
        cookieSecret: privateConfig.SESSION_COOKIE_SECRET,
        cookieLifetime: privateConfig.SESSION_COOKIE_LIFETIME,
        storeIdToken: false,
        storeRefreshToken: false,
        storeAccessToken: false,
      },
    })
  : {
      handleProfile: () => {},
      handleLogin: () => {},
    };
