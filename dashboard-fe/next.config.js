const webpack = require("webpack");
const path = require("path");
module.exports = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders }) => {
    if (isServer) {
      console.log(config.output.libraryTarget);
      if (isServer) {
        config.plugins.push(
          new webpack.container.ModuleFederationPlugin({
            name: "dashboard",
            library: { type: config.output.libraryTarget, name: "dashboard" },
            filename: "static/runtime/remoteEntry.js",
            exposes: {
              "./utils": "./lighthouse/utils",
            },
          })
        );
      }
    } else {
      config.externals["dashboard"] = "path";
    }
    return config;
  },
};
