# Federated Modules Dashboard

## Docker useage

To run the dashboard and test it out use this command:

```shell script
> docker run -p 3000:3000 -it scriptedalchemy/mf-dashboard:latest
```

This will create temporary database inside the docker container in its `/data` directory. This command

```shell script
> mkdir dashboard-data
> docker run -p 3000:3000 \
  --mount type=bind,source="$(pwd)"/dashboard-data,target=/data \
  -t scriptedalchemy/mf-dashboard:latest
```

This will create a sub-directory called `dashboard-data` and then store the Dashboards data in that directory.

You should then be able to connect to the dashboard at [http://localhost:3000](http://localhost:3000).

## Connecting the plugin

Bring the plugin into the project.

```shell script
> yarn add @module-federation/dashboard-plugin -D
```

Add this to the top of the Webpack configuration file.

```js
const DashboardPlugin = require("@module-federation/dashboard-plugin");
```

Add the `DashboardPlugin` to the `plugins` array.

```js
plugins: [
  ...new DashboardPlugin({
    dashboardURL: "http://localhost:3000/api/update",
  }),
];
```

More information on the plugin is [available on NPM](https://www.npmjs.com/package/@module-federation/dashboard-plugin).

## API

There are two endpoints. The primary GraphQL endpoint is on `/api/graphql`. And the upload endpoint for the plugin is in `/api/update`.

## Developing

The Module Federation Dashboard is a [NextJS application](https://nextjs.org/) that runs it's own GraphQL endpoint to serve data to the frontend code.

Install the dependencies.

```bash
yarn
```

Start up the development server.

```bash
yarn dev
```

Build the production server and start it.

```bash
yarn build
yarn start
```
