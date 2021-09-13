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
          dashboardURL:
            "https://federation-dashboard-alpha.vercel.app/api/graphql?token=d9a72038-a1cd-4069-85e2-d8f56d84372e",
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
    new DashboardPlugin({
      publishVersion: require("./package.json").version,
      filename: "dashboard.json",
      dashboardURL:
        "https://federation-dashboard-alpha.vercel.app/api/update?token=ca9e136d-0ec1-4f46-9d11-817d24219531",
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
    }),
  ],
};
