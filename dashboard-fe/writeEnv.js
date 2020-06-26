const fs = require("fs");
fs.writeFileSync(
  ".env",
  [
    "AUTH0_CLIENT_SECRET=" + JSON.stringify(process.env.AUTH0_CLIENT_SECRET),
    "AUTH0_CLIENT_SECRET=" + JSON.stringify(process.env.SESSION_COOKIE_SECRET),
  ].join("\n")
);
