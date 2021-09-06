const HtmlWebpackPlugin = require("html-webpack-plugin");
const DashboardPlugin = require("../../dashboard-plugin/FederationDashboardPlugin");
const { ModuleFederationPlugin } = require("webpack").container;
const path = require("path");
module.exports = {
  entry: "./src/index",
  mode: "development",
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    port: 3002,
  },
  output: {
    filename: "[name].[contenthash].js",
    chunkFilename: "[name].[contenthash].js",
    publicPath: `auto`,
    uniqueName: `dsl.${require("./package.json").version}`,
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
            options: {
              modules: true,
            },
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
      name: "dsl__REMOTE_VERSION__",
      library: { type: "var", name: "dsl__REMOTE_VERSION__" },
      filename: "remoteEntry.js",
      remotes: {},
      exposes: {
        "./Button": "./src/Button",
        "./Carousel": "./src/Carousel",
        "./TextField": "./src/TextField",
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
        "https://federation-dashboard-alpha.vercel.app/api/update?token=29f387e1-a00d-46ea-9fd6-02ca5e97449c",
      metadata: {
        baseUrl: "http://localhost:3002",
        source: {
          url: "https://github.com/module-federation/federation-dashboard/tree/master/dashboard-example/dsl",
        },
        remote: "http://localhost:3002/remoteEntry.js",
      },
    }),
  ],
};
