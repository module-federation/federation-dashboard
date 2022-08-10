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
        const RuntimeGlobals = compiler.webpack.RuntimeGlobals;
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
  constructor(options, other) {
    this._options = Object.assign(
      { debug: false, filename: "dashboard.json", useAST: false },
      options
    );
    this._dashData = null;
    this.allArgumentsUsed = [];
  }

  /**
   * @param {Compiler} compiler
   */
  apply(compiler) {
    compiler.options.output.uniqueName = "v" + Date.now();
    new AddRuntimeRequiremetToPromiseExternal().apply(compiler);

    const FederationPlugin = compiler.options.plugins.find((plugin) => {
      return plugin.constructor.name === "ModuleFederationPlugin";
    });

    if (FederationPlugin) {
      this.FederationPluginOptions = Object.assign(
        {},
        FederationPlugin._options,
        this._options.standalone || {}
      );

      // if (FederationPlugin._options.name) {
      //   FederationPlugin._options.name =
      //     FederationPlugin._options.name + "__REMOTE_VERSION__";
      // }
      // if (
      //   FederationPlugin._options.library &&
      //   FederationPlugin._options.library.name &&
      //   !FederationPlugin._options.library.name.includes("__REMOTE_VERSION__")
      // ) {
      //   FederationPlugin._options.library.name =
      //     FederationPlugin._options.library.name + "__REMOTE_VERSION__";
      // }

      const versionedMFContainerConfig = {
        ...FederationPlugin._options,
        name: FederationPlugin._options.name + "__REMOTE_VERSION__",
      };

      if (versionedMFContainerConfig.library) {
        versionedMFContainerConfig.library = {
          ...FederationPlugin._options.library,
          name: FederationPlugin._options.name + "__REMOTE_VERSION__",
        };
      }

      if (versionedMFContainerConfig.filename) {
        const remoteFileName = path.basename(
          versionedMFContainerConfig.filename
        );
        const filenameWithVersionPlaceholder =
          versionedMFContainerConfig.filename.replace(
            remoteFileName,
            "__REMOTE_VERSION__" + remoteFileName
          );
        versionedMFContainerConfig.filename = filenameWithVersionPlaceholder;
      }
      this.versionedMFContainerConfig = versionedMFContainerConfig;

      new compiler.webpack.container.ModuleFederationPlugin(
        versionedMFContainerConfig
      ).apply(compiler);
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
        () => this.processWebpackGraph(compilation)
      );
    });

    if (this.FederationPluginOptions.name) {
      new DefinePlugin({
        "process.CURRENT_HOST": JSON.stringify(
          this.FederationPluginOptions.name
        ),
      }).apply(compiler);
    }
  }

  parseModuleAst(compilation, callback) {
    const filePaths = [];
    const allArgumentsUsed = [];
    // Explore each chunk (build output):
    compilation.chunks.forEach((chunk) => {
      // Explore each module within the chunk (built inputs):
      chunk.getModules().forEach((module) => {
        // Loop through all the dependencies that has the named export that we are looking for
        const matchedNamedExports = module.dependencies.filter((dep) => {
          return dep.name === "federateComponent";
        });

        if (matchedNamedExports.length > 0) {
          // we know that this module exported the function we care about
          // now we need to know how many times this function is invoked in the source code
          // along with all the arguments of it

          // these modules could be a combination of multiple source files, so we need to traverse
          // through its fileDependencies
          if (module.resource) {
            filePaths.push({
              resource: module.resource,
              file: module.resourceResolveData.relativePath,
            });
          }
        }
      });

      filePaths.forEach(({ resource, file }) => {
        const sourceCode = fs.readFileSync(resource).toString("utf-8");
        const ast = parser.parse(sourceCode, {
          sourceType: "unambiguous",
          plugins: ["jsx", "typescript"],
        });

        // traverse the abstract syntax tree
        traverse(ast, {
          /**
           * We want to run a function depending on a found nodeType
           * More node types are documented here: https://babeljs.io/docs/en/babel-types#api
           */
          CallExpression: (path) => {
            const node = path.node;
            const { callee, arguments: args } = node;

            if (callee.loc.identifierName === "federateComponent") {
              const argsAreStrings = args.every((arg) => {
                return arg.type === "StringLiteral";
              });
              if (!argsAreStrings) {
                return;
              }
              const argsValue = [file];

              // we collect the JS representation of each argument used in this function call
              for (let i = 0; i < args.length; i += 1) {
                const a = args[i];
                let { code } = generate(a);

                if (code.startsWith("{")) {
                  // wrap it in parentheses, so when it's eval-ed, it is eval-ed correctly into an JS object
                  code = `(${code})`;
                }

                const value = eval(code);

                // If the value is a Node, that means it was a variable name
                // There is no easy way to resolve the variable real value, so we just skip any function calls
                // that has variable as its args
                if (!isNode(value)) {
                  argsValue.push(value);
                } else {
                  // by breaking out of the loop here,
                  // we also prevent this args to be pushed to `allArgumentsUsed`
                  break;
                }

                if (i === args.length - 1) {
                  // push to the top level array
                  allArgumentsUsed.push(argsValue);
                }
              }
            }
          },
        });
      });
    });
    const uniqueArgs = allArgumentsUsed.reduce((acc, current) => {
      const id = current.join("|");
      acc[id] = current;
      return acc;
    }, {});
    this.allArgumentsUsed = Object.values(uniqueArgs);
    if (callback) callback();
  }

  processWebpackGraph(curCompiler, callback) {
    const liveStats = curCompiler.getStats();
    const stats = liveStats.toJson();
    if (this._options.useAST) {
      this.parseModuleAst(curCompiler);
    }

    // fs.writeFile('stats.json', JSON.stringify(stats.modules))

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
      // this.writeStatsFiles(stats, dashData);
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
            this.versionedMFContainerConfig.filename
          );

          let cleanVersion = "_" + rawData.version.toString();

          if (typeof rawData.version === "string") {
            cleanVersion = "_" + rawData.version.split(".").join("_");
          }
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

          // const rewriteTempalteFromMain = codeSource.replace(
          //   new RegExp(`__REMOTE_VERSION__`, "g"),
          //   ""
          // );

          const remoteEntryBuffer = Buffer.from(newSource, "utf-8");
          // const originalRemoteEntryBuffer = Buffer.from(
          //   rewriteTempalteFromMain,
          //   "utf-8"
          // );

          const remoteEntrySource = new webpack.sources.RawSource(
            remoteEntryBuffer
          );

          // const originalRemoteEntrySource = new webpack.sources.RawSource(
          //   originalRemoteEntryBuffer
          // );

          if (remoteEntry && graphData.version) {
            // curCompiler.updateAsset(
            //   this.FederationPluginOptions.filename,
            //   originalRemoteEntrySource
            // );
            // remove the placeholder container
            curCompiler.deleteAsset(this.versionedMFContainerConfig.filename);
            curCompiler.emitAsset(
              [graphData.version, this.FederationPluginOptions.filename].join(
                "."
              ),
              remoteEntrySource
            );
          }
        }
        if (callback) {
          return void callback();
        }
      });
    }
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

  // This is no longer needed - can be deleted or used for refactoring the asset emitter
  writeStatsFiles(stats, dashData) {
    if (this._options.filename) {
      const hashPath = path.join(stats.outputPath, this._options.filename);
      if (!fs.existsSync(stats.outputPath)) {
        fs.mkdirSync(stats.outputPath);
      }
      fs.writeFile(hashPath, dashData, { encoding: "utf-8" }, () => {});
    }
    if (this._options.debug) {
      console.log(
        path.join(stats.outputPath, this.FederationPluginOptions.filename)
      );
    }
    const file = fs.readFileSync(
      path.join(stats.outputPath, this.FederationPluginOptions.filename)
    );
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

    const statsPath = path.join(stats.outputPath, "stats.json");
    fs.writeFile(
      statsPath,
      JSON.stringify(stats),
      { encoding: "utf-8" },
      () => {}
    );
  }

  async postDashboardData(dashData) {
    if (!this._options.dashboardURL) {
      return Promise.resolve();
    }
    try {
      const res = await fetch(this._options.dashboardURL, {
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
    const sidecarData = this._options.filename.includes("sidecar")
      ? path.join(compiler.options.output.path, this._options.filename)
      : path.join(
          compiler.options.output.path,
          "sidecar-" + this._options.filename
        );
    const hostData = path.join(
      compiler.options.output.path,
      this._options.filename.replace("sidecar-", "")
    );

    const MedusaPlugin = new FederationDashboardPlugin({
      ...this._options,
      nextjs: true,
    });
    MedusaPlugin.apply(compiler);

    compiler.hooks.afterEmit.tap(PLUGIN_NAME, () => {
      const sidecarData = path.join(
        compiler.options.output.path,
        "sidecar-" + this._options.filename
      );
      const hostData = path.join(
        compiler.options.output.path,
        this._options.filename.replace("sidecar-", "")
      );
      if (fs.existsSync(sidecarData) && fs.existsSync(hostData)) {
        fs.writeFileSync(
          hostData,
          JSON.stringify(mergeGraphs(require(sidecarData), require(hostData)))
        );
      }
    });

    compiler.hooks.done.tapAsync("NextMedusaPlugin", (stats, done) => {
      if (fs.existsSync(sidecarData) && fs.existsSync(hostData)) {
        const dashboardData = fs.readFileSync(hostData, "utf8");
        MedusaPlugin.postDashboardData(dashboardData).then(done).catch(done);
      } else {
        done();
      }
    });
  }
}

const withMedusa =
  ({ name, ...medusaConfig }) =>
  (nextConfig = {}) => {
    return Object.assign({}, nextConfig, {
      webpack(config, options) {
        if (
          options.nextRuntime !== "edge" &&
          !options.isServer &&
          process.env.NODE_ENV === "production"
        ) {
          if (!name) {
            throw new Error(
              "Medusa needs a name for the app, please ensure plugin options has {name: <appname>}"
            );
          }
          config.plugins.push(
            new NextMedusaPlugin({
              standalone: { name },
              ...medusaConfig,
            })
          );
        }

        if (typeof nextConfig.webpack === "function") {
          return nextConfig.webpack(config, options);
        }

        return config;
      },
    });
  };

module.exports = FederationDashboardPlugin;
module.exports.clientVersion = require("./client-version");
module.exports.NextMedusaPlugin = NextMedusaPlugin;
module.exports.withMedusa = withMedusa;
