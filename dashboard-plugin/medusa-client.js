module.exports = ({
  fetchClient,
  environment,
  currentHost,
  remote,
  token,
  apiHost = "https://api.medusa.codes"
}) =>
  new Promise((resolve, reject) => {
    let f = fetchClient || fetch;
    let env = environment || process.env.NODE_ENV;
    const fullQuery = `${apiHost}/env/${env}/get-remote?token=${token}&remoteName=${remote}&currentHost=${currentHost ||
    process.env.CURRENT_HOST}`
    f(
      fullQuery
    )
      .then(res => res.json())
      .then(json=>{
        if(global && global.__remote_scope__) {
          global.__remote_scope__._medusa = global.__remote_scope__._medusa || {};
          global.__remote_scope__._medusa[fullQuery] = json
        }
        resolve(json)
      })
      .catch(reject);
  });
