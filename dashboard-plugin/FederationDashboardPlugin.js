const fs = require("fs");
const path = require("path");

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
        const dashData = (this._dashData = {
          publicPath: compilation.outputOptions.publicPath,
          federationRemoteEntry: RemoteEntryChunk,
          buildHash: stats.hash,
          modules,
        });
        Promise.all([
          new Promise((resolve) => {
            fs.writeFile(
              hashPath,
              JSON.stringify(dashData, null, 2),
              { encoding: "utf-8" },
              resolve
            );
          }),
          new Promise((resolve) => {
            fs.writeFile(
              statsPath,
              JSON.stringify(stats, null, 2),
              { encoding: "utf-8" },
              resolve
            );
          }),
        ]).then(() => callback());
      }
    );

    compiler.hooks.afterDone.tap(PLUGIN_NAME, (stats) => {
      if (this._options.reportFunction) {
        this._options.reportFunction(this._dashData);
      }
    });
  }
}

module.exports = FederationDashboardPlugin;
