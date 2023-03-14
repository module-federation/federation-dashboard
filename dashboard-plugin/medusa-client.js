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
    f(
      `${apiHost}/env/${env}/get-remote?token=${token}&remoteName=${remote}&currentHost=${currentHost ||
        process.env.CURRENT_HOST}`
    )
      .then(res => res.json())
      .then(resolve)
      .catch(reject);
  });
