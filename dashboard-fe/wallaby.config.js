module.exports = wallaby => ({
  autoDetect: true,

  files: [
    "src/**/*.json",
    { pattern: "__tests__/**/*.test.ts", ignore: true },
    { pattern: "src/**/*.test.tsx", ignore: true },
    { pattern: "src/**/*.test.ts", ignore: true },
    { pattern: "src/.next/*.*", ignore: true },
    { pattern: "src/next.config.js", ignore: true },
    { pattern: "next.config.js", ignore: true },
    { pattern: "src/setupTests.tsx", ignore: false },
    { pattern: "jest/globals.js", ignore: true },
    "src/**/*.js*",
    "src/**/*.ts*",
    "src/**/*.tsx*",
    "src/**/*.png",
    "src/**/*.webp",
    "src/**/*.svg",
    "src/**/*.css",
    "src/**/*.scss"
  ],

  compilers: {
    "**/*.js": wallaby.compilers.babel(),
    "**/*.jsx": wallaby.compilers.babel(),
    "**/*.ts?(x)": wallaby.compilers.typeScript({
      module: "commonjs",
      jsx: "React",
      target: "esnext"
    })
  },

  tests: [
    { pattern: "node_modules/*", ignore: true, instrument: false },
    "__tests__/**/*.spec.ts*"
  ],

  env: {
    type: "node",
    runner: "node"
  }
});
