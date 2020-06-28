const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

const cliArgs = process.argv.slice(2).reduce((acc, arg) => {
  const [argName, argValue] = arg.split("=");
  return Object.assign(acc, { [argName]: argValue });
}, {});

const packageJson = cliArgs["--package-json"] || "./package.json";
const buildDirectory = cliArgs["--build-dir"] || "./dist";

const pkg = require(path.resolve(process.cwd(), packageJson));

const remoteDistLocation =
  pkg.versionData.outputPath || path.join(process.cwd(), buildDirectory);
console.log(remoteDistLocation);
const remoteLocation = path.join(
  remoteDistLocation,
  pkg.versionData.dashboardFileName
);
fs.mkdir(
  path.join(remoteDistLocation, pkg.version),
  { recursive: true },
  (err) => {
    if (err) throw err;
  }
);
fs.createReadStream(remoteLocation).pipe(
  fs.createWriteStream(
    path.join(
      remoteDistLocation,
      pkg.version,
      pkg.versionData.dashboardFileName
    )
  )
);

const query = `mutation {
  addVersion(application: "${pkg.name}", version: "${pkg.version}") {
    versions
  }
}`;

fetch("http://localhost:3000/api/graphql", {
  method: "POST",
  body: JSON.stringify({ query }),
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
})
  .then((resp) => resp.json())
  .then((data) => {
    const packagePath = path.join(pkg.versionData.context, "package.json");
    delete pkg.versionData;
    fs.writeFile(
      packagePath,
      JSON.stringify(pkg, null, 2),
      { encoding: "utf-8" },
      () => {}
    );
    console.log(
      `Added version to dashboard, new version list:`,
      data.data.addVersion.versions.join(", ")
    );
  })
  .catch((err) => console.log(err));
