const HtmlWebpackPlugin = require("html-webpack-plugin");
const DashboardPlugin = require("@module-federation/dashboard-plugin");

const { ModuleFederationPlugin } = require("webpack").container;
const path = require("path");
const sharedReduce = ["react", "react-dom"].reduce((shared, pkg) => {
  Object.assign(shared, { [`${pkg}-${require(pkg).version}`]: pkg });
  return shared;
}, {});
module.exports = {
  entry: "./src/index",
  mode: "development",
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    port: 3002,
  },
  output: {
    publicPath: "http://localhost:3002/",
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
      name: "search",
      library: { type: "var", name: "search" },
      filename: "remoteEntry.js",
      remotes: {
        nav: "nav",
        home: "home",
      },
      exposes: {
        SearchList: "./src/SearchList",
        MiniSearch: "./src/MiniSearch",
      },
      shared: sharedReduce,
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
    new DashboardPlugin({
      filename: "dashboard.json",
      reportFunction: (data) => {
        console.log("afterDone", data);
      },
    }),
  ],
};
