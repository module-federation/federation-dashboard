const http = require("http");

const pkg = require("./package.json");
const data = `mutation {
  addVersion(application: "${pkg.name}", version: "${pkg.version}") {
    versions
  }
}`;

const options = {
  hostname: "localhost",
  port: 3010,
  path: "/api/graph",
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
