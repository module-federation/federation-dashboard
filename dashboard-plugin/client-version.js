const injectScript = function (d, s, id, override) {
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
    const src =
      override && override.version
        ? "http://localhost:3002/" + override.version + ".remoteEntry.js"
        : "http://localhost:3002/remoteEntry.js";
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

module.exports = ({ currentHost, remoteName, dashboardURL }) => {
  return `promise new Promise((resolve, reject) => {
   fetch("${dashboardURL}", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: \`query {
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
  }\`,
    }),
  }).then(function(res){
  return res.json().then(function(data){return data.data})
  }).then(function(data){
      var injectScript = ${injectScript.toString()}
      if(data && data.groups && data.groups[0] && data.groups[0].applications && data.groups[0].applications[0]) {
        const currentApp = data.groups[0].applications[0];
        if (!currentApp.overrides.length) {
          injectScript(document, "script", "federation-dynamic-remote-${remoteName}").then(function() {
            resolve(window.${remoteName})
          });
          return;
        }
        const allOverrides = currentApp.overrides.map((override) => {
          var objVersion = override && override.version ? override.version.split('.').join('_') : "";
          return injectScript(
            document,
            "script",
            "federation-dynamic-remote-${remoteName}-" + objVersion,
            override
          ).then(function(){
           var versionedModule =  "${remoteName}_" + objVersion;
           resolve(window[versionedModule])
          })
        });
      }
    })
  }).then((res)=>{
  return res;
  }).catch(console.error)`;
};
