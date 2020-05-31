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
    compiler.hooks.afterEmit.tapAsync(
      PLUGIN_NAME,
      /**
       * @param {Compilation} compilation
       * @param {function(err: Error | undefined):void} callback
       */
      async (compilation, callback) => {
        const stats = compilation.getStats().toJson();
        const liveStats = compilation.getStats();

        const hashPath = path.join(
          compilation.options.output.path,
          this._options.filename
        );
        const statsPath = path.join(
          compilation.options.output.path,
          "stats.json"
        );
        const modules = stats.modules.filter((module) => {
          const array = [
            module.name.includes("container entry"),
            module.name.includes("remote "),
            module.name.includes("overridable "),
            module.name.includes("remote overrides "),
          ];
          return array.some((item) => item);
        });
        const directReasons = new Set();
        Array.from(modules).forEach((module) => {
          if (module.reasons) {
            module.reasons.forEach((reason) => {
              if (reason.userRequest) {
                try {
                  const subsetPackage = require(reason.userRequest +
                    "/package.json");

                  directReasons.add(subsetPackage);
                } catch (e) {}
              }
            });
          }
        });
        const RemoteEntryChunk = stats.chunks.find((chunk) => {
          const specificChunk = chunk.names.find((name) => {
            return name === FederationPluginOptions.name;
          });
          return specificChunk;
        });

        const AllReferencedChunksByRemote = liveStats.compilation.namedChunks
          .get(FederationPluginOptions.name)
          .getAllReferencedChunks();

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
          packageJson = require(compilation.options.context + "/package.json");
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
          metadata: this._options.metadata || {},
          topLevelPackage: vendorFederation || {},
          publicPath: compilation.outputOptions.publicPath,
          federationRemoteEntry: RemoteEntryChunk,
          buildHash: stats.hash,
          modules,
          chunkDependencies,
        };

        console.log(rawData);
        const graphData = convertToGraph(rawData);

        const dashData = (this._dashData = JSON.stringify(graphData));

        const writePromises = [
          new Promise((resolve) => {
            fs.writeFile(hashPath, dashData, { encoding: "utf-8" }, resolve);
          }),
          new Promise((resolve) => {
            fs.writeFile(
              statsPath,
              JSON.stringify(stats),
              { encoding: "utf-8" },
              resolve
            );
          }),
        ];

        if (this._options.dashboardURL) {
          writePromises.push(
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
            })
          );
        }

        Promise.all(writePromises).then(() => {
          callback();
        });
      }
    );

    compiler.hooks.afterDone.tap(PLUGIN_NAME, (stats) => {
      if (this._options.reportFunction) {
        // this._options.reportFunction(this._dashData);
      }
    });
  }
}

module.exports = FederationDashboardPlugin;
