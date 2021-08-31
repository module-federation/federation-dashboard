const webpack = require("webpack");
let merge = require("webpack-merge");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = {
  images: {
    disableStaticImages: true,
  },
  experimental: {
    pageDataCollectionTimeout: 6000,
    staticPageGenerationTimeout: 6000,
  },
  env: {
    VERCEL: process.env.VERCEL,
    VERCEL_URL: process.env.VERCEL_URL,
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders }) => {
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
