const HtmlWebpackPlugin = require("html-webpack-plugin");
const DashboardPlugin = require("@module-federation/dashboard-plugin");
const { container:{ModuleFederationPlugin }, DefinePlugin} = require("webpack");
const path = require("path");

module.exports = {
  entry: "./src/index",
  mode: "development",
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    port: 3001
  },
  output: {
    filename: "[name].[contenthash].js",
    chunkFilename: "[name].[contenthash].js",
    publicPath: `http://localhost:3001/`
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false
        }
      },
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
      name: "home",
      library: { type: "var", name: "home" },
      filename: "remoteEntry.js",
      remotes: {
        search: "search",
        dsl: "dsl",
        nav: "nav",
        utils: "utils"
      },
      exposes: {
        "./ProductCarousel": "./src/ProductCarousel",
        "./HeroImage": "./src/HeroImage"
      },
      // sharing code based on the installed version, to allow for multiple vendors with different versions
      shared: require("./package.json").dependencies
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html"
    }),
    new DashboardPlugin({
      version: true,
      filename: "dashboard.json",
      dashboardURL: "http://localhost:3000/api/update",
      versionChangeWebhook: "http://cnn.com/",
      metadata: {
        clientUrl: "http://localhost:3000",
        source: {
          url:
            "https://github.com/module-federation/federation-dashboard/tree/master/dashboard-example/home"
        },
        remote: "http://localhost:3001/remoteEntry.js"
      }
    })
  ]
};
