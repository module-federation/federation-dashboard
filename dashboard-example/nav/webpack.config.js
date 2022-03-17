require("dotenv").config({ path: "../.env" });
const HtmlWebpackPlugin = require("html-webpack-plugin");
const DashboardPlugin = require("@module-federation/dashboard-plugin");
const clientVersion = require("../../dashboard-plugin/client-version");
const { ModuleFederationPlugin } = require("webpack").container;
const path = require("path");
module.exports = {
  entry: "./src/index",
  mode: "development",
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    port: 3003,
  },
  output: {
    filename: "[name].[contenthash].js",
    chunkFilename: "[name].[contenthash].js",
    publicPath: `auto`,
    uniqueName: `nav.${require("./package.json").version}`,
  },
  cache: false,
  module: {
    rules: [
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
          },
          {
            loader: "less-loader",
            options: {
              lessOptions: {
                javascriptEnabled: true,
                math: "always",
              },
            },
          },
        ],
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
    new ModuleFederationPlugin({
      name: "nav__REMOTE_VERSION__",
      library: { type: "var", name: "nav__REMOTE_VERSION__" },
      filename: "remoteEntry.js",
      remotes: {
        dsl: clientVersion({
          currentHost: "nav",
          remoteName: "dsl",
          dashboardURL: `${
            process.env.VERCEL_URL
              ? "https://federation-dashboard-alpha.vercel.app"
              : "http://localhost:3000"
          }/api/get-remote?token=${process.env.DASHBOARD_READ_TOKEN}`,
        }),
        search: "search",
        utils: "utils",
      },
      exposes: {
        "./Header": "./src/Header",
        "./Footer": "./src/Footer",
      },
      // sharing code based on the installed version, to allow for multiple vendors with different versions
      shared: require("./package.json").dependencies,
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
    process.env.VERCEL_GIT_COMMIT_REF === "master" || !process.env.VERCEL_URL
      ? new DashboardPlugin({
          publishVersion: require("./package.json").version,
          filename: "dashboard.json",
          dashboardURL: process.env.VERCEL_URL
            ? `https://federation-dashboard-alpha.vercel.app/api/update?token=${process.env.DASHBOARD_WRITE_TOKEN}`
            : `http://localhost:3000/api/update?token=${process.env.DASHBOARD_WRITE_TOKEN}`,
          versionChangeWebhook: "http://cnn.com/",
          metadata: {
            baseUrl: process.env.VERCEL_URL
              ? "https://" + process.env.VERCEL_URL
              : "http://localhost:3003",
            source: {
              url: "https://github.com/module-federation/federation-dashboard/tree/master/dashboard-example/nav",
            },
            remote: process.env.VERCEL_URL
              ? "https://" + process.env.VERCEL_URL + "/remoteEntry.js"
              : "http://localhost:3003/remoteEntry.js",
          },
        })
      : () => {},
  ],
};
