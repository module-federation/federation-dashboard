const HtmlWebpackPlugin = require("html-webpack-plugin");
const DashboardPlugin = require("../../dashboard-plugin/FederationDashboardPlugin");
const clientVersion = require("@module-federation/dashboard-plugin/client-version");

const { ModuleFederationPlugin } = require("webpack").container;
const path = require("path");

module.exports = {
  entry: "./src/index",
  mode: "development",
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    port: 3004,
  },
  output: {
    filename: "[name].[contenthash].js",
    chunkFilename: "[name].[contenthash].js",
    publicPath: `auto`,
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
      name: "search__REMOTE_VERSION__",
      library: { type: "var", name: "search__REMOTE_VERSION__" },
      filename: "remoteEntry.js",
      remotes: {
        nav: "nav",
        dsl: clientVersion({
          currentHost: "search",
          remoteName: "dsl",
          dashboardURL: "http://localhost:3000/api/graphql",
        }),
        home: "home",
        utils: "utils",
      },
      exposes: {
        "./SearchList": "./src/SearchList",
        "./MiniSearch": "./src/MiniSearch",
      },
      shared: require("./package.json").dependencies,
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
    new DashboardPlugin({
      publishVersion: require("./package.json").version,
      filename: "dashboard.json",
      dashboardURL:
        "http://localhost:3000/api/update?token=29f387e1-a00d-46ea-9fd6-02ca5e97449c",
      metadata: {
        baseUrl: "http://localhost:3004",
        source: {
          url: "https://github.com/module-federation/federation-dashboard/tree/master/dashboard-example/search",
        },
        remote: "http://localhost:3004/remoteEntry.js",
      },
    }),
  ],
};
