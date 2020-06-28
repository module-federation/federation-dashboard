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

      // filter modules
      const modules = this.getFilteredModules(stats);
      // get RemoteEntryChunk
      const RemoteEntryChunk = this.getRemoteEntryChunk(
        stats,
        FederationPluginOptions
      );
      const validChunkArray = this.buildValidChunkArray(
        liveStats,
        FederationPluginOptions
      );
      const chunkDependencies = this.getChunkDependencies(validChunkArray);
      const vendorFederation = this.buildVendorFederationMap(liveStats);

      const rawData = {
        versionData: {
          container: RemoteEntryChunk.files[0],
          outputPath: stats.outputPath,
          dashboardFileName: this._options.filename,
        },
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

        this.writeStatsFiles(stats, dashData);

        if (this._options.dashboardURL) {
          this.postDashboardData(dashData);
        }
      }
    });
  }

  getFilteredModules(stats) {
    const filteredModules = stats.modules.filter((module) => {
      const array = [
        module.name.includes("container entry"),
        module.name.includes("remote "),
        module.name.includes("shared module "),
        module.name.includes("provide module "),
      ];
      return array.some((item) => item);
    });

    return filteredModules;
  }

  getRemoteEntryChunk(stats, FederationPluginOptions) {
    const remoteEntryChunk = stats.chunks.find((chunk) => {
      const specificChunk = chunk.names.find((name) => {
        return name === FederationPluginOptions.name;
      });
      return specificChunk;
    });

    return remoteEntryChunk;
  }

  getChunkDependencies(validChunkArray) {
    const chunkDependencies = validChunkArray.reduce((acc, chunk) => {
      const subset = chunk.getAllReferencedChunks();
      const stringifiableChunk = Array.from(subset).map((sub) => {
        const cleanSet = Object.getOwnPropertyNames(sub).reduce((acc, key) => {
          if (key === "_groups") return acc;
          return Object.assign(acc, { [key]: sub[key] });
        }, {});

        return this.mapToObjectRec(cleanSet);
      });

      return Object.assign(acc, {
        [chunk.id]: stringifiableChunk,
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
        ignorePatchVersion: true,
      });
      vendorFederation.devDependencies = AutomaticVendorFederation({
        exclude: [],
        ignoreVersion: false,
        packageJson,
        // subPackages: this.directReasons(modules),
        shareFrom: ["devDependencies"],
        ignorePatchVersion: true,
      });
      vendorFederation.optionalDependencies = AutomaticVendorFederation({
        exclude: [],
        ignoreVersion: false,
        packageJson,
        // subPackages: this.directReasons(modules),
        shareFrom: ["optionalDependencies"],
        ignorePatchVersion: true,
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

    AllReferencedChunksByRemote.forEach((chunk) => {
      if (chunk.id !== FederationPluginOptions.name) {
        validChunkArray.push(chunk);
      }
    });

    return validChunkArray;
  }

  directReasons(modules) {
    const directReasons = new Set();

    modules.forEach((module) => {
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

    return Array.from(directReasons);
  }

  writeStatsFiles(stats, dashData) {
    if (this._packageJson) {
      const updatedPackage = Object.assign({}, this._packageJson, {
        versionData: JSON.parse(this._dashData).versionData,
      });
      fs.writeFile(
        path.join(this._webpackContext, "package.json"),
        JSON.stringify(updatedPackage, null, 2),
        { encoding: "utf-8" },
        () => {}
      );
    }
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
    return new Promise((resolve) => {
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

module.exports = FederationDashboardPlugin;
