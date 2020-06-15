console.log();
const http = require("http");

const data = JSON.stringify({
  version: require("./package.json").version,
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
