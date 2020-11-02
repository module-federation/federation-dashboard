const federatedWorkerImport = async (containerPath, shareInit) => {
  const path = require("path");

  global.__webpack_require__ = require(path.join(
    process.cwd(),
    ".next/server/webpack-runtime.js"
  ));
  const {
    initSharing: __webpack_init_sharing__,
    shareScopes: __webpack_share_scopes__
  } = shareInit();
  // initialize any sharing, unlikely in a worker
  await __webpack_init_sharing__("default");
  // require container
  const container = require(containerPath).dashboard;
  // Initialize the container, it may provide shared modules
  await container.init(__webpack_share_scopes__.default);
  return request => {
    return container.get(request).then(factory => factory());
  };
};

module.exports = federatedWorkerImport;
