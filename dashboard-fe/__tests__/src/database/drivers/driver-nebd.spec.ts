class MockDatastore {
  constructor() {}
  loadDatabase() {}
  find(q, cb) {
    cb(null, [
      {
        foo: "bar",
      },
    ]);
  }
}

jest.mock("nedb", () => {
  return MockDatastore;
});

describe("NEDB Driver Tests", () => {
  it("AppVersion: find", (cb) => {
    const DriverNedb = require("../../../../src/database/drivers/driver-nedb")
      .default;
    console.log(DriverNedb);
    const driver = new DriverNedb();
    driver.applicationVersion_find("home", "development", "1.0.0").then(() => {
      cb();
    });
  });
});
