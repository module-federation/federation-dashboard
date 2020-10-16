"use strict";

const next = require("next");
const path = require("path");
const http = require("http");
const createApp = require("./app");

const start = async () => {
  // Provide runtime config for frontend

  const nextApp = next({
    dir: path.resolve(__dirname, "../"),
    dev: process.env.NODE_ENV !== "production"
  });
  await nextApp.prepare();
  const nextRoutesHandler = nextApp.getRequestHandler();

  const app = createApp({ nextRoutesHandler });

  const server = http.createServer(app).listen(
    {
      port: 3000
    },
    () => {
      const { port } = server.address();
      // eslint-disable-next-line no-console
      console.log(`Server started at http://localhost:${port}`);
    }
  );
};

if (require.main === module) {
  start().catch(err => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  });
}
