const webpack = require("webpack");
const path = require("path");
let merge = require("webpack-merge");

module.exports = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders }) => {
    if (isServer) {
      config.plugins.push(
        // new BundleAnalyzerPlugin(),
        new webpack.container.ModuleFederationPlugin({
          name: "dashboard",
          library: { type: config.output.libraryTarget, name: "dashboard" },
          filename: "static/runtime/remoteEntry.js",
          exposes: {
            "./utils": "./lighthouse/utils"
          }
        })
      );
    } else {
      return merge.merge(config, {
        entry() {
          return config.entry().then(entry => {
            const newEntry = Object.assign({}, entry, {
              dashboard: "./workers/init.js"
            });
            return newEntry;
          });
        },
        plugins: [
          new webpack.container.ModuleFederationPlugin({
            name: "dashboard",
            filename: "static/runtime/remoteEntry.js",
            exposes: {
              "./utils": "./lighthouse/utils"
            },
            remotes: {
              dashboard:
                "dashboard@http://localhost:3000/_next/static/runtime/remoteEntry.js"
            }
          })
        ]
      });
    }
    return config;
  }
};
