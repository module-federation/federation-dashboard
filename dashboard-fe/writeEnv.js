const fs = require("fs");
const os = require("os");
fs.writeFileSync(
  ".env",
  [
    "AUTH0_CLIENT_SECRET=" + JSON.stringify(process.env.AUTH0_CLIENT_SECRET),
    "AUTH0_CLIENT_SECRET=" + JSON.stringify(process.env.SESSION_COOKIE_SECRET),
  ].join(os.EOL)
);
console.log(fs.readFileSync("./.env").toString().split("").reverse());
