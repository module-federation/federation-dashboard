const fs = require("fs");
const path = require("path");
const util = require("util");
const {parse, stringify} = require("flatted/cjs");

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
      (compilation, callback) => {
        const stats = compilation.getStats().toJson();
        const liveStats = compilation.getStats();
        console.log("liveStats", liveStats);

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
        const RemoteEntryChunk = stats.chunks.find((chunk) => {
          const specificChunk = chunk.names.find((name) => {
            return name === FederationPluginOptions.name;
          });
          return specificChunk;
        });
        console.log("remoteChunk", RemoteEntryChunk);
        console.log(
          "Federation getter async",
          liveStats.compilation.namedChunks.get(FederationPluginOptions.name)
        );
        console.log(
          "Federation getAllAsyncChunks",
          liveStats.compilation.namedChunks
            .get(FederationPluginOptions.name)
            .getAllAsyncChunks()
        );
        const AllReferencedChunksByRemote = liveStats.compilation.namedChunks
          .get(FederationPluginOptions.name)
          .getAllReferencedChunks();

        console.log(
          "Federation getAllReferencedChunks",
          liveStats.compilation.namedChunks
            .get(FederationPluginOptions.name)
            .getAllAsyncChunks()
        );
        const validChunkArray = [];
        AllReferencedChunksByRemote.forEach((chunk) => {
          if (chunk.id !== FederationPluginOptions.name) {
            validChunkArray.push(chunk);
          }
        });

        function isIterable(obj) {
          // checks for null and undefined
          if (obj == null) {
            return false;
          }
          return typeof obj[Symbol.iterator] === 'function';
        }

        function mapToObjectRec(m) {
          let lo = {}
            for (let [k, v] of Object.entries(m)) {
              if (v instanceof Map) {
                lo[k] = mapToObjectRec(v)
              } else if (v instanceof Set) {
                lo[k] = mapToObjectRec(Array.from(v))
              } else {
                lo[k] = v
              }
            }
          return lo
        }

        console.log("valid chunks", validChunkArray);
        const chunkDependencies = validChunkArray.reduce((acc, chunk) => {
          const subset = chunk.getAllReferencedChunks()
         const stringifiableChunk =  Array.from(subset).map((sub) => {
          const  cleanSet =  Object.getOwnPropertyNames(sub).reduce((acc, key) => {
            if(key === '_groups') return acc
             return Object.assign(acc, {[key]: sub[key]})
            }, {})
            return mapToObjectRec(cleanSet)
          })
          return Object.assign(acc, {
            [chunk.id]: stringifiableChunk,
          });
        }, {});

        console.log("chunkDependencies", chunkDependencies);
        const dashData = (this._dashData = JSON.stringify({
          publicPath: compilation.outputOptions.publicPath,
          federationRemoteEntry: RemoteEntryChunk,
          buildHash: stats.hash,
          modules,
          chunkDependencies
        }))

        Promise.all([
          new Promise((resolve) => {
            fs.writeFile(
              hashPath,
              dashData,
              {encoding: "utf-8"},
              resolve
            );
          }),
          new Promise((resolve) => {
            fs.writeFile(
              statsPath,
              JSON.stringify(stats),
              {encoding: "utf-8"},
              resolve
            );
          }),
        ]).then(() => callback());
      }
    );

    compiler.hooks.afterDone.tap(PLUGIN_NAME, (stats) => {
      console.log("statsJSON", stats.toJson());
      if (this._options.reportFunction) {
        this._options.reportFunction(this._dashData);
      }
    });
  }
}

module.exports = FederationDashboardPlugin;
