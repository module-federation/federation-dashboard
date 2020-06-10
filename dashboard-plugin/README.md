# Module Federation Dashboard Plugin

This Webpack plugin extracts data from the Webpack build, and in particular a build that uses the `ModuleFederationPlugin`, and posts it to the [dashboard](https://hub.docker.com/r/scriptedalchemy/mf-dashboard).

# Installation

```
yarn add @module-federation/dashboard-plugin -D
```

# Usage

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
