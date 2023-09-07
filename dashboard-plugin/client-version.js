module.exports = ({
  currentHost,
  remoteName,
  dashboardURL,
  fallbackEntryURL,
  fallbackRemoteVar,
  dashboardTimeout,
}) => {
  fallbackRemoteVar = fallbackRemoteVar || remoteName;
  fallbackEntryURL = fallbackEntryURL || '';
  if (!dashboardTimeout) {
    dashboardTimeout = -1;
  }
  if (typeof dashboardTimeout !== 'number' || isNaN(dashboardTimeout)) {
    throw new Error('Invalid dashboardTimeout');
  }
  //language=JS
  return `promise new Promise((resolve, reject) => {
    var timeoutSignal;
    let timeoutId = null;
    var dashboardTimeout = ${dashboardTimeout};
    if (dashboardTimeout > 0) {
      var timeoutAbort = new AbortController();
      timeoutSignal = timeoutAbort.signal;
      timeoutId = setTimeout(function () {
        timeoutAbort.abort();
      }, dashboardTimeout);
    }
    fetch('${dashboardURL}&currentHost=${currentHost}&remoteName=${remoteName}', {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      signal: timeoutSignal,
    })
      .finally(function () {
        if (timeoutId !== null) {
          clearTimeout(timeoutId);
        }
      })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        var name = data.name + '_' + data.version;
        var filename = data.version + '.remoteEntry.js';
        var url = new URL(filename, data.remoteURL);

        new Promise(function (resolve, reject) {
          var __webpack_error__ = new Error();
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
            name
          );
        })
          .then(function () {
            resolve(window[name]);
          })
          .catch(reject);
      })
      .catch(function (error) {
        var fallbackEntryURL = '${fallbackEntryURL}';
        if (!fallbackEntryURL) return Promise.reject(error);
        var name = '${fallbackRemoteVar}';
        var url = new URL(fallbackEntryURL);

        new Promise(function (resolve, reject) {
          var __webpack_error__ = new Error();
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
            name
          );
        })
          .then(function () {
            resolve(window[name]);
          })
          .catch(reject);
      });
  });`;
};
