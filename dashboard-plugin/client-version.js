function injectScript(d, s, id, override) {
  // metadata is passed in since this function is included in the closeure
  //scope as a string

  var remoteName = id.replace("federation-dynamic-remote-", "");
  const promise = new Promise((resolve) => {
    var js,
      fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
      if (override) {
        var remoteAndVersion = remoteName.split("-");

        return resolve(
          metadata
        );
      } else if (window[remoteName]) {
        return resolve(metadata);
      } else {
        return resolve(metadata);
      }
    }
    js = d.createElement(s);
    js.id = id;
    js.onload = function () {
      resolve(metadata);
    };

    console.log("meta", metadata);
    let src = metadata.remoteURL + '/'+ metadata.version + '.remoteEntry.js';
    // const src =
    //   override && override.version
    //     ? baseUrl.value + "/" + override.version + ".remoteEntry.js"
    //     : baseUrl.value + "/remoteEntry.js";
    console.log(src, override);

    js.src = src;

    js.setAttribute("data-webpack", remoteName.replace("-", "_"));
    fjs.parentNode.insertBefore(js, fjs);
  });
  if (!window.pendingRemote) {
    window.pendingRemote = {};
  }

    var remoteAndVersion = [remoteName,metadata.version]
    window.pendingRemote[remoteAndVersion[0] + "_" + remoteAndVersion[1]] =
      promise;

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
  .then(function(res){
    return res.json()
  })
  .then(function(data){
  var name = data.name + "_" + data.version;
  var filename = data.version + '.remoteEntry.js';
  var url = new URL(filename, data.remoteURL)
  
  console.log("${dashboardURL}&currentHost=${currentHost}&remoteName=${remoteName}", {
  data,
  name,
  filename
  });
  new Promise(function (resolve, reject) {
          if (typeof window[name] !== 'undefined') return resolve();
          __webpack_require__.l(
            url.href,
            function (event) {
              if (typeof window[name] !== 'undefined') return resolve();
              var errorType = event && (event.type === 'load' ? 'missing' : event.type);
              var realSrc = event && event.target && event.target.src;
              __webpack_error__.message =
                'Loading script failed.\\n(' + errorType + ': ' + realSrc + ')';
              __webpack_error__.name = 'ScriptExternalLoadError';
              __webpack_error__.type = errorType;
              __webpack_error__.request = realSrc;
              reject(__webpack_error__);
            },
            name,
          );
        }).then(function () {
       resolve(window[name])
        }).catch(reject)
    })
  })`;
};
