describe("NEDB Driver Tests", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  describe("AppVersion", () => {
    it("should find", (cb) => {
      let query = null;
      class MockDatastore {
        constructor() {}
        loadDatabase() {}
        find(q, cb) {
          query = q;
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

      const DriverNedb = require("../../../../src/database/drivers/driver-nedb")
        .default;
      const driver = new DriverNedb();
      driver
        .applicationVersion_find("home", "development", "1.0.0")
        .then((data) => {
          expect(query).toEqual({ id: "home:development:1.0.0" });
          expect(data.foo).toEqual("bar");
          cb();
        });
    });

    it("should update", (cb) => {
      class MockDatastore {
        constructor() {}
        loadDatabase() {}
        find(q, fcb) {
          fcb(null, []);
        }
        update() {}
        insert(data, icb) {
          icb();
        }
      }

      jest.mock("nedb", () => {
        return MockDatastore;
      });

      const DriverNedb = require("../../../../src/database/drivers/driver-nedb")
        .default;
      const driver = new DriverNedb();
      driver
        .applicationVersion_update({
          applicationId: "app1",
          version: "2.0.0",
          type: "development",
          latest: true,
          remotes: [],
          modules: [],
        })
        .then(() => {
          cb();
        });
    });
  });
});
