# Medusa Plugin Data Schema

A dependency like this is one thats used and found in the webpack graph

```json
 {
      "name": "@ant-design/icons",
      "version": "4.7.0",
      "license": "MIT",
      "size": 43030
    },
```

one like this is found in the package.json file, but was not actually used in the webpack final build graph

```json
  {
      "name": "antd",
      "version": "4.19"
    },
```

The whole schema as current

```json
{
  "dependencies": [
    {
      "name": "@ant-design/icons",
      "version": "4.7.0",
      "license": "MIT",
      "size": 43030
    },
    {
      "name": "antd",
      "version": "4.19"
    },
    {
      "name": "esbuild-loader",
      "version": "2.19"
    },
    {
      "name": "lodash",
      "version": "4.17.21",
      "license": "MIT",
      "size": 87725
    },
    {
      "name": "react",
      "version": "17.0.2",
      "license": "MIT",
      "size": 6640
    },
    {
      "name": "react-dom",
      "version": "17.0.2",
      "license": "MIT",
      "size": 122051
    }
  ],
  "devDependencies": [
    {
      "name": "@babel/core",
      "version": "7.17"
    },
    {
      "name": "@module-federation/dashboard-plugin",
      "version": "2.4"
    },
    {
      "name": "@webpack-cli/serve",
      "version": "1.5"
    },
    {
      "name": "css-loader",
      "version": "5.2.7",
      "license": "MIT",
      "size": 1605
    },
    {
      "name": "html-webpack-plugin",
      "version": "5.3"
    },
    {
      "name": "less",
      "version": "4.1"
    },
    {
      "name": "less-loader",
      "version": "8.1"
    },
    {
      "name": "style-loader",
      "version": "2.0.0",
      "license": "MIT",
      "size": 6827
    },
    {
      "name": "webpack",
      "version": "5.61"
    },
    {
      "name": "webpack-cli",
      "version": "4.7"
    },
    {
      "name": "webpack-dev-server",
      "version": "4.7"
    }
  ],
  "optionalDependencies": [],
  "id": "home",
  "name": "home",
  "remote": "http://localhost:3001/remoteEntry.js",
  "metadata": {
    "clientUrl": "http://localhost:3333",
    "baseUrl": "http://localhost:3001",
    "source": {
      "url": "https://github.com/module-federation/federation-dashboard/tree/master/dashboard-example/home"
    },
    "remote": "http://localhost:3001/remoteEntry.js"
  },
  "overrides": [
    {
      "version": "",
      "applicationID": "home"
    },
    {
      "id": "react",
      "name": "react",
      "version": "17.0.2",
      "location": "react",
      "applicationID": "home"
    },
    {
      "id": "antd",
      "name": "antd",
      "version": "4.19",
      "location": "antd",
      "applicationID": "home"
    },
    {
      "id": "react-dom",
      "name": "react-dom",
      "version": "17.0.2",
      "location": "react-dom",
      "applicationID": "home"
    }
  ],
  "consumes": [
    {
      "consumingApplicationID": "home",
      "applicationID": "dsl",
      "name": "Carousel",
      "usedIn": [
        {
          "file": "src/ProductCarousel.js",
          "url": "https://github.com/module-federation/federation-dashboard/tree/master/dashboard-example/home/src/ProductCarousel.js"
        }
      ]
    },
    {
      "consumingApplicationID": "home",
      "applicationID": "nav",
      "name": "Header",
      "usedIn": [
        {
          "file": "src/App.js",
          "url": "https://github.com/module-federation/federation-dashboard/tree/master/dashboard-example/home/src/App.js"
        }
      ]
    },
    {
      "consumingApplicationID": "home",
      "applicationID": "nav",
      "name": "Footer",
      "usedIn": [
        {
          "file": "src/App.js",
          "url": "https://github.com/module-federation/federation-dashboard/tree/master/dashboard-example/home/src/App.js"
        }
      ]
    },
    {
      "consumingApplicationID": "home",
      "applicationID": "search",
      "name": "SearchList",
      "usedIn": [
        {
          "file": "src/App.js",
          "url": "https://github.com/module-federation/federation-dashboard/tree/master/dashboard-example/home/src/App.js"
        }
      ]
    },
    {
      "consumingApplicationID": "home",
      "applicationID": "utils",
      "name": "analytics",
      "usedIn": [
        {
          "file": "src/analytics.js",
          "url": "https://github.com/module-federation/federation-dashboard/tree/master/dashboard-example/home/src/analytics.js"
        }
      ]
    },
    {
      "consumingApplicationID": "home",
      "applicationID": "dsl",
      "name": "Button",
      "usedIn": [
        {
          "file": "src/PageLG.js",
          "url": "https://github.com/module-federation/federation-dashboard/tree/master/dashboard-example/home/src/PageLG.js"
        },
        {
          "file": "src/PageMimi.js",
          "url": "https://github.com/module-federation/federation-dashboard/tree/master/dashboard-example/home/src/PageMimi.js"
        },
        {
          "file": "src/PageSally.js",
          "url": "https://github.com/module-federation/federation-dashboard/tree/master/dashboard-example/home/src/PageSally.js"
        },
        {
          "file": "src/PageSammy.js",
          "url": "https://github.com/module-federation/federation-dashboard/tree/master/dashboard-example/home/src/PageSammy.js"
        }
      ]
    }
  ],
  "modules": [
    {
      "id": "home:ProductCarousel",
      "name": "ProductCarousel",
      "applicationID": "home",
      "requires": ["react", "antd"],
      "file": "./src/ProductCarousel"
    },
    {
      "id": "home:HeroImage",
      "name": "HeroImage",
      "applicationID": "home",
      "requires": ["react"],
      "file": "./src/HeroImage"
    }
  ],
  "version": "43d3485d2ac9432112c4a7cd0fce44f1cb0f3dc3",
  "sha": "43d3485d2ac9432112c4a7cd0fce44f1cb0f3dc3",
  "buildHash": "1bcd665347afd646ec1a"
}
```

## Ideal Schema

TBD?
