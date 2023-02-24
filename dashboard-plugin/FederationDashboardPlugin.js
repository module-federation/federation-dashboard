const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const AutomaticVendorFederation = require("@module-federation/automatic-vendor-federation");
const convertToGraph = require("./convertToGraph");
const mergeGraphs = require("./mergeGraphs");
const DefinePlugin = require("webpack/lib/DefinePlugin");
const parser = require("@babel/parser");
const generate = require("@babel/generator").default;
const traverse = require("@babel/traverse").default;
const { isNode } = require("@babel/types");
const webpack = require("webpack");
const PLUGIN_NAME = "FederationDashboardPlugin";

let gitSha;
try {
  gitSha = require("child_process")
    .execSync("git rev-parse HEAD")
    .toString()
    .trim();
} catch (e) {
  console.error(e);
}

const findPackageJson = (filePath) => {
  if (filePath.length === 0) {
    return false;
  }
  if (fs.existsSync(path.join(filePath.join(path.sep), "package.json"))) {
    return require(path.join(filePath.join(path.sep), "package.json"));
  }
  filePath.pop();
  findPackageJson(filePath);
};

const computeVersionStrategy = (stats, arg) => {
  if (arg === "buildHash") {
    return stats.hash;
  } else if (arg === "gitSha") {
    return gitSha;
  } else if (arg) {
    return arg.toString();
  } else {
    return gitSha;
  }
};

class AddRuntimeRequiremetToPromiseExternal {
  apply(compiler) {
    compiler.hooks.compilation.tap(
      "AddRuntimeRequiremetToPromiseExternal",
      (compilation) => {
        const { RuntimeGlobals } = compiler.webpack;
        if (compilation.outputOptions.trustedTypes) {
          compilation.hooks.additionalModuleRuntimeRequirements.tap(
            "AddRuntimeRequiremetToPromiseExternal",
            (module, set, context) => {
              if (module.externalType === "promise") {
                set.add(RuntimeGlobals.loadScript);
              }
            }
          );
        }
      }
    );
  }
}

/** @typedef {import("webpack/lib/Compilation")} Compilation */
/** @typedef {import("webpack/lib/Compiler")} Compiler */

/**
 * @typedef FederationDashboardPluginOptions
 * @property {string} filename
 * @property {function} reportFunction
 */
class FederationDashboardPlugin {
  /**
   *
   * @param {FederationDashboardPluginOptions} options
   */
  constructor(options) {
    this._options = Object.assign(
      { debug: false, filename: "dashboard.json", useAST: false, fetchClient: false },
      options
    );
    this._dashData = null;
    this.allArgumentsUsed = [];
  }

