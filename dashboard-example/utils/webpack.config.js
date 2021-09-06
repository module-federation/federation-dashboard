const HtmlWebpackPlugin = require("html-webpack-plugin");
const DashboardPlugin = require("../../dashboard-plugin/FederationDashboardPlugin");
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
      dashboardURL:
        "https://federation-dashboard-alpha.vercel.app/api/update?token=29f387e1-a00d-46ea-9fd6-02ca5e97449c",
      filename: "dashboard.json",
      metadata: {
        baseUrl: "http://localhost:3005",
        source: {
          url: "https://github.com/module-federation/federation-dashboard/tree/master/dashboard-example/utils",
        },
        remote: "http://localhost:3005/remoteEntry.js",
      },
    }),
  ],
};
