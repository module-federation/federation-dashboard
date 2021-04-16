# Medusa

The Module Federation dashboard takes visualizes the relationships between applications that expose and consume federatd modules.

# What is Medusa??

<a href="https://youtu.be/JkOvNPMo7Os" target="_blank">click here to watch <img width="50%" src="http://i3.ytimg.com/vi/JkOvNPMo7Os/maxresdefault.jpg"/><a>

# Installation and startup

Trying it out on the test data

Step 1:

```shell script
> yarn install --no-lockfile
```

Step 2:

```shell script
> cd dashboard-fe
> yarn build && yarn serve
```

Step 3:

```shell script
> cd dashboard-example
> yarn build && yarn serve
```

# Trying it out on your own code

Globally install and launch the dashboard:

```shell script
> npm install -g @module-federation/dashboard
> mfdash
```

The dashboard will be available on [http://localhost:3000/](http://localhost:3000/).

In your project, first install the dashboard plugin.

```shell script
> yarn add @module-federation/dashboard-plugin -D
```

In your `webpack.config.js` import the dashboard plugin.

```js
const DashboardPlugin = require("@module-federation/dashboard-plugin");
```

And add the plugin to the `plugins` array and alter the parameters to suit.

```js
    new DashboardPlugin({
      filename: "dashboard.json",
      dashboardURL: "http://localhost:3000/api/update",
      metadata: {
        baseUrl:"http://localhost:3002",
        source: {
          url:
            "https://github.com/module-federation/federation-dashboard/tree/master/dashboard-example/dsl",
        },
        remote: "http://localhost:3002/remoteEntry.js",
      }
    })
```

Neither `filename` nor `dashboardURL` are required. It's up to you how and when to invoke this plugin and how to store that data and send it to the dashboard. The `/api/update` endpoint just takes a JSON payload 'as-is'. To post the `dashboard.json` data manually use a `curl` request like this:

```shell script
> curl "http://localhost:3000/api/update" -X POST \
  -d @dashboard-example/utils/dist/dashboard.json \
  -H "Content-type: application/json"
```

Metadata isn't required, but it does make the experience better. For example, the `source` URL is used to provide clickable file links in some views. And the `remote` is used when providing information on how to consume the modules provided by

You should be able to see your application listed. You are _not_ required to have all your federated applicatons listed in the dashboard. But if application A depends on application B, and A is in the dashboard, but B is not, then you will not see references to B because the dashboard doesn't have that data. So you should do your best to get all the applications data into the dashboard.
