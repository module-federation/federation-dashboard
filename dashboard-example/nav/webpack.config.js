const HtmlWebpackPlugin = require("html-webpack-plugin");
const DashboardPlugin = require("@module-federation/dashboard-plugin");
const clientVersion = require("@module-federation/proprietary-tools/packages/managed-modules/client-version");
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
        loader: "babel-loader",
        exclude: /node_modules/,
        options: {
          presets: ["@babel/preset-react"],
        },
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "nav__REMOTE_VERSION__",
      filename: "remoteEntry.js",
      remotes: {
        dsl: clientVersion({
          currentHost: "nav",
          remoteName: "dsl",
          dashboardURL: "http://localhost:3000/api/graphql",
        }),
        search: "search@http://localhost:3004/remoteEntry.js",
        utils: "utils@http://localhost:3005/remoteEntry.js",
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
          "http://localhost:3000/api/update?token=29f387e1-a00d-46ea-9fd6-02ca5e97449c",
      versionChangeWebhook: "http://cnn.com/",
      metadata: {
        clientUrl: "http://localhost:3000",
        source: {
          url: "https://github.com/module-federation/federation-dashboard/tree/master/dashboard-example/nav",
        },
        remote: "http://localhost:3003/remoteEntry.js",
      },
    })
  ]
};
