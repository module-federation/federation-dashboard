const fs = require("fs");
fs.writeFileSync(
  ".env",
  [
    "auth0_client_secret=" + process.env.AUTH0_CLIENT_SECRET,
    "auth0_session_secret=" + process.env.SESSION_COOKIE_SECRET,
  ].join("\n")
);
