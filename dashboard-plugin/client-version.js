function injectScript(d, s, id, override) {
  // metadata is passed in since this function is included in the closeure
  //scope as a string
  var baseUrl = metadata.find(function (o) {
    return o.name === "baseUrl";
  });

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
        ? baseUrl.value + "/" + override.version + ".remoteEntry.js"
        : baseUrl.value + "/remoteEntry.js";
    js.src = src;

    js.setAttribute("data-webpack", remoteName.replace("-", "_"));
    fjs.parentNode.insertBefore(js, fjs);
  });
  if (!window.pendingRemote) {
    window.pendingRemote = {};
  }
  if (override && override.version) {
    var remoteAndVersion = remoteName.split("-");
    window.pendingRemote[remoteAndVersion[0] + "_" + remoteAndVersion[1]] =
      promise;
  } else {
    window.pendingRemote[remoteName] = promise;
  }
  return promise;
}

module.exports = ({ currentHost, remoteName, dashboardURL }) => {
  return `promise new Promise((resolve, reject) => {
   fetch("${dashboardURL}&currentHost=${currentHost}&remoteName=${remoteName}", {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  })
  .then((res) => res.json())
  .then(function(data){
      // Here we have data as { name: string, remoteURL: string, version: string }
      var metadata = [{name: 'baseUrl', value: data.remoteURL}];
      ${injectScript.toString()}
      return injectScript(document, "script", "federation-dynamic-remote-${remoteName}").then(function() {
        console.log(window.${remoteName});
        resolve(window.${remoteName});
      });
    })
  }).catch(console.error)`;
};
