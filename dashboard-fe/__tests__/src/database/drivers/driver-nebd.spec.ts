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
      let updateData = null;
      class MockDatastore {
        constructor() {}
        loadDatabase() {}
        find(q, fcb) {
          if (q.version === "2.0.0") {
            fcb(null, [
              {
                applicationId: "app1",
                version: "2.0.0",
                type: "development",
                latest: true,
                remotes: [],
                modules: [],
              },
            ]);
          } else if (q.version === "1.1.0") {
            fcb(null, [
              {
                applicationId: "app1",
                version: "1.1.0",
                type: "development",
                latest: true,
                remotes: [],
                modules: [],
              },
            ]);
          } else if (!q.version) {
            fcb(null, [
              {
                applicationId: "app1",
                version: "1.0.0",
                type: "development",
                latest: false,
                remotes: [],
                modules: [],
              },
              {
                applicationId: "app1",
                version: "1.1.0",
                type: "development",
                latest: true,
                remotes: [],
                modules: [],
              },
            ]);
          } else {
            fcb(null, []);
          }
        }
        update(q, data, opts, ucb) {
          updateData = data["$set"];
          ucb();
        }
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
          expect(updateData.version).toEqual("1.1.0");
          expect(updateData.latest).toEqual(false);
          cb();
        });
    });
  });
});
