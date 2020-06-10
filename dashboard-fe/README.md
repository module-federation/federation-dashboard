# Federated Modules Dashboard

## Docker useage

To run the dashboard and test it out use this command:

```bash
docker run -p 3000:3000 -it scriptedalchemy/mf-dashboard:latest
```

This will create temporary database inside the docker container in its `/data` directory. This command

```bash
mkdir dashboard-data
docker run -p 3000:3000 \
  --mount type=bind,source="$(pwd)"/dashboard-data,target=/data \
  -t scriptedalchemy/mf-dashboard:latest
```

This will create a sub-directory called `dashboard-data` and then store the Dashboards data in that directory.

You should then be able to connect to the dashboard at [http://localhost:3000](http://localhost:3000).

## API

There are two endpoints. The primary GraphQL endpoint is on `/api/graphql`. And the upload endpoint for the plugin is in `/api/update`.

## Developing

```bash
yarn
```

```bash
yarn dev
```

```bash
yarn build
yarn start
```
