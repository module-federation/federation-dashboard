"use strict";
const createApp = require("./app");
const http = require("http");
const next = require("next");
const path = require("path");

const start = async () => {
  // Provide runtime config for frontend
  const nextApp = next({
    dir: path.resolve(__dirname, "../"),
    dev: process.env.NODE_ENV !== "production",
  });
  const nextRoutesHandler = nextApp.getRequestHandler();

  const app = createApp({ nextRoutesHandler });

  const server = http.createServer(app).listen(
    {
      port: 3000,
    },
    () => {
      const { port } = server.address();
      // eslint-disable-next-line no-console
      console.log(`Server started at http://localhost:${port}`);
    }
  );
  var port = server.address().port;
  const ip = require("ip");

  global.internalAddress = "http://" + ip.address() + ":" + port;
};

if (require.main === module) {
  start().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  });
}

// LAMBDA: Export handler for lambda use.
let handler;
module.exports.handler = (event, context, callback) => {
  // Provide runtime config for frontend
  process.env.PUBLIC_CONFIG = JSON.stringify(config.get("public"));
  // Provide runtime next config for server
  process.env.SERVER_NEXT_CONFIG = JSON.stringify(config.get("serverNext"));
  // Lazy require `serverless-http` to allow non-Lambda targets to omit.
  // eslint-disable-next-line global-require
  handler = handler || require("serverless-http")(app);
  return handler(event, context, callback);
};
