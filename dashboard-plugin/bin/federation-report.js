/* TODO: We need to figure out a new way to do this because the server is currently
looking for version information in the /update call where we send `environment` and `version`
in the payload. I'm hoping we don't need to do this at all now. 

In the new model you can just do:

    new DashboardPlugin({
      ...,
      group: 'admin',            // Default if not specified
      publishVersion: '1.1.0',   // '1.0.0' if not specified
      environment: 'production', // 'development' if not specified
    }),
*/
/*
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
if (pkg.versionData) {
  const remoteDistLocation =
    pkg.versionData.outputPath || path.join(process.cwd(), buildDirectory);
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
  addVersion(application: "${pkg.versionData.name}", version: "${pkg.version}") {
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
    .catch((err) => console.error(err));
}
*/
