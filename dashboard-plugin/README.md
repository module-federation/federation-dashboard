# Module Federation Dashboard Plugin

This Webpack plugin extracts data from the Webpack build, and in particular a build that uses the `ModuleFederationPlugin`, and posts it to the [dashboard](https://hub.docker.com/r/scriptedalchemy/mf-dashboard).

# Installation

```shell script
> yarn add @module-federation/dashboard-plugin -D
```

# Usage

```js
const DashboardPlugin = require("@module-federation/dashboard-plugin");
```

```js
plugins: [
  ...new DashboardPlugin({
    dashboardURL: "https://api.medusa.codes/update?token=writeToken"
  })
];
```

This will post the `ModuleFederationPlugin` metrics to the update endpoint at `https://api.medusa.codes/update?token=writeToken`.

**In order to send data to Medusa, you need to create a write token.** It can be configured here: https://www.medusa.codes/settings

There are also other options:

| Key             | Description                                                                                 |
| --------------- | ------------------------------------------------------------------------------------------- |
| dashboardURL    | The URL of the dashboard endpoint.                                                          |
| metadata        | Any additional metadata you want to apply to this application for use in the dashboard.     |
| filename        | The file path where the dashboard data.                                                     |
| standalone      | For use without ModuleFederationPlugin                                                      |
| versionStrategy | `require('package.json').version` OR `"gitSha"` OR `"buildHash"`                            |
| packageJsonPath | custom path to package.json file, helpful if you get a `topLevelPackage.dependencies` error |

## Metadata

Metadata is _optional_ and is specified as an object.

```js
plugins: [
  ...new DashboardPlugin({
    dashboardURL: "https://api.medusa.codes/update?token=writeToken",
    metadata: {
      source: {
        url: "http://github.com/myorg/myproject/tree/master"
      },
      remote: "http://localhost:8081/remoteEntry.js"
    }
  })
];
```

## versionStrategy

There are a few build-in options for versioning automatically
We Support `gitSha`, `buildHash`, `<custom string>`

**gitSha** uses the git commit hash as the version specifier (default)
**buildHash** uses the webpacks unique build hash generated for each compile as the specifier
**custom** some other form of version specification youd like, such as `require("package.json").version`

You must ensure that this value is unique per release sent to medusa as this is how version pining works

You can add whatever keys you want to `metadata`, but there are some keys that the Dashboard will look for and which result in a better experience.

| Key        | Description                                                  |
| ---------- | ------------------------------------------------------------ |
| source.url | The base URL of your source in a source code control system. |
| remote     | The URL for the remote entry.                                |

## Standalone Mode

This is useful when Module Federation is not used, options can be passed that are usually inferred from Module Federation Options

- `name`: the name of the app, must be unique

## Next.js

Next requires its own specific integration due to how Module Federation works on this platform.

```js
const { withMedusa } = require("@module-federation/dashboard-plugin");
const withPlugins = require("next-compose-plugins");
const { withFederatedSidecar } = require("@module-federation/nextjs-ssr");

module.exports = withPlugins(
  [
    withFederatedSidecar(
      {
        name,
        filename: "static/chunks/remoteEntry.js",
        exposes,
        remotes,
        shared: {
          lodash: {
            import: "lodash",
            requiredVersion: require("lodash").version,
            singleton: true
          },
          chakra: {
            shareKey: "@chakra-ui/react",
            import: "@chakra-ui/react"
          },
          "use-sse": {
            singleton: true,
            requiredVersion: false
          }
        }
      },
      {
        experiments: {
          flushChunks: true,
          hot: true
        }
      }
    ),
    withMedusa({
      name: "home",

      publishVersion: require("./package.json").version,
      filename: "dashboard.json",
      dashboardURL: `https://api.medusa.codes/update?token=${process.env.DASHBOARD_WRITE_TOKEN}`,
      metadata: {
        clientUrl: "https://localhost:3000",
        baseUrl: process.env.VERCEL_URL
          ? "https://" + process.env.VERCEL_URL
          : "http://localhost:3001",
        source: {
          url:
            "https://github.com/module-federation/federation-dashboard/tree/master/dashboard-example/home"
        },
        remote: process.env.VERCEL_URL
          ? "https://" + process.env.VERCEL_URL + "/remoteEntry.js"
          : "http://localhost:3001/remoteEntry.js"
      }
    })
  ],
  nextConfig
);
```
