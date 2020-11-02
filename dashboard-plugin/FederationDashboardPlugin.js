const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const AutomaticVendorFederation = require("@module-federation/automatic-vendor-federation");
const convertToGraph = require("./convertToGraph");
const DefinePlugin = require("webpack/lib/DefinePlugin");

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
    this._options = Object.assign({ filename: "dashboard.json" }, options);
    this._dashData = null;
  }

  /**
   * @param {Compiler} compiler
   */
  apply(compiler) {
    const FederationPlugin = compiler.options.plugins.find(plugin => {
      return plugin.constructor.name === "ModuleFederationPlugin";
    });
    if (FederationPlugin) {
      this.FederationPluginOptions = FederationPlugin._options;
    } else if (this._options.standalone) {
      this.FederationPluginOptions = this._options.standalone;
    } else {
      throw new Error(
        "Dashboard plugin is missing Module Federation or standalone option"
      );
    }
    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, compilation => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: PLUGIN_NAME,
          stage: compilation.constructor.PROCESS_ASSETS_STAGE_REPORT
        },
        () => this.processWebpackGraph(compilation)
      );
    });
    console.log({"process.CURRENT_HOST": JSON.stringify(this.FederationPluginOptions.name)})

    if(this.FederationPluginOptions.name) {
      new DefinePlugin({
        "process.CURRENT_HOST": JSON.stringify(this.FederationPluginOptions.name)
      }).apply(compiler);
    }
  }

  processWebpackGraph(compilation, callback) {
    const liveStats = compilation.getStats();
    const stats = liveStats.toJson();
    // filter modules
    const modules = this.getFilteredModules(stats);
    // get RemoteEntryChunk
    const RemoteEntryChunk = this.getRemoteEntryChunk(
      stats,
      this.FederationPluginOptions
    );
    const validChunkArray = this.buildValidChunkArray(
      liveStats,
      this.FederationPluginOptions
    );
    const chunkDependencies = this.getChunkDependencies(validChunkArray);
    const vendorFederation = this.buildVendorFederationMap(liveStats);
    const rawData = {
      name: this.FederationPluginOptions.name,
      metadata: this._options.metadata || {},
      topLevelPackage: vendorFederation || {},
      publicPath: stats.publicPath,
      federationRemoteEntry: RemoteEntryChunk,
      buildHash: stats.hash,
      environment: this._options.environment, // 'development' if not specified
      version: this._options.publishVersion, // '1.0.0' if not specified
      posted: this._options.posted, // Date.now() if not specified
      group: this._options.group, // 'default' if not specified
      modules,
      chunkDependencies
    };

    let graphData = null;
    try {
      graphData = convertToGraph(rawData, !!this._options.standalone);
    } catch (err) {
      console.warn("Error during dashboard data processing");
      console.warn(err);
    }

    if (graphData) {
      const dashData = (this._dashData = JSON.stringify(graphData));

      this.writeStatsFiles(stats, dashData);

      if (this._options.dashboardURL) {
        return this.postDashboardData(dashData)
          .then(() => {})
          .catch(err => {
            if (err) {
              compilation.errors.push(err);
              // eslint-disable-next-line promise/no-callback-in-promise
              throw err;
            }
          });
      }
      return Promise.resolve();
    }
  }

  getFilteredModules(stats) {
    const filteredModules = stats.modules.filter(module => {
      const array = [
        module.name.includes("container entry"),
        module.name.includes("remote "),
        module.name.includes("shared module "),
        module.name.includes("provide module ")
      ];
      return array.some(item => item);
    });

    return filteredModules;
  }

  getRemoteEntryChunk(stats, FederationPluginOptions) {
    const remoteEntryChunk = stats.chunks.find(chunk => {
      const specificChunk = chunk.names.find(name => {
        return name === FederationPluginOptions.name;
      });
      return specificChunk;
    });

    return remoteEntryChunk;
  }

  getChunkDependencies(validChunkArray) {
    const chunkDependencies = validChunkArray.reduce((acc, chunk) => {
      const subset = chunk.getAllReferencedChunks();
      const stringifiableChunk = Array.from(subset).map(sub => {
        const cleanSet = Object.getOwnPropertyNames(sub).reduce((acc, key) => {
          if (key === "_groups") return acc;
          return Object.assign(acc, { [key]: sub[key] });
        }, {});

        return this.mapToObjectRec(cleanSet);
      });

      return Object.assign(acc, {
        [chunk.id]: stringifiableChunk
      });
    }, {});

    return chunkDependencies;
  }

  buildVendorFederationMap(liveStats) {
    const vendorFederation = {};
    let packageJson;
    this._webpackContext = liveStats.compilation.options.context;
    try {
      packageJson = require(path.join(
        liveStats.compilation.options.context,
        "package.json"
      ));
      this._packageJson = packageJson;
    } catch (e) {}

    if (packageJson) {
      vendorFederation.dependencies = AutomaticVendorFederation({
        exclude: [],
        ignoreVersion: false,
        packageJson,
        // subPackages: this.directReasons(modules),
        shareFrom: ["dependencies"],
        ignorePatchversion: false
      });
      vendorFederation.devDependencies = AutomaticVendorFederation({
        exclude: [],
        ignoreVersion: false,
        packageJson,
        // subPackages: this.directReasons(modules),
        shareFrom: ["devDependencies"],
        ignorePatchversion: false
      });
      vendorFederation.optionalDependencies = AutomaticVendorFederation({
        exclude: [],
        ignoreVersion: false,
        packageJson,
        // subPackages: this.directReasons(modules),
        shareFrom: ["optionalDependencies"],
        ignorePatchversion: false
      });
    }

    return vendorFederation;
  }

  mapToObjectRec(m) {
    let lo = {};
    for (let [key, value] of Object.entries(m)) {
      if (value instanceof Map && value.size > 0) {
        lo[key] = this.mapToObjectRec(value);
      } else if (value instanceof Set && value.size > 0) {
        lo[key] = this.mapToObjectRec(Array.from(value));
      } else {
        lo[key] = value;
      }
    }
    return lo;
  }

  buildValidChunkArray(liveStats, FederationPluginOptions) {
    const validChunkArray = [];
    const namedChunkRefs = liveStats.compilation.namedChunks.get(
      FederationPluginOptions.name
    );
    const AllReferencedChunksByRemote = namedChunkRefs
      ? namedChunkRefs.getAllReferencedChunks()
      : [];

    AllReferencedChunksByRemote.forEach(chunk => {
      if (chunk.id !== FederationPluginOptions.name) {
        validChunkArray.push(chunk);
      }
    });

    return validChunkArray;
  }

  directReasons(modules) {
    const directReasons = new Set();

    modules.forEach(module => {
      if (module.reasons) {
        module.reasons.forEach(reason => {
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

    return Array.from(directReasons);
  }

  writeStatsFiles(stats, dashData) {
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
  }

  postDashboardData(dashData) {
    return new Promise(resolve => {
      fetch(this._options.dashboardURL, {
        method: "POST",
        body: dashData,
        headers: {
          Accept: "application/json",
          "Content-type": "application/json"
        }
      })
        .then(resp => resp.json())
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

module.exports = FederationDashboardPlugin;
