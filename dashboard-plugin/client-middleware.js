const fetch = require("node-fetch");
const getManagedModules = currentHost => {
  fetch("http://localhost:3000/api/graph", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      query: `query {
    groups {
      name
      applications(id: "${currentHost}") {
        name
        versions {
          version
        }
        overrides {
          name
          version
        }
      }
    }
  }`
    })
  })
    .then(function(res) {
      return res.json().then(function(data) {
        return data.data;
      });
    })
    .then(function(data) {
      if (
        data &&
        data.groups &&
        data.groups[0] &&
        data.groups[0].applications &&
        data.groups[0].applications[0]
      ) {
        const currentApp = data.groups[0].applications[0];
        if (!currentApp.overrides.length) {
          return {};
        }
        const managedModules = {
          [currentApp]: new Set([])
        };
        const allOverrides = currentApp.overrides.map(override => {
          var objVersion =
            override && override.version
              ? override.version.split(".").join("_")
              : "";
          var versionedModule = override.name + "_" + objVersion;

          managedModules[currentApp].add(versionedModule);

          return injectScript(
            document,
            "script",
            "federation-dynamic-remote-${remoteName}-" + objVersion,
            override
          ).then(function() {
            var versionedModule = "${remoteName}_" + objVersion;
            resolve(window[versionedModule]);
          });
        });
      }
    });
};

module.exports = getManagedModules;
