import fetch from "node-fetch";
import moment from "moment";

export const dashboardEndpoint = "http://localhost:3000/api/update";

const RANDOM_FILE_NAMES = [
  "index.js",
  "home.jsx",
  "listView.jsx",
  "grid.jsx",
  "adminPanel.jsx",
  "panel.jsx",
  "adminPage.jsx",
  "settings.jsx",
  "dashboard.jsx",
  "api.js",
  "header.jsx",
  "footer.jsx",
  "spacer.jsx",
  "dialog.jsx",
  "heroImage.jsx",
  "button.jsx",
  "select.jsx",
  "radio.jsx",
  "dropDown.jsx",
  "carousel.jsx",
  "heroCarousel.jsx",
  "buyButton.jsx",
  "components.jsx",
];

const templateData = {
  dependencies: [
    { name: "@ant-design/icons", version: "4.2" },
    { name: "@emotion/core", version: "10.0" },
    { name: "antd", version: "4.3" },
    { name: "lodash", version: "4.17" },
    { name: "react", version: "16.13" },
    { name: "react-dom", version: "16.13" },
  ],
  devDependencies: [
    { name: "@babel/core", version: "7.9" },
    { name: "@babel/preset-react", version: "7.10" },
    { name: "@module-federation/dashboard-plugin", version: "1.1" },
    { name: "css-loader", version: "3.6" },
    { name: "html-webpack-plugin", version: "4.0.0-beta" },
    { name: "less-loader", version: "6.1" },
    { name: "style-loader", version: "1.2" },
    { name: "webpack", version: "5.0.0-beta" },
    { name: "webpack-cli", version: "3.3" },
    { name: "webpack-dev-server", version: "3.11" },
  ],
  optionalDependencies: [],
  posted: moment(),
  id: "nav",
  name: "nav",
  remote: "http://localhost:3003/remoteEntry.js",
  versionData: {
    container: "remoteEntry.js",
    outputPath:
      "/Volumes/zack_dev/OSS/federation-dashboard/dashboard-example/nav/dist",
    dashboardFileName: "dashboard.json",
    context: "/Volumes/zack_dev/OSS/federation-dashboard/dashboard-example/nav",
    name: "nav",
  },
  overrides: [
    {
      id: "react",
      name: "react",
      version: "16.13",
      location: "react",
      applicationID: "nav",
    },
    {
      id: "react-dom",
      name: "react-dom",
      version: "16.13",
      location: "react-dom",
      applicationID: "nav",
    },
    {
      id: "antd",
      name: "antd",
      version: "4.3",
      location: "antd",
      applicationID: "nav",
    },
    {
      id: "@emotion/core",
      name: "@emotion/core",
      version: "10.0",
      location: "@emotion/core",
      applicationID: "nav",
    },
  ],
  consumes: [
    {
      consumingApplicationID: "nav",
      applicationID: "search",
      name: "MiniSearch",
      usedIn: [
        {
          file: "src/Header.js",
          url:
            "https://github.com/module-federation/federation-dashboard/tree/master/dashboard-example/nav/src/Header.js",
        },
      ],
    },
    {
      consumingApplicationID: "nav",
      applicationID: "dsl",
      name: "Button",
      usedIn: [
        {
          file: "src/Header.js",
          url:
            "https://github.com/module-federation/federation-dashboard/tree/master/dashboard-example/nav/src/Header.js",
        },
      ],
    },
    {
      consumingApplicationID: "nav",
      applicationID: "utils",
      name: "analytics",
      usedIn: [
        {
          file: "src/analytics.js",
          url:
            "https://github.com/module-federation/federation-dashboard/tree/master/dashboard-example/nav/src/analytics.js",
        },
      ],
    },
  ],
  modules: [
    {
      id: "nav:Header",
      name: "Header",
      applicationID: "nav",
      requires: ["react", "antd", "@emotion/core"],
      file: "./src/Header",
    },
    {
      id: "nav:Footer",
      name: "Footer",
      applicationID: "nav",
      requires: ["react", "antd"],
      file: "./src/Footer",
    },
  ],
};

export default class Builder {
  private payload: any = {
    id: "",
    name: "",
    group: "",
    dependencies: [...templateData.dependencies],
    devDependencies: [...templateData.devDependencies],
    optionalDependencies: [...templateData.optionalDependencies],
    overrides: [...templateData.overrides],
    consumes: [],
    modules: [],
    remote: "",
    version: "1.0.0",
  };

  constructor(name, group, port = 8080) {
    this.payload.id = name;
    this.payload.name = name;
    this.payload.group = group;
    this.payload.remote = `http://localhost:${port}/${name}/remoteEntry.js`;
  }

  addModule(name, file, requires = ["react", "antd", "@emotion/core"]) {
    this.payload.modules.push({
      id: `${this.payload.name}:${name}`,
      name,
      applicationID: this.payload.name,
      requires,
      file,
    });
  }

  addConsumes(app, module, uses = 1) {
    const usedIn = [];
    for (let i = 0; i < uses; i++) {
      const file =
        RANDOM_FILE_NAMES[Math.floor(Math.random() * RANDOM_FILE_NAMES.length)];
      usedIn.push({
        file: `src/${file}`,
        url: `https://github.com/module-federation/federation-dashboard/tree/master/dashboard-example/${this.payload.name}/src/${file}.js`,
      });
    }
    this.payload.consumes.push({
      consumingApplicationID: this.payload.name,
      applicationID: app,
      name: module,
      usedIn,
    });
  }

  setOverrideVersion(name, version) {
    this.payload.overrides = this.payload.overrides.map((d) => ({
      ...d,
      version: d.name === name ? version : d.version,
    }));
  }

  setDependencyVersion(name, version) {
    this.payload.dependencies = this.payload.dependencies.map((d) => ({
      ...d,
      version: d.name === name ? version : d.version,
    }));
    this.payload.devDependencies = this.payload.devDependencies.map((d) => ({
      ...d,
      version: d.name === name ? version : d.version,
    }));
    this.payload.optionalDependencies = this.payload.optionalDependencies.map(
      (d) => ({
        ...d,
        version: d.name === name ? version : d.version,
      })
    );
  }

  setPosted(date) {
    this.payload.posted = date;
  }

  bumpVersion(version) {
    this.payload.version = version;
  }

  async pushDevelopmentVersion() {
    this.payload.type = "development";
    return this.push();
  }

  async pushProductionVersion() {
    this.payload.type = "production";
    return this.push();
  }

  private async push() {
    return fetch(dashboardEndpoint, {
      method: "POST",
      body: JSON.stringify(this.payload),
      headers: {
        "Content-type": "application/json",
      },
    });
  }
}
