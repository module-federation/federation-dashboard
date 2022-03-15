const HtmlWebpackPlugin = require("html-webpack-plugin");
const DashboardPlugin = require("@module-federation/dashboard-plugin");
const { ModuleFederationPlugin } = require("webpack").container;
const path = require("path");

module.exports = {
  entry: "./src/index",
  mode: "development",
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    port: 3005,
  },
  cache: false,
  output: {
    filename: "[name].[contenthash].js",
    chunkFilename: "[name].[contenthash].js",
    publicPath: `auto`,
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.jsx?$/,
        loader: "esbuild-loader",
        exclude: /node_modules/,
        options: {
          loader: "jsx",
          target: "es2015",
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
    new ModuleFederationPlugin({
      name: "utils__REMOTE_VERSION__",
      library: { type: "var", name: "utils__REMOTE_VERSION__" },
      filename: "remoteEntry.js",
      remotes: {},
      exposes: {
        "./analytics": "./src/analytics",
      },
      shared: require("./package.json").dependencies,
    }),
    new DashboardPlugin({
      publishVersion: require("./package.json").version,
      dashboardURL: process.env.VERCEL_URL
        ? "https://federation-dashboard-alpha.vercel.app/api/update?token=c075d425-4328-40b8-b6d0-3f71219dccdd"
        : "http://localhost:3000/api/update?token=c075d425-4328-40b8-b6d0-3f71219dccdd",
      filename: "dashboard.json",
      metadata: {
        baseUrl: process.env.VERCEL_URL
          ? "https://" + process.env.VERCEL_URL
          : "http://localhost:3005",
        source: {
          url: "https://github.com/module-federation/federation-dashboard/tree/master/dashboard-example/utils",
        },
        remote: process.env.VERCEL_URL
          ? "https://" + process.env.VERCEL_URL + "/remoteEntry.js"
          : "http://localhost:3005/remoteEntry.js",
      },
    }),
  ],
};
