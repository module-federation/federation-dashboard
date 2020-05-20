const fs = require("fs");
const path = require("path");
const vm = require("vm");
const AutomaticVendorFederation = require("@module-federation/automatic-vendor-federation");
const parseOptions = require("webpack/lib/container/parseOptions");

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
                // const sandbox = vm.createContext(context);
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
        let packageJson, vendorFederation;
        try {
          packageJson = require(compilation.options.context + "/package.json");
        } catch (e) {}
        if (packageJson) {
          vendorFederation = AutomaticVendorFederation({
            exclude: [],
            ignoreVersion: false,
            packageJson,
            subPackages: Array.from(directReasons),
            shareFrom: [
              "dependencies",
              "devDependencies",
              "optionalDependencies",
            ],
            ignorePatchVersion: true,
          });
        }
        const dashData = (this._dashData = JSON.stringify({
          topLevelPackage: vendorFederation || null,
          publicPath: compilation.outputOptions.publicPath,
          federationRemoteEntry: RemoteEntryChunk,
          buildHash: stats.hash,
          modules,
          chunkDependencies,
        }));

        Promise.all([
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
        ]).then(() => {
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
