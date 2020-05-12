const HtmlWebpackPlugin = require("html-webpack-plugin");
const DashboardPlugin = require("@module-federation/dashboard-plugin");
const { ModuleFederationPlugin } = require("webpack").container;
const path = require("path");

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
      shared: ["react", "react-dom", "@emotion/core"].reduce((shared, pkg) => {
        // you can also trim the patch version off so you share at the feature version level
        // react-16.8, not react-16.8.3, Better vendor sharing will be available as you'd share 16.8.x
        Object.assign(shared, { [`${pkg}-${require(pkg).version}`]: pkg });
        return shared;
      }, {}),
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
