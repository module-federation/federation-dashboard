module.exports = ({fetchClient, environment, currentHost, remote,token, apiHost = "https://api.medusa.codes"})=>new Promise((resolve, reject) => {
  let f = fetchClient || fetch;
  let env = environment || process.env.NODE_ENV;
  f(`${apiHost}/env/${env}/get-remote?token=${token}&remoteName=${remote}&currentHost=${currentHost || process.env.CURRENT_HOST}`).then(res=>res.json())
      .then((data) => {
        const name = `${data.name}_${data.version}`;
        const filename = `${data.version}.remoteEntry.js`;
        const url = new URL(filename, data.remoteURL);

        new Promise((resolve, reject) => {
          const __webpack_error__ = new Error();
          if (typeof window[name] !== 'undefined') return resolve( window[name] );
          __webpack_require__.l(
            url.href,
            (event) => {
              if (typeof window[name] !== 'undefined') return resolve( window[name] );
              const errorType = event && (event.type === 'load' ? 'missing' : event.type);
              const realSrc = event?.target?.src;
              __webpack_error__.message =
                `Loading script failed.\\n(${errorType}: ${realSrc})`;
              __webpack_error__.name = 'ScriptExternalLoadError';
              __webpack_error__.type = errorType;
              __webpack_error__.request = realSrc;
              reject(__webpack_error__);
            },
            name,
          );
        }).then(() => {
          resolve(window[name])
        }).catch(reject)
      })
  })
