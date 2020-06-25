if (typeof window === "undefined") {
  /**
   * Settings exposed to the server.
   */
  module.exports = {
    AUTH0_CLIENT_ID: "JldqTRWvEuGSRedeHGMA7hwfOUz4YW3n",
    AUTH0_CLIENT_SECRET:
      "5znZQebom4M8vvyPvQaE-4h_naSYv8vdcAcXoERly4eyKo2MOd7dYraua7Awy4fy",
    AUTH0_SCOPE: process.env.AUTH0_SCOPE,
    AUTH0_DOMAIN: "federation-dashboard.us.auth0.com",
    REDIRECT_URI: "http://localhost:3000/api/callback",
    POST_LOGOUT_REDIRECT_URI: "http://localhost:3000",
    SESSION_COOKIE_SECRET:
      "3m`PfnYrCxQ(taddpfp7!RxNgBmSckWCm&7GeAX#sr!(4'2Vr:Xjr5Ayn2$XXw7",
    SESSION_COOKIE_LIFETIME: 60 * 60 * 8,
  };
} else {
  /**
   * Settings exposed to the client.
   */
  module.exports = {
    AUTH0_CLIENT_ID: "JldqTRWvEuGSRedeHGMA7hwfOUz4YW3n",
    AUTH0_SCOPE: process.env.AUTH0_SCOPE,
    AUTH0_DOMAIN: "federation-dashboard.us.auth0.com",
    REDIRECT_URI: "http://localhost:3000/api/callback",
    POST_LOGOUT_REDIRECT_URI: "http://localhost:3000",
  };
}
