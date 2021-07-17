/* eslint-disable global-require,import/no-dynamic-require */

"use strict";

const path = require("path");

const errorPagePath = "../../.next/serverless/pages/_error.js";

const getPage = (pageName) => {
  if (!pageName) {
    return require(errorPagePath);
  }

  const hasNullBytes = pageName.indexOf("\0") !== -1;
  if (hasNullBytes) {
    return require(errorPagePath);
  }

  const absolutePath = path.join(process.cwd(), pageName);
  const isTraversal = !absolutePath.startsWith(process.cwd());
  if (isTraversal) {
    return require(errorPagePath);
  }
  return require(`../../.next/serverless/${pageName}`);
};

const createNextRouteHandler =
  ({ log }) =>
  (req, res) => {
    const pageManifest = require(`../../.next/serverless/pages-manifest.json`);

    // Assign env vars to local
    req.app.locals = req.app.locals || {};
    Object.assign(req.app.locals, { log });

    // Strip any query params off of req.url, leaving only path
    const requestPath = req.url.split("?").shift();

    // Match requested path against list of routes
    const page = getPage(pageManifest[requestPath]);

    // Conditionally render component or respond as API
    if (!page.render) {
      return page.default(req, res);
    }
    return page.render(req, res);
  };

module.exports = createNextRouteHandler;