  /**
   * @param {Compiler} compiler
   */
  apply(compiler) {
    compiler.options.output.uniqueName = `v${Date.now()}`;

    new AddRuntimeRequiremetToPromiseExternal().apply(compiler);
    const FederationPlugin = compiler.options.plugins.find((plugin) => {
      return plugin.constructor.name === "ModuleFederationPlugin" || plugin.constructor.name === "NextFederationPlugin";
    });
    if (FederationPlugin) {
      this.FederationPluginOptions = Object.assign(
        {},
        FederationPlugin._options,
        this._options.standalone || {}
      );
    } else if (this._options.standalone) {
      this.FederationPluginOptions = this._options.standalone;
    } else {
      throw new Error(
        "Dashboard plugin is missing Module Federation or standalone option"
      );
    }

    this.FederationPluginOptions.name =
      this.FederationPluginOptions.name.replace("__REMOTE_VERSION__", "");
    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: PLUGIN_NAME,
          stage: compilation.constructor.PROCESS_ASSETS_STAGE_REPORT,
        },
        (assets) => {
          return this.processWebpackGraph(compilation, assets);
        }
      );
    });

    if (this.FederationPluginOptions.name) {
      new DefinePlugin({
        'process.dashboardURL': JSON.stringify(this._options.dashboardURL),
        "process.CURRENT_HOST": JSON.stringify(
          this.FederationPluginOptions.name
        ),
      }).apply(compiler);
    }
  }


  processWebpackGraph(curCompiler, assets) {
    const liveStats = curCompiler.getStats();
    const stats = liveStats.toJson();

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
      remotes: this.FederationPluginOptions.remotes,
      metadata: this._options.metadata || {},
      topLevelPackage: vendorFederation || {},
      publicPath: stats.publicPath,
      federationRemoteEntry: RemoteEntryChunk,
      buildHash: stats.hash,
      environment: this._options.environment, // 'development' if not specified
      version: computeVersionStrategy(stats, this._options.versionStrategy),
      posted: this._options.posted, // Date.now() if not specified
      group: this._options.group, // 'default' if not specified
      sha: gitSha,
      modules: stats.modules,
      chunkDependencies,
      functionRemotes: this.allArgumentsUsed,
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

      if (this._options.dashboardURL && !this._options.nextjs) {
        this.postDashboardData(dashData).catch((err) => {
          if (err) {
            curCompiler.errors.push(err);
            // eslint-disable-next-line promise/no-callback-in-promise
            throw err;
          }
        });
      }

      return Promise.resolve().then(() => {
        const statsBuf = Buffer.from(dashData || "{}", "utf-8");

        const source = {
          source() {
            return statsBuf;
          },
          size() {
            return statsBuf.length;
          },
        };
        // for dashboard.json
        if (curCompiler.emitAsset && this._options.filename) {
          const asset = curCompiler.getAsset(this._options.filename);
          if (asset) {
            curCompiler.updateAsset(this._options.filename, source);
          } else {
            curCompiler.emitAsset(this._options.filename, source);
          }
        }

        // for versioned remote
        if (
          curCompiler.emitAsset &&
          this.FederationPluginOptions.filename &&
          Object.keys(this.FederationPluginOptions.exposes || {}).length !== 0
        ) {
          const remoteEntry = curCompiler.getAsset(
            this.FederationPluginOptions.filename
          );
          if(!remoteEntry) {
            return Promise.resolve();
          }
          const cleanVersion = typeof rawData.version === "string" ? `_${rawData.version.split(".").join("_")}` : `_${rawData.version.toString()}`;
          let codeSource;
          if (!remoteEntry.source._value && remoteEntry.source.source) {
            codeSource = remoteEntry.source.source();
          } else if (remoteEntry.source._value) {
            codeSource = remoteEntry.source._value;
          }
          //string replace "dsl" with version_dsl to make another global.
          const newSource = codeSource.replace(
            new RegExp(`__REMOTE_VERSION__`, "g"),
            cleanVersion
          );

          const rewriteTempalteFromMain = codeSource.replace(
            new RegExp(`__REMOTE_VERSION__`, "g"),
            ""
          );

          const remoteEntryBuffer = Buffer.from(newSource, "utf-8");
          const originalRemoteEntryBuffer = Buffer.from(
            rewriteTempalteFromMain,
            "utf-8"
          );

          const remoteEntrySource = new webpack.sources.RawSource(
            remoteEntryBuffer
          );

          const originalRemoteEntrySource = new webpack.sources.RawSource(
            originalRemoteEntryBuffer
          );

          if (remoteEntry && graphData.version) {
            const basename = path.basename(this.FederationPluginOptions.filename)
            const bustedName = this.FederationPluginOptions.filename.replace(basename, [graphData.version, basename].join("."));
            curCompiler.updateAsset(
              this.FederationPluginOptions.filename,
              originalRemoteEntrySource
            );

            curCompiler.emitAsset(
              bustedName,
              remoteEntrySource
            );
          }
        }
      });
    }
  }

  getRemoteEntryChunk(stats, FederationPluginOptions) {

    return stats.chunks.find((chunk) => chunk.names.find((name) => name === FederationPluginOptions.name));
  }

  getChunkDependencies(validChunkArray) {

    return validChunkArray.reduce((acc, chunk) => {
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
  }

  buildVendorFederationMap(liveStats) {
    const vendorFederation = {};
    let packageJson;
    if (this._options.packageJsonPath) {
      packageJson = require(this._options.packageJsonPath);
    } else {
      const initialPath = liveStats.compilation.options.context.split(path.sep);
      packageJson = findPackageJson(initialPath);
    }

    if (packageJson) {
      vendorFederation.dependencies = AutomaticVendorFederation({
        exclude: [],
        ignoreVersion: false,
        packageJson,
        // subPackages: this.directReasons(modules),
        shareFrom: ["dependencies"],
        ignorePatchversion: false,
      });
      vendorFederation.devDependencies = AutomaticVendorFederation({
        exclude: [],
        ignoreVersion: false,
        packageJson,
        // subPackages: this.directReasons(modules),
        shareFrom: ["devDependencies"],
        ignorePatchversion: false,
      });
      vendorFederation.optionalDependencies = AutomaticVendorFederation({
        exclude: [],
        ignoreVersion: false,
        packageJson,
        // subPackages: this.directReasons(modules),
        shareFrom: ["optionalDependencies"],
        ignorePatchversion: false,
      });
    }

    return vendorFederation;
  }

  mapToObjectRec(m) {
    const lo = {};
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

  // This is no longer needed - can be deleted or used for refactoring the asset emitter
  writeStatsFiles(stats, dashData, assets) {
    if (this._options.filename) {
      const hashPath = path.join(stats.outputPath, this._options.filename);
      if (!fs.existsSync(stats.outputPath)) {
        fs.mkdirSync(stats.outputPath, { recursive: true })
      }
      fs.writeFileSync(hashPath, dashData, { encoding: "utf-8" });
    }
    // if (this._options.debug) {
    console.log(
      path.join(stats.outputPath, this.FederationPluginOptions.filename)
    );
    // }
    let file

    try {
      file = assets[this.FederationPluginOptions.filename]._value

      const { version } = JSON.parse(dashData);
      if (!version) {
        throw new Error("no version provided, cannot version remote");
      }
      if (this._options.debug) {
        console.log(
          path.join(
            stats.outputPath,
            version,
            this.FederationPluginOptions.filename
          )
        );
      }
      fs.mkdir(
        path.join(stats.outputPath, version),
        { recursive: true },
        (err) => {
          if (err) throw err;
          fs.writeFile(
            path.join(
              stats.outputPath,
              version,
              this.FederationPluginOptions.filename
            ),
            file,
            (err) => {
              if (this._options.debug) {
                console.trace(err);
                console.log(
                  "wrote versioned remote",
                  path.join(
                    stats.outputPath,
                    version,
                    this.FederationPluginOptions.filename
                  )
                );
              }
            }
          );
        }
      );
    } catch(e) {
      console.log(e)
    }

    const statsPath = path.join(stats.outputPath, "stats.json");
    fs.writeFile(
      statsPath,
      JSON.stringify(stats),
      { encoding: "utf-8" },
      () => {}
    );
  }

  async postDashboardData(dashData) {
    console.log('should post to dashboard')
    if (!this._options.dashboardURL) {
      return Promise.resolve();
    }
    const client = this._options.fetchClient ? this._options.fetchClient : fetch;
    try {
      const res = await client(this._options.dashboardURL, {
        method: "POST",
        body: dashData,
        headers: {
          Accept: "application/json",
          "Content-type": "application/json",
        },
      });

      if (!res.ok) throw new Error(res.statusText);
    } catch (err) {
      console.warn(
        `Error posting data to dashboard URL: ${this._options.dashboardURL}`
      );
      console.error(err);
    }
  }
}

class NextMedusaPlugin {
  constructor(options) {
    this._options = options;
  }

  apply(compiler) {
    if(compiler.name === 'ChildFederationPlugin') return


    const MedusaPlugin = new FederationDashboardPlugin({
      ...this._options,
    });
    MedusaPlugin.apply(compiler);
    console.log('compiler name', compiler.name)

return
    compiler.hooks.done.tap(PLUGIN_NAME, () => {
      const sidecarData = path.join(
        compiler.options.output.path,
        `child-dashboard.json`
      );
      const hostData = path.join(
        compiler.options.output.path,
        'dashboard.json'
      );
      console.log('sidecar data',sidecarData);
      console.log('host data', hostData);
      if (fs.existsSync(sidecarData) && fs.existsSync(hostData)) {
        console.log('will write merged files');
        fs.writeFileSync(
          hostData,
          JSON.stringify(mergeGraphs(require(sidecarData), require(hostData)))
        );
      }
    });

    compiler.hooks.afterDone.tap("NextMedusaPlugin", (stats, done) => {
      if (fs.existsSync(sidecarData) && fs.existsSync(hostData)) {
        const dashboardData = fs.readFileSync(hostData, "utf8");
        MedusaPlugin.postDashboardData(dashboardData).then(done).catch(done);
      } else {
        done();
      }
    });
  }
}

module.exports = FederationDashboardPlugin;
module.exports.clientVersion = require("./client-version");
module.exports.NextMedusaPlugin = NextMedusaPlugin;
