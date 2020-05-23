import fs from "fs";
import path from "path";

import { update } from "./db";

const importData = ({
  federationRemoteEntry,
  modules,
  topLevelPackage,
  metadata,
}) => {
  const app = federationRemoteEntry.origins[0].loc;
  const overrides = {};
  const consumes = [];
  const consumesByName = {};
  const modulesObj = {};

  modules.forEach(({ identifier, reasons }) => {
    const data = identifier.split(" ");
    if (data[0] === "remote") {
      if (data.length === 4) {
        const consume = {
          consumingApplicationID: app,
          applicationID: data[1].replace("webpack/container/reference/", ""),
          name: data[2],
          usedIn: new Set(),
        };
        consumes.push(consume);
        consumesByName[`${consume.applicationID}/${data[2]}`] = consume;
      }
      if (reasons) {
        reasons.forEach(({ userRequest, resolvedModule, type }) => {
          if (consumesByName[userRequest]) {
            consumesByName[userRequest].usedIn.add(resolvedModule);
          }
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

  const convertDeps = (deps = {}) =>
    Object.entries(deps).map(([version, name]) => ({
      name,
      version: version.replace(`${name}-`, ""),
    }));
  const convertedDeps = {
    dependencies: convertDeps(topLevelPackage.dependencies),
    devDependencies: convertDeps(topLevelPackage.devDependencies),
    optionalDependencies: convertDeps(topLevelPackage.optionalDependencies),
  };

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

      let version = "";
      [
        convertedDeps.dependencies,
        convertedDeps.devDependencies,
        convertedDeps.optionalDependencies,
      ].forEach((deps) => {
        const dep = deps.find(({ name }) => name === data[3]);
        if (dep) {
          version = dep.version;
        }
      });

      overrides[data[3]] = {
        id: data[3],
        name: data[3],
        version,
        location: data[2],
        applicationID: app,
      };
    }
  });

  const sourceUrl = metadata && metadata.source ? metadata.source.url : "";

  const out = {
    ...convertedDeps,
    id: app,
    name: app,
    remote: metadata.remote || "",
    overrides: Object.values(overrides),
    consumes: consumes.map((con) => ({
      ...con,
      usedIn: Array.from(con.usedIn.values()).map((file) => ({
        file,
        url: `${sourceUrl}/${file}`,
      })),
    })),
    modules: Object.values(modulesObj).map((mod) => ({
      ...mod,
      requires: Array.from(mod.requires.values()),
    })),
  };

  return out;
};

export default (req, res) => {
  update(importData(req.body));
  res.send(true);
};
