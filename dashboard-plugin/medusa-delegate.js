module.exports = ({fetchClient, currentHost, remoteName})=> new Promise((resolve, reject) => {
  fetchClient(`${process.env.dashboardUrl}&currentHost=${currentHost}&remoteName=${remoteName}`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then(function (res) {
        return res.json()
      })
      .then(function (data) {
        var name = data.name + "_" + data.version;
        var filename = data.version + '.remoteEntry.js';
        var url = new URL(filename, data.remoteURL)

        new Promise(function (resolve, reject) {
          var __webpack_error__ = new Error()
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
  })
