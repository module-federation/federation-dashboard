const fs = require("fs");
const path = require("path");

const importData = ({ federationRemoteEntry, modules }) => {
  const app = federationRemoteEntry.origins[0].loc;
  const overrides = {};
  const consumes = [];
  const modulesObj = {};

  modules.forEach(({ identifier }) => {
    const data = identifier.split(" ");
    if (data[0] === "remote") {
      if (data.length === 4) {
        consumes.push({
          consumingApplicationID: app,
          applicationID: data[1].replace("webpack/container/reference/", ""),
          name: data[2],
        });
      }
    } else if (data[0] === "container" && data[1] === "entry") {
      JSON.parse(data[2]).forEach(([name, file]) => {
        modulesObj[file] = {
          id: `${app}:${name}`,
          name,
          applicationID: app,
          requires: new Set(),
          file,
        };
      });
    }
  });

  modules.forEach(({ identifier, issuerName, reasons }) => {
    const data = identifier.split("|");
    if (data[0] === "overridable") {
      if (issuerName) {
        // This is a hack
        const issuerNameMinusExtension = issuerName.replace(".js", "");
        if (modulesObj[issuerNameMinusExtension]) {
          modulesObj[issuerNameMinusExtension].requires.add(data[3]);
        }
      }
      if (reasons) {
        reasons.forEach(({ module }) => {
          const moduleMinusExtension = module.replace(".js", "");
          if (modulesObj[moduleMinusExtension]) {
            modulesObj[moduleMinusExtension].requires.add(data[3]);
          }
        });
      }
      overrides[data[3]] = {
        id: data[3],
        name: data[3],
        version: data[1],
        location: data[2],
        applicationID: app,
      };
    }
  });

  const out = {
    id: app,
    name: app,
    overrides: Object.values(overrides),
    consumes,
    modules: Object.values(modulesObj).map((mod) => ({
      ...mod,
      requires: Array.from(mod.requires.values()),
    })),
  };

  return out;
};

const graph = [];
process.argv.slice(2).forEach((fname) => {
  const json = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../data", fname)).toString()
  );
  graph.push(importData(json));
});

fs.writeFileSync(
  path.join(__dirname, "../data/graph.json"),
  JSON.stringify(graph, null, 2)
);
