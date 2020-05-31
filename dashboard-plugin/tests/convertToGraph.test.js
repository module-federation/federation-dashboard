const fs = require("fs");
const convertToGraph = require("../convertToGraph");
const mockDataDir = fs.readdirSync(`${__dirname}/mock-data`);

describe("should convert Plugin data to graph", () => {
  const dataListQueue = [];
  let currentData;

  beforeAll(() => {
    for (let file of mockDataDir) {
      currentData = require(`${__dirname}/mock-data/${file}`);
      dataListQueue.push(currentData);
    }
  });

  test("should convert data to graph", () => {
    const rawData = dataListQueue.shift();
    const graph = convertToGraph(rawData);

    expect(graph.consumes instanceof Array).toBe(true);
    expect(graph.dependencies instanceof Array).toBe(true);
    expect(graph.devDependencies instanceof Array).toBe(true);
    expect(typeof graph.id === "string").toBe(true);
    expect(graph.modules instanceof Array).toBe(true);
    expect(typeof graph.name === "string").toBe(true);
    expect(graph.overrides instanceof Array).toBe(true);
    expect(graph.optionalDependencies instanceof Array).toBe(true);
    expect(typeof graph.remote === "string").toBe(true);
    expect(graph).toMatchSnapshot();
  });
});
