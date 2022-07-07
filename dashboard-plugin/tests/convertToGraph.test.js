const fs = require("fs");
const convertToGraph = require("../convertToGraph");
const mergeGraphs = require('../mergeGraphs')

describe("should convert Plugin data to graph", () => {
  test("should merge sidecar graphs correctly", () => {
    const host = require(`${__dirname}/mock-data/nextjs-host.json`);
    const sidecar = require(`${__dirname}/mock-data/nextjs-sidecar.json`);
    const graph1 = convertToGraph(host);
    const graph2 = convertToGraph(sidecar);
    const merged = mergeGraphs(graph1,graph2)
  })


  test("should convert raw data to graph", () => {
    const rawData = require(`${__dirname}/mock-data/base-config.json`);
    const graph = convertToGraph(rawData);

    expect(graph.consumes.length).toBe(6);
    expect(graph.dependencies.length).toBe(6);
    expect(graph.devDependencies.length).toBe(11);
    expect(graph.id).toBe("home");
    expect(graph.name).toBe("home");
    expect(graph.remote).toBe("http://localhost:3001/remoteEntry.js");
    expect(graph.modules.length).toBe(2);
    expect(graph.optionalDependencies.length).toBe(0);
    expect(graph.overrides.length).toBe(3);
  });

  test("should throw Error topLevelPackage.dependencies are not defined", () => {
    const rawData = require(`${__dirname}/mock-data/failed-dependencies.json`);

    expect(() => convertToGraph(rawData)).toThrow(
      "topLevelPackage.dependencies must be defined"
    );
  });

  test("should throw Error topLevelPackage.devDependencies are not defined", () => {
    const rawData = require(`${__dirname}/mock-data/failed-dev-dependencies.json`);

    expect(() => convertToGraph(rawData)).toThrow(
      "topLevelPackage.devDependencies must be defined"
    );
  });

  test("should throw Error topLevelPackage.optionalDependencies are not defined", () => {
    const rawData = require(`${__dirname}/mock-data/failed-optional-dependencies.json`);

    expect(() => convertToGraph(rawData)).toThrow(
      "topLevelPackage.optionalDependencies must be defined"
    );
  });

  test("should throw Error when loc is not provided", () => {
    const rawData = require(`${__dirname}/mock-data/failed-loc-case-config.json`);

    expect(() => convertToGraph(rawData)).toThrow(
      "federationRemoteEntry.origins[0].loc must be defined and have a value"
    );
  });

  test("should throw Error when modules parameter not present", () => {
    const rawData = require(`${__dirname}/mock-data/failed-modules-config.json`);

    expect(() => convertToGraph(rawData)).toThrow(
      "Modules must be defined and have length"
    );
  });

  test("should throw Error when modules identifier not defined", () => {
    const rawData = require(`${__dirname}/mock-data/failed-modules-identifier.json`);

    expect(() => convertToGraph(rawData)).toThrow(
      "module.identifier must be defined"
    );
  });

  test("should throw Error when modules reasons not defined", () => {
    const rawData = require(`${__dirname}/mock-data/failed-modules-reasons.json`);

    expect(() => convertToGraph(rawData)).toThrow(
      "module.reasons must be defined"
    );
  });

  test("should throw Error when modules issuerName not defined", () => {
    const rawData = require(`${__dirname}/mock-data/failed-module-issuer-name.json`);

    expect(() => convertToGraph(rawData)).toThrow(
      "module.issuerName must be defined"
    );
  });
});
