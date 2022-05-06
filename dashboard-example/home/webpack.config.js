require("dotenv").config({ path: "../.env" });
const HtmlWebpackPlugin = require("html-webpack-plugin");
const DashboardPlugin = require("@module-federation/dashboard-plugin");
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
          dashboardURL: `${
            process.env.VERCEL_URL
              ? "https://federation-dashboard-alpha.vercel.app"
              : "http://localhost:3000"
          }/api/get-remote?token=${process.env.DASHBOARD_WRITE_TOKEN}`,
        }),
        search: clientVersion({
          currentHost: "home",
          remoteName: "search",
          dashboardURL: `${
            process.env.VERCEL_URL
              ? "https://federation-dashboard-alpha.vercel.app"
              : "http://localhost:3000"
          }/api/get-remote?token=${process.env.DASHBOARD_READ_TOKEN}`,
        }),
        nav: clientVersion({
          currentHost: "home",
          remoteName: "nav",
          dashboardURL: `${
            process.env.VERCEL_URL
              ? "https://federation-dashboard-alpha.vercel.app"
              : "http://localhost:3000"
          }/api/get-remote?token=${process.env.DASHBOARD_READ_TOKEN}`,
        }),
        utils: clientVersion({
          currentHost: "home",
          remoteName: "utils",
          dashboardURL: `${
            process.env.VERCEL_URL
              ? "https://federation-dashboard-alpha.vercel.app"
              : "http://localhost:3000"
          }/api/get-remote?token=${process.env.DASHBOARD_READ_TOKEN}`,
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
    process.env.VERCEL_GIT_COMMIT_REF === "master" || !process.env.VERCEL_URL
      ? new DashboardPlugin({
          publishVersion: require("./package.json").version,
          filename: "dashboard.json",
          dashboardURL: process.env.VERCEL_URL
            ? "https://federation-dashboard-alpha.vercel.app/api/update?token=c754d13b-a294-462e-b0ef-71d2ad307426"
            : `http://localhost:3000/api/update?token=${process.env.DASHBOARD_WRITE_TOKEN}`,
          versionChangeWebhook: "http://cnn.com/",
          metadata: {
            clientUrl: "http://localhost:3000",
            baseUrl: process.env.VERCEL_URL
              ? "https://" + process.env.VERCEL_URL
              : "http://localhost:3001",
            source: {
              url: "https://github.com/module-federation/federation-dashboard/tree/master/dashboard-example/home",
            },
            remote: process.env.VERCEL_URL
              ? "https://" + process.env.VERCEL_URL + "/remoteEntry.js"
              : "http://localhost:3001/remoteEntry.js",
          },
        })
      : () => {},
  ],
};
