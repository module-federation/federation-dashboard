const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const fs = require("fs");
const cors = require("cors");

app.use(bodyParser.json());

var whitelist = ["http://localhost:3001"];
var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
  console.log(whitelist.indexOf(req.header("Origin")));
  if (whitelist.indexOf(req.header("Origin")) !== -1) {
    corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false }; // disable CORS for this request
  }
  callback(null, corsOptions); // callback expects two parameters: error and options
};

// This server reads versions.json anytime it does anything so that you can edit
// that file on the fly and see new results.

const setVersions = (versions) =>
  fs.writeFileSync("./versions.json", JSON.stringify(versions, null, 2));
const getVersions = () =>
  JSON.parse(fs.readFileSync("./versions.json").toString());

/*
Returns all the version information (not required for API completeness)

curl "http://localhost:3010/"
*/

app.get("/", cors(corsOptionsDelegate), (_, res) => {
  res.send(getVersions());
});

/*
Returns the versions and current version for a given application

curl "http://localhost:3010/home"
*/

app.get("/:app", (req, res) => {
  const versions = getVersions();
  const app = req.params.app;
  if (versions[app]) {
    res.send(versions[app]);
  } else {
    res.status(404);
    res.send({ error: "Unkown application" });
  }
});

app.post("/write/:app", (req, res) => {
  const versions = getVersions();
  const app = req.params.app;
  if (versions[app]) {
    if (!versions[app].versions.includes(req.body.version)) {
      console.log(`Application ${app} now at version ${req.body.version}`);
      versions[app].versions.push(req.body.version);
      versions[app].latest = req.body.version;
      setVersions(versions);
      res.send(versions[app]);
    } else {
      res.status(404);
      res.send({ error: "Version already Exists" });
    }
  } else {
    res.status(404);
    res.send({ error: "Unknown application" });
  }
});

/*
Sets the override version for a particular consuming application.

For example this code will tell the version manager to set the version of `dsl` for the `home` application to 1.0.0.

curl "http://localhost:3010/home/dsl" -X POST -d "{\"version\": \"1.0.0\"}" -H "content-type: application/json"

For example this code will tell the version manager to set the version of `dsl` for the `home` application to 1.0.0.

curl "http://localhost:3010/home/dsl" -X POST -d "{}" -H "content-type: application/json"
*/

app.post("/:consumer/:app", (req, res) => {
  const versions = getVersions();
  const app = req.params.app;
  const consumer = req.params.consumer;
  if (versions[consumer]) {
    if (req.body.version) {
      if (versions[app].versions.includes(req.body.version)) {
        console.log(
          `Application ${app} now at version ${req.body.version} only on ${req.params.consumer}`
        );

        versions[consumer].latest = req.body.version;
        versions[consumer].override = [
          ...versions[consumer].override.filter(({ name }) => name !== app),
          { name: app, version: req.body.version },
        ];
        setVersions(versions);
        res.send(versions[consumer]);
      } else {
        res.status(404);
        res.send({ error: "Unkown version" });
      }
    } else {
      console.log(
        `Application ${app} now at default version (${versions[app].latest}) only on ${req.params.consumer}`
      );

      versions[consumer].override = versions[consumer].override.filter(
        ({ name }) => name !== app
      );

      setVersions(versions);
      res.send(versions[consumer]);
    }
  } else {
    res.status(404);
    res.send({ error: "Unkown application" });
  }
});

/*
Sets the current version for a given application

curl "http://localhost:3010/home" -X POST -d "{\"version\": \"1.0.0\"}" -H "content-type: application/json"
*/

app.post("/:app", (req, res) => {
  const versions = getVersions();
  const app = req.params.app;
  if (versions[app]) {
    if (versions[app].versions.includes(req.body.version)) {
      console.log(`Application ${app} now at version ${req.body.version}`);

      versions[app].latest = req.body.version;
      setVersions(versions);
      res.send(versions[app]);
    } else {
      res.status(404);
      res.send({ error: "Unkown version" });
    }
  } else {
    res.status(404);
    res.send({ error: "Unkown application" });
  }
});

const port = process.env.PORT || 3010;
app.listen(port, () =>
  console.log(`Version manager listening at http://localhost:${port}`)
);
