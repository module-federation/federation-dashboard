const fs = require("fs");
fs.writeFileSync(
  ".env",
  [process.env.AUTH0_CLIENT_SECRET, process.env.SESSION_COOKIE_SECRET].join(
    "\n"
  )
);
console.log(fs.readFileSync("./.env").toString("base64"));
