const { validateParams } = require("./helpers");
const path = require("path");
const fs = require("fs");

/**
 * Extracts and returns the license/licenses abbrevations
 * from the respective fields.
 * @param  {Object} packageJson The package.json file content as object.
 * @return {String}
 */
function getLicenses(packageJson) {
  if (packageJson.licenses && packageJson.licenses instanceof Array) {
    return packageJson.licenses.map((license) => license.type).join(", ");
  } else if (packageJson.licenses) {
    // TODO: Refactor this to reduce duplicate code. Note "licenses" vs "license".
    return (
      (packageJson.licenses && packageJson.licenses.type) ||
      packageJson.licenses
    );
  }

  return (
    (packageJson.license && packageJson.license.type) || packageJson.license
  );
}

const convertToGraph = (
  {
    name,
    federationRemoteEntry,
    modules,
    topLevelPackage,
    metadata,
    versionData,
    environment,
    version,
    posted,
    group,
    functionRemotes,
    sha,
    buildHash,
  },
  standalone
) => {
  validateParams(
    { federationRemoteEntry, modules, topLevelPackage, metadata },
    standalone
  );

  const app = name;
  const overrides = {};
  const consumes = [];
  const consumesByName = {};
  const modulesObj = {};
  const npmModules = new Map();

  modules.forEach((mod) => {
    const { identifier, reasons, moduleType, nameForCondition, size } = mod;
    const data = identifier.split(" ");
    if (moduleType === "remote-module") {
      if (data.length === 4) {
        const name = data[3].replace("./", "");
        const consume = {
          consumingApplicationID: app,
          applicationID: data[2].replace("webpack/container/reference/", ""),
          name,
          usedIn: new Set(),
        };
        consumes.push(consume);
        consumesByName[nameForCondition] = consume;
      }
      if (reasons) {
        reasons.forEach(({ userRequest, resolvedModule, type }) => {
          if (consumesByName[userRequest]) {
            consumesByName[userRequest].usedIn.add(
              resolvedModule.replace("./", "")
            );
          }
        });
      }
    } else if (data[0] === "container" && data[1] === "entry") {
      JSON.parse(data[3]).forEach(([prefixedName, file]) => {
        const name = prefixedName.replace("./", "");
        modulesObj[file.import[0]] = {
          id: `${app}:${name}`,
          name,
          applicationID: app,
          requires: new Set(),
          file: file.import[0],
        };
      });
    } else if (nameForCondition && nameForCondition.includes("node_modules")) {
      const contextArray = nameForCondition.split(path.sep);
      const afterModule = nameForCondition.split("node_modules/");

      const search = afterModule[1] && afterModule[1].startsWith("@") ? 3 : 2;
      contextArray.splice(contextArray.indexOf("node_modules") + search);

      let context = contextArray.join(path.sep);
      let npmModule = contextArray[contextArray.indexOf("node_modules") + 1];

      let packageJsonFile = path.join(context, "package.json");
      let packageJson = JSON.parse(fs.readFileSync(packageJsonFile, "UTF-8"));

      const existingPackage = npmModules.get(packageJson.name);
      if (existingPackage) {
        const existingReference = existingPackage[packageJson.version];
        const data = {
          name: packageJson.name,
          version: packageJson.version,
          homepage: packageJson.homepage,
          license: getLicenses(packageJson),
          size: ((existingReference && existingReference.size) || 0) + size,
        };
        if (existingReference) {
          Object.assign(existingReference, data);
          npmModules.set(packageJson.name, existingPackage);
        } else {
          existingPackage[packageJson.version] = data;
          npmModules.set(packageJson.name, existingPackage);
        }
      } else {
        const newDep = {
          [packageJson.version]: {
            name: packageJson.name,
            version: packageJson.version,
            homepage: packageJson.homepage,
            license: getLicenses(packageJson),
            size: size,
          },
        };
        npmModules.set(packageJson.name, newDep);
      }
    }
  });

  const convertDeps = (deps = {}) =>
    Object.entries(deps).map(([version, name]) => {
      const dataFromGraph = npmModules.get(name);

      const versionVal = version.replace(`${name}-`, "");
      if (dataFromGraph) {
        const foundInGraph = Object.values(dataFromGraph).find((depData) => {
          return depData.version.startsWith(versionVal);
        });

        if (foundInGraph) {
          const { name, version, license, size } = foundInGraph;
          return {
            name,
            version,
            license,
            size,
          };
        }
      }
      return {
        name,
        version: versionVal,
      };
    });
  const convertedDeps = {
    dependencies: convertDeps(topLevelPackage.dependencies),
    devDependencies: convertDeps(topLevelPackage.devDependencies),
    optionalDependencies: convertDeps(topLevelPackage.optionalDependencies),
  };

  modules.forEach((mod) => {
    const { identifier, issuerName, reasons, moduleType } = mod;

    if (moduleType === "provide-module") {
      const data = identifier.split(" ");
      if (issuerName) {
        // This is a hack
        const issuerNameMinusExtension = issuerName.replace(".js", "");
        if (modulesObj[issuerNameMinusExtension]) {
          modulesObj[issuerNameMinusExtension].requires.add(data[2]);
        }
      }
      if (reasons) {
        reasons.forEach(({ module }) => {
          // filters out entrypoints
          if (module) {
            const moduleMinusExtension = module.replace(".js", "");
            if (modulesObj[moduleMinusExtension]) {
              modulesObj[moduleMinusExtension].requires.add(data[2]);
            }
          }
        });
      }
      let name, version;
      if (data[3].startsWith("@")) {
        const splitInfo = data[3].split("@");
        splitInfo[0] = "@";
        name = splitInfo[0] + splitInfo[1];
        version = splitInfo[2];
      } else if (data[3].includes("@")) {
        [name, version] = data[3].split("@");
      } else {
        [
          convertedDeps.dependencies,
          convertedDeps.devDependencies,
          convertedDeps.optionalDependencies,
        ].forEach((deps) => {
          const dep = deps.find(({ name }) => name === data[2]);
          if (dep) {
            version = dep.version;
          }
        });
      }

      overrides[name] = {
        id: name,
        name: name,
        version,
        location: name,
        applicationID: app,
      };
    }

    if (moduleType === "consume-shared-module") {
      const data = identifier.split("|");
      if (issuerName) {
        // This is a hack
        const issuerNameMinusExtension = issuerName.replace(".js", "");
        if (modulesObj[issuerNameMinusExtension]) {
          modulesObj[issuerNameMinusExtension].requires.add(data[2]);
        }
      }
      if (reasons) {
        reasons.forEach(({ module }) => {
          // filters out entrypoints
          if (module) {
            const moduleMinusExtension = module.replace(".js", "");
            if (modulesObj[moduleMinusExtension]) {
              modulesObj[moduleMinusExtension].requires.add(data[2]);
            }
          }
        });
      }
      let version = "";

      if (data[3].startsWith("=")) {
        version = data[3].replace("=", "");
      } else {
        [
          convertedDeps.dependencies,
          convertedDeps.devDependencies,
          convertedDeps.optionalDependencies,
        ].forEach((deps) => {
          const dep = deps.find(({ name }) => name === data[2]);
          if (dep) {
            version = dep.version;
          }
        });
      }
      overrides[data[2]] = {
        id: data[2],
        name: data[2],
        version,
        location: data[2],
        applicationID: app,
      };
    }
  });

  // TODO move this into the main consumes loop
  if (Array.isArray(functionRemotes)) {
    const dynamicConsumes = Object.values(
      functionRemotes.reduce((acc, [file, applicationID, name]) => {
        const cleanName = name.replace("./", "");
        const objectId = applicationID + "/" + cleanName;
        const cleanFile = file.replace("./", "");
        const foundExistingConsume = consumes.find((consumeObj) => {
          return (
            consumeObj.applicationID === applicationID &&
            consumeObj.name === cleanName
          );
        });
        if (foundExistingConsume) {
          foundExistingConsume.usedIn.add(cleanFile);
          return acc;
        }
        if (acc[objectId]) {
          acc[objectId].usedIn.add(cleanFile);
          return acc;
        }
        acc[objectId] = {
          applicationID,
          name: cleanName,
          consumingApplicationID: app,
          usedIn: new Set([cleanFile]),
        };
        return acc;
      }, {})
    );
    consumes.push(...dynamicConsumes);
  }

  const sourceUrl = metadata && metadata.source ? metadata.source.url : "";
  const remote = metadata && metadata.remote ? metadata.remote : "";

  const out = {
    ...convertedDeps,
    id: app,
    name: app,
    remote,
    metadata,
    versionData,
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
    environment,
    version,
    posted,
    group,
    sha,
    buildHash,
  };

  return out;
};

module.exports = convertToGraph;
