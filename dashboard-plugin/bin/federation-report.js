const http = require("http");
const fs = require("fs");
const path = require("path");

// const version = process.argv[2]
//   ? process.argv[2]
//   : require(path.resolve(process.cwd(),"./package.json")).version;
//
// const data = JSON.stringify({
//   version,
// });
//
// const options = {
//   hostname: "localhost",
//   port: 3000,
//   path: "/write/dsl",
//   method: "POST",
//   headers: {
//     "Content-Type": "application/json",
//     "Content-Length": data.length,
//   },
// };
//   const remoteDistLocaiton = path.join(process.cwd(), "dist");
//   fs.mkdir(path.join(remoteDistLocaiton, version), {recursive: true}, (err) => {
//     if (err) throw err;
//   });
//   fs.createReadStream(path.join(remoteDistLocaiton, "remoteEntry.js")).pipe(
//     fs.createWriteStream(path.join(remoteDistLocaiton, version, "remoteEntry.js"))
//   );
//
//   const req = http.request(options, (res) => {
//     console.log(`statusCode: ${res.statusCode}`);
//
//     res.on("data", (d) => {
//       process.stdout.write(d);
//     });
//   });
//
//   req.on("error", (error) => {
//     console.error(error);
//   });
//
//   req.write(data);
//   req.end();
//
//
//

const cliArgs = process.argv.slice(2).reduce((acc, arg) => {
  const [argName, argValue] = arg.split("=");
  return Object.assign(acc, { [argName]: argValue });
}, {});

const packageJson = cliArgs["--package-json"] || "./package.json";
const buildDirectory = cliArgs["--build-dir"] || "./dist";
console.log(packageJson, buildDirectory);
const pkg = require(path.resolve(process.cwd(), packageJson));

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

const remoteDistLocaiton = path.join(process.cwd(), buildDirectory);
fs.mkdir(
  path.join(remoteDistLocaiton, pkg.version),
  { recursive: true },
  (err) => {
    if (err) throw err;
  }
);
fs.createReadStream(path.join(remoteDistLocaiton, "remoteEntry.js")).pipe(
  fs.createWriteStream(
    path.join(remoteDistLocaiton, pkg.version, "remoteEntry.js")
  )
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
