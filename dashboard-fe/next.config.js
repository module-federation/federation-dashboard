const webpack = require("webpack");
const path = require("path");
let merge = require("webpack-merge");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = {
  webpack5: true,
  images: {
    disableStaticImages: true,
  },
  experimental: {
    pageDataCollectionTimeout: 6000,
    staticPageGenerationTimeout: 6000,
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders }) => {
    if (isServer) {
      config.plugins.push(
        // new BundleAnalyzerPlugin(),
        new webpack.container.ModuleFederationPlugin({
          name: "dashboard",
          library: { type: config.output.libraryTarget, name: "dashboard" },
          filename: "static/runtime/remoteEntry.js",
          exposes: {
            "./utils": "./lighthouse/utils",
          },
        })
      );
    } else {
      return merge.merge(config, {
        entry() {
          return config.entry().then((entry) => {
            const newEntry = Object.assign({}, entry, {
              dashboard_worker: ["./workers/init.js"],
            });
            return newEntry;
          });
        },
        plugins: [
          new webpack.container.ModuleFederationPlugin({
            name: "dashboard",
            filename: "static/runtime/remoteEntry.js",
            exposes: {
              "./utils": "./lighthouse/utils",
            },
            remotes: {
              dashboard:
                "dashboard@http://localhost:3000/_next/static/runtime/remoteEntry.js",
            },
          }),
        ],
      });
    }
    return config;
  },
};
