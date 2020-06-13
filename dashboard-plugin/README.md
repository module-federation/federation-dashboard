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
    dashboardURL: "http://localhost:3000/api/update",
  }),
];
```

This will post the `ModuleFederationPlugin` metrics to the update endpoint at `http://localhost:3000/api/update`.

There are also other options:

| Key          | Description                                                                             |
| ------------ | --------------------------------------------------------------------------------------- |
| dashboardURL | The URL of the dashboard endpoint.                                                      |
| metadata     | Any additional metadata you want to apply to this application for use in the dashboard. |
| filename     | The file path where the dashboard data.                                                 |

## Metadata

Metadata is _optional_ and is specified as an object.

```js
plugins: [
  ...new DashboardPlugin({
    dashboardURL: "http://localhost:3000/api/update",
    metadata: {
      source: {
        url: "http://github.com/myorg/myproject/tree/master",
      },
      remote: "http://localhost:8081/remoteEntry.js",
    },
  }),
];
```

You can add whatever keys you want to `metadata`, but there are some keys that the Dashboard will look for and which result in a better experience.

| Key        | Description                                                  |
| ---------- | ------------------------------------------------------------ |
| source.url | The base URL of your source in a source code control system. |
| remote     | The URL for the remote entry.                                |
