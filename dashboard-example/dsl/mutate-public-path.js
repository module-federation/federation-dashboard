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
          console.log(generatedCode);
          module._cachedGeneratedCode = generatedCode.replace(
            '__REMOTE_VERSION__"',
            `" + window.versions[window.versions.currentHost].${FederationPluginOptions.name} +"/"`
          );
          console.log(module._cachedGeneratedCode);
        }
      });
    });
    compiler.hooks.done.tap("MutateRuntime", () => {
      // debugger;
    });
  }
}

module.exports = FederationDashboardPlugin;
