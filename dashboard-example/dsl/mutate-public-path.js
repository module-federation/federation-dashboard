const PLUGIN_NAME = "FederationDashboardPlugin";

class FederationDashboardPlugin {
  /**
   *
   * @param {FederationDashboardPluginOptions} options
   */
  constructor(options) {}

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

    compiler.hooks.make.tap("MutateRuntime", (compilation) => {
      compilation.hooks.runtimeModule.tap("MutateRuntime", (module, chunk) => {
        if (
          module.constructor.name === "PublicPathRuntimeModule" &&
          chunk.name === FederationPluginOptions.name
        ) {
          const generatedCode = module.getGeneratedCode();
          const splitGeneration = generatedCode.split("=");
          module._cachedGeneratedCode = generatedCode.replace(
            splitGeneration[1],
            splitGeneration[1].split(";")[0] +
              `+ (window.remote_${FederationPluginOptions.name} ? window.remote_${FederationPluginOptions.name}+"/" : '');`
          );
          console.log(module._cachedGeneratedCode);
          return module;
        }
      });
    });
    compiler.hooks.done.tap("MutateRuntime", () => {
      // debugger;
    });
  }
}

module.exports = FederationDashboardPlugin;
