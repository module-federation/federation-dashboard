#!node
const path = require("path");
const { exec } = require("child_process");

const DATA_PATH = process.cwd();

exec("npm run start", {
  cwd: path.resolve(`${__dirname}/..`),
  env: {
    ...process.env,
    DATA_PATH
  }
});
