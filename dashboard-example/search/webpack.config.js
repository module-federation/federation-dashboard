const HtmlWebpackPlugin = require("html-webpack-plugin");
const DashboardPlugin = require("@module-federation/dashboard-plugin");

const { ModuleFederationPlugin } = require("webpack").container;
const path = require("path");

module.exports = {
  entry: "./src/index",
  mode: "development",
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    port: 3004
  },
  output: {
    publicPath: "http://localhost:3004/"
  },
  module: {
    rules: [
      {
        test: /\.less$/,
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader"
          },
          {
            loader: "less-loader",
            options: {
              lessOptions: {
                javascriptEnabled: true
              }
            }
          }
        ]
      },
      {
        test: /\.jsx?$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        options: {
          presets: ["@babel/preset-react"]
        }
      }
    ]
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "search",
      library: { type: "var", name: "search" },
      filename: "remoteEntry.js",
      remotes: {
        nav: "nav",
        dsl: "dsl",
        home: "home",
        utils: "utils"
      },
      exposes: {
        "./SearchList": "./src/SearchList",
        "./MiniSearch": "./src/MiniSearch"
      },
      shared: require("./package.json").dependencies
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html"
    }),
    new DashboardPlugin({
      filename: "dashboard.json",
      dashboardURL: "http://localhost:3000/api/update",
      metadata: {
        source: {
          url:
            "https://github.com/module-federation/federation-dashboard/tree/master/dashboard-example/search"
        },
        remote: "http://localhost:3004/remoteEntry.js"
      }
    })
  ]
};
