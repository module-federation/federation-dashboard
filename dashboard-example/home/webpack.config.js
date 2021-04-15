const HtmlWebpackPlugin = require("html-webpack-plugin");
const DashboardPlugin = require("@module-federation/dashboard-plugin");
const clientVersion = require("@module-federation/proprietary-tools/packages/managed-modules/client-version");
const {
  container: { ModuleFederationPlugin },
} = require("webpack");
const path = require("path");
var injectScript = function (d, s, id, override, baseUrl) {
  var remoteName = id.replace("federation-dynamic-remote-", "");
  const promise = new Promise((resolve) => {
    var js,
      fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
      if (override) {
        var remoteAndVersion = remoteName.split("-");

        return resolve(
          window[remoteAndVersion[0] + "_" + remoteAndVersion[1]] ||
            window.pendingRemote[
              remoteAndVersion[0] + "_" + remoteAndVersion[1]
            ]
        );
      } else if (window[remoteName]) {
        return resolve(window[remoteName]);
      } else {
        return resolve(window.pendingRemote[remoteName]);
      }
    }
    js = d.createElement(s);
    js.id = id;
    js.onload = function () {
      resolve();
    };
    if (!baseUrl)
      console.error(
        "missing baseUrl in  federation dashboard config for",
        remoteName
      );
    const src =
      override && override.version
        ? baseUrl + "/" + override.version + ".remoteEntry.js"
        : baseUrl + "/remoteEntry.js";
    console.log("creating scrpit", src, id);
    js.src = src;

    js.setAttribute("data-webpack", remoteName);
    fjs.parentNode.insertBefore(js, fjs);
  });
  if (!window.pendingRemote) {
    window.pendingRemote = {};
  }
  if (override && override.version) {
    var remoteAndVersion = remoteName.split("-");
    window.pendingRemote[
      remoteAndVersion[0] + "_" + remoteAndVersion[1]
    ] = promise;
  } else {
    window.pendingRemote[remoteName] = promise;
  }
  return promise;
};

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
          loader:'jsx',
          target:"es2015",
        },
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "home__REMOTE_VERSION__",
      filename: "remoteEntry.js",
      library: { type: "var", name: "home__REMOTE_VERSION__" },
      remotes: {
        dsl: clientVersion({
          currentHost: "home",
          remoteName: "dsl",
          dashboardURL: "http://localhost:3000/api/graphql",
        }),
        search: clientVersion({
          currentHost: "home",
          remoteName: "search",
          dashboardURL: "http://localhost:3000/api/graphql",
        }),
        nav: clientVersion({
          currentHost: "home",
          remoteName: "nav",
          dashboardURL: "http://localhost:3000/api/graphql",
        }),
        utils: clientVersion({
          currentHost: "home",
          remoteName: "utils",
          dashboardURL: "http://localhost:3000/api/graphql",
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
    }),
    new DashboardPlugin({
      publishVersion: require("./package.json").version,
      filename: "dashboard.json",
      dashboardURL:
        "http://localhost:3000/api/update?token=29f387e1-a00d-46ea-9fd6-02ca5e97449c",
      versionChangeWebhook: "http://cnn.com/",
      metadata: {
        clientUrl: "http://localhost:3000",
        baseUrl: "http://localhost:3001",
        source: {
          url:
            "https://github.com/module-federation/federation-dashboard/tree/master/dashboard-example/home",
        },
        remote: "http://localhost:3001/remoteEntry.js",
      },
    }),
  ],
};
