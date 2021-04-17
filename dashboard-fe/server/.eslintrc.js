"use strict";

module.exports = {
  extends: "../../../.eslintrc.js",
  env: {
    node: true,
  },
  parserOptions: {
    sourceType: "script",
    impliedStrict: false,
  },
  rules: {
    strict: ["error", "global"],
  },
};
