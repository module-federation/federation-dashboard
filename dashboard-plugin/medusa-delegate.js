const {importDelegatedModule} = require('@module-federation/utilities');

module.exports = ({fetchClient, environment, currentHost, remote,token})=>new Promise((resolve, reject) => {
  let f = fetchClient || fetch;
  let env = environment || process.env.NODE_ENV;
  console.log('####medusa internals');
  console.log({
    'process.env.CURRENT_HOST': process.env.CURRENT_HOST,
    'currentHost': currentHost,
    'process.env.NODE_ENV': process.env.NODE_ENV,
    'environment': environment,
    'remote': remote,
    'token': token,
    requestURL: `https://api.medusa.codes/env/${env}/get-remote?token=${token}&remoteName=${remote}&currentHost=${currentHost || process.env.CURRENT_HOST}`,
    fetchClient: fetchClient,
  });
  console.log('#########')
  return f(`https://api.medusa.codes/env/${env}/get-remote?token=${token}&remoteName=${remote}&currentHost=${currentHost || process.env.CURRENT_HOST}`).then(res=>res.json()).then((remote) => {
    console.log('medusaResponse', remote);
  });
  //Splitting the currentRequest using "@" as the separator and assigning the values to "global" and "url"
  const [global, url] = currentRequest.split('@');
  //importing the delegated module
  importDelegatedModule({
    global,
    url,
  })
    .then(async (remote) => {
      //resolving the remote
      resolve(remote)
    })
    .catch((err) => {
      //catching the error and rejecting it
      reject(err);
    });
});

