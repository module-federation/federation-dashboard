const http = require("http");
const fs = require("fs");
const path = require("path");

const version = process.argv[2]
  ? process.argv[2]
  : require("./package.json").version;

const data = JSON.stringify({
  version,
});

const options = {
  hostname: "localhost",
  port: 3010,
  path: "/write/dsl",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": data.length,
  },
};
const remoteDistLocaiton = path.join(process.cwd(), "dist");
fs.mkdir(path.join(remoteDistLocaiton, version), { recursive: true }, (err) => {
  if (err) throw err;
});
fs.createReadStream(path.join(remoteDistLocaiton, "remoteEntry.js")).pipe(
  fs.createWriteStream(path.join(remoteDistLocaiton, version, "remoteEntry.js"))
);

const req = http.request(options, (res) => {
  console.log(`statusCode: ${res.statusCode}`);

  res.on("data", (d) => {
    process.stdout.write(d);
  });
});

req.on("error", (error) => {
  console.error(error);
});

req.write(data);
req.end();
