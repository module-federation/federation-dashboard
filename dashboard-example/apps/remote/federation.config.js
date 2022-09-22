const {
  withNativeFederation,
  shareAll,
} = require("@softarc/native-federation/build");

module.exports = withNativeFederation({
  name: "remote",

  exposes: {
    "./module": "apps/remote/src/app/is-long-weekend.ts",
    "./react-remote": "apps/remote/src/app/react-app.tsx",
  },

  shared: {
    ...shareAll({
      singleton: true,
      strictVersion: true,
      requiredVersion: "auto",
      includeSecondaries: false,
    }),
  },

  skip: ["@softarc/native-federation-runtime"],
});
