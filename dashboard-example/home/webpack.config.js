const HtmlWebpackPlugin = require("html-webpack-plugin");
const DashboardPlugin = require("../../dashboard-plugin/FederationDashboardPlugin");
const clientVersion = require("../../dashboard-plugin/client-version");

const {
  container: { ModuleFederationPlugin },
} = require("webpack");
const path = require("path");

module.exports = {
  entry: "./src/index",
  mode: "development",
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    port: 3001,
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
    // new FunctionCall(),
    new ModuleFederationPlugin({
      name: "home",
      filename: "remoteEntry.js",
      library: { type: "var", name: "home" },
      remotes: {
        dsl: clientVersion({
          currentHost: "home",
          remoteName: "dsl",
          dashboardURL:
            "http://localhost:3000/api/graphql?token=d9a72038-a1cd-4069-85e2-d8f56d84372e",
        }),
        search: clientVersion({
          currentHost: "home",
          remoteName: "search",
          dashboardURL:
            "http://localhost:3000/api/graphql?token=d9a72038-a1cd-4069-85e2-d8f56d84372e",
        }),
        nav: clientVersion({
          currentHost: "home",
          remoteName: "nav",
          dashboardURL:
            "http://localhost:3000/api/graphql?token=d9a72038-a1cd-4069-85e2-d8f56d84372e",
        }),
        utils: clientVersion({
          currentHost: "home",
          remoteName: "utils",
          dashboardURL:
            "http://localhost:3000/api/graphql?token=d9a72038-a1cd-4069-85e2-d8f56d84372e",
        }),
      },
      exposes: {
        "./ProductCarousel": "./src/ProductCarousel",
        "./HeroImage": "./src/HeroImage",
      },
      // sharing code based on the installed version, to allow for multiple vendors with different versions
      shared: require("./package.json").dependencies,
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      excludeChunks: ["remoteEntry"],
    }),
    new DashboardPlugin({
      publishVersion: require("./package.json").version,
      filename: "dashboard.json",
      dashboardURL:
        "https://federation-dashboard-alpha.vercel.app/api/update?token=ca9e136d-0ec1-4f46-9d11-817d24219531",
      versionChangeWebhook: "http://cnn.com/",
      metadata: {
        clientUrl: "http://localhost:3000",
        baseUrl: "http://localhost:3001",
        source: {
          url: "https://github.com/module-federation/federation-dashboard/tree/master/dashboard-example/home",
        },
        remote: "http://localhost:3001/remoteEntry.js",
      },
    }),
  ],
};
