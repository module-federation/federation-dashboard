const HtmlWebpackPlugin = require("html-webpack-plugin");
const DashboardPlugin = require("@module-federation/dashboard-plugin");
const { ModuleFederationPlugin } = require("webpack").container;
const path = require("path");
const AutomaticVendorFederation = require("@module-federation/automatic-vendor-federation");
const packageJson = require("./package.json");
const exclude = ["babel", "plugin", "preset", "webpack", "loader", "serve"];
const ignoreVersion = ["react", "react-dom", "@emotion/core"];

module.exports = {
  entry: "./src/index",
  mode: "development",
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    port: 3001,
  },
  output: {
    publicPath: "http://localhost:3001/",
  },
  module: {
    rules: [
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
      name: "dsl",
      library: { type: "var", name: "dsl" },
      filename: "remoteEntry.js",
      remotes: {},
      exposes: {
        Button: "./src/Button",
        Carousel: "./src/Carousel",
        Dialog: "./src/Dialog",
        Slider: "./src/Slider",
        TextField: "./src/TextField",
      },
      // sharing code based on the installed version, to allow for multiple vendors with different versions
      shared: AutomaticVendorFederation({
        exclude,
        ignoreVersion,
        packageJson,
        shareFrom: ["dependencies"],
        ignorePatchVersion: true,
      }),
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
    new DashboardPlugin({
      filename: "dashboard.json",
      metadata: {
        source: {
          url:
            "https://github.com/module-federation/federation-dashboard/tree/master/dashboard-example/dsl",
        },
        remote: "http://assets.mycompany.com/dsl/remoteEntry.js",
      },
      reportFunction: (data) => {
        console.log("afterDone", data);
      },
    }),
  ],
};
