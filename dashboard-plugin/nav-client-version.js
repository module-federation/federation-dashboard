function injectScript(d, s, id, override) {
  // metadata is passed in since this function is included in the closeure
  //scope as a string
  var baseUrl = metadata.find(function (o) {
    return o.name === "baseUrl";
  });
  console.log("baseUrl", baseUrl);

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
    js.async = true;
    js.onload = function () {
      resolve();
    };
    console.log(baseUrl.value);
    const src =
      override && override.version
        ? "http://localhost:3003/" + override.version + ".remoteEntry.js"
        : "http://localhost:3003/remoteEntry.js";
    js.src = src;

    js.setAttribute("data-webpack", remoteName.replace("-", "_"));
    fjs.parentNode.insertBefore(js, fjs);
  });
  if (!window.pendingRemote) {
    window.pendingRemote = {};
  }
  if (override && override.version) {
    var remoteAndVersion = remoteName.split("-");
    window.pendingRemote[
      remoteAndVersion[0] + "_" + remoteAndVersion[1]] =
     promise;
  } else {
    window.pendingRemote[remoteName] = promise;
  }
  return promise;
}

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
        metadata {
          name
          value
        }
        overrides {
          name
          version
          application {
            metadata {
              name
              value
            }
          }
        }
      }
    }
  }\`,
    }),
  }).then(function(res){
    return res.json().then(function(data){return data.data})
  }).then(function(data){
      var metadata;
      ${injectScript.toString()}
      if(data && data.groups && data.groups[0] && data.groups[0].applications && data.groups[0].applications[0]) {
        var currentApp = data.groups[0].applications[0];
       
        if (!data.groups[0].applications[0].overrides.length) {
          console.log('about to inject script',data.groups[0].applications[0].metadata);
          metadata = data.groups[0].applications[0].metadata
          injectScript(document, "script", "federation-dynamic-remote-${remoteName}",data.groups[0].applications[0].metadata).then(function() {
            resolve(window.${remoteName});
            metadata = null
          });
          return;
        }
        const allOverrides = currentApp.overrides.map((override) => {
          var objVersion = override && override.version ? override.version.split('.').join('_') : "";
          metadata = override.application.metadata
          return injectScript(
            document,
            "script",
            "federation-dynamic-remote-${remoteName}-" + objVersion,
            override,
          ).then(function(){
           var versionedModule =  "${remoteName}_" + objVersion;
           setTimeout(function(){
           resolve(window[versionedModule])
           },100)
          })
        });
      }
    })
  }).then((res)=>{
  return res;
  }).catch(console.error)`;
};
