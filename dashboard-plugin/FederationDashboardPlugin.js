const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const AutomaticVendorFederation = require("@module-federation/automatic-vendor-federation");
const convertToGraph = require("./convertToGraph");

/** @typedef {import('webpack/lib/Compilation')} Compilation */
/** @typedef {import('webpack/lib/Compiler')} Compiler */

/**
 * @typedef FederationDashboardPluginOptions
 * @property {string} filename
 * @property {function} reportFunction
 */

const PLUGIN_NAME = "FederationDashboardPlugin";

class FederationDashboardPlugin {
  /**
   *
   * @param {FederationDashboardPluginOptions} options
   */
  constructor(options) {
    this._options = options;
    this._dashData = null;
  }

  /**
   * @param {Compiler} compiler
   */
  apply(compiler) {
    const FederationPlugin = compiler.options.plugins.find((plugin) => {
      return plugin.constructor.name === "ModuleFederationPlugin";
    });
    let FederationPluginOptions;
    if (FederationPlugin) {
      FederationPluginOptions = FederationPlugin._options;
    }

    compiler.hooks.afterDone.tap(PLUGIN_NAME, (liveStats) => {
      const stats = liveStats.toJson();

      const modules = stats.modules.filter((module) => {
        const array = [
          module.name.includes("container entry"),
          module.name.includes("remote "),
          module.name.includes("shared module "),
          module.name.includes("provide module "),
        ];
        return array.some((item) => item);
      });
      const directReasons = new Set();
      Array.from(modules).forEach((module) => {
        if (module.reasons) {
          module.reasons.forEach((reason) => {
            if (reason.userRequest) {
              try {
                // grab user required package.json
                const subsetPackage = require(reason.userRequest +
                  "/package.json");

                directReasons.add(subsetPackage);
              } catch (e) {}
            }
          });
        }
      });
      // get RemoteEntryChunk
      const RemoteEntryChunk = stats.chunks.find((chunk) => {
        const specificChunk = chunk.names.find((name) => {
          return name === FederationPluginOptions.name;
        });
        return specificChunk;
      });

      const namedChunkRefs = liveStats.compilation.namedChunks.get(
        FederationPluginOptions.name
      );
      const AllReferencedChunksByRemote = namedChunkRefs
        ? namedChunkRefs.getAllReferencedChunks()
        : [];

      const validChunkArray = [];
      AllReferencedChunksByRemote.forEach((chunk) => {
        if (chunk.id !== FederationPluginOptions.name) {
          validChunkArray.push(chunk);
        }
      });

      function mapToObjectRec(m) {
        let lo = {};
        for (let [k, v] of Object.entries(m)) {
          if (v instanceof Map) {
            lo[k] = mapToObjectRec(v);
          } else if (v instanceof Set) {
            lo[k] = mapToObjectRec(Array.from(v));
          } else {
            lo[k] = v;
          }
        }
        return lo;
      }

      const chunkDependencies = validChunkArray.reduce((acc, chunk) => {
        const subset = chunk.getAllReferencedChunks();
        const stringifiableChunk = Array.from(subset).map((sub) => {
          const cleanSet = Object.getOwnPropertyNames(sub).reduce(
            (acc, key) => {
              if (key === "_groups") return acc;
              return Object.assign(acc, { [key]: sub[key] });
            },
            {}
          );
          return mapToObjectRec(cleanSet);
        });
        return Object.assign(acc, {
          [chunk.id]: stringifiableChunk,
        });
      }, {});
      let packageJson,
        vendorFederation = {};
      try {
        packageJson = require(liveStats.compilation.options.context +
          "/package.json");
      } catch (e) {}
      if (packageJson) {
        vendorFederation.dependencies = AutomaticVendorFederation({
          exclude: [],
          ignoreVersion: false,
          packageJson,
          subPackages: Array.from(directReasons),
          shareFrom: ["dependencies"],
          ignorePatchVersion: true,
        });
        vendorFederation.devDependencies = AutomaticVendorFederation({
          exclude: [],
          ignoreVersion: false,
          packageJson,
          subPackages: Array.from(directReasons),
          shareFrom: ["devDependencies"],
          ignorePatchVersion: true,
        });
        vendorFederation.optionalDependencies = AutomaticVendorFederation({
          exclude: [],
          ignoreVersion: false,
          packageJson,
          subPackages: Array.from(directReasons),
          shareFrom: ["optionalDependencies"],
          ignorePatchVersion: true,
        });
      }

      const rawData = {
        name: FederationPluginOptions.name,
        metadata: this._options.metadata || {},
        topLevelPackage: vendorFederation || {},
        publicPath: stats.publicPath,
        federationRemoteEntry: RemoteEntryChunk,
        buildHash: stats.hash,
        modules,
        chunkDependencies,
      };

      let graphData = null;
      try {
        graphData = convertToGraph(rawData);
      } catch (err) {
        console.warn("Error during dashboard data processing");
        console.warn(err);
      }

      if (graphData) {
        const dashData = (this._dashData = JSON.stringify(graphData));

        if (this._options.filename) {
          const hashPath = path.join(stats.outputPath, this._options.filename);
          fs.writeFile(hashPath, dashData, { encoding: "utf-8" }, () => {});
        }

        const statsPath = path.join(stats.outputPath, "stats.json");
        fs.writeFile(
          statsPath,
          JSON.stringify(stats),
          { encoding: "utf-8" },
          () => {}
        );

        if (this._options.dashboardURL) {
          new Promise((resolve) => {
            fetch(this._options.dashboardURL, {
              method: "POST",
              body: dashData,
              headers: {
                Accept: "application/json",
                "Content-type": "application/json",
              },
            })
              .then((resp) => resp.json())
              .then(resolve)
              .catch(() => {
                console.warn(
                  `Error posting data to dashboard URL: ${this._options.dashboardURL}`
                );
                resolve();
              });
          });
        }
      }
    });
  }
}

module.exports = FederationDashboardPlugin;
