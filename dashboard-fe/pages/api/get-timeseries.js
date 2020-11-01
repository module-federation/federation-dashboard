import fs from "fs";
import path from "path";
import glob from "glob";
import workerpool from "workerpool";
import auth0 from "../../src/auth0";

const pool = workerpool.pool({
  options: {
    minWorkers: 1,
    maxQueueSize: 5,
    timeout: 10000,
    workerType: "auto",
  },
});

export default async (req, res) => {
  try {
    await auth0.handleProfile(req, res);
  } catch (error) {
    res.status(error.status || 500).end(error.message);
    return;
  }

  const getGlobbedFiles = async (safePath) => {
    const glob = __non_webpack_require__("glob");
    const path = __non_webpack_require__("path");
    const fs = __non_webpack_require__("fs");
    const BPromise = __non_webpack_require__("bluebird");
    const workerpool = __non_webpack_require__("workerpool");
    const pool = workerpool.pool({
      options: {
        minWorkers: 2,
        maxQueueSize: 10,
        timeout: 10000,
        workerType: "auto",
      },
    });
    function getData(fileName, type = "utf8") {
      const fs = __non_webpack_require__("fs");
      return fs.promises.readFile(fileName, { encoding: type });
    }
    const globbedFiles = await new Promise((resolve, reject) => {
      glob(
        path.join(process.cwd(), "public/reports", safePath, "*.json"),
        {},
        (er, files) => {
          if (er) {
            reject(er);
          }
          resolve(files.filter((file) => !file.includes("scatter.json")));
        }
      );
    });
    const globbedData = await BPromise.map(
      globbedFiles,
      async (filePath) => {
        const gotData = await pool
          .exec(getData, [filePath])
          .then(function (result) {
            return result;
          })
          .catch(function (err) {
            console.error(err);
          })
          .then(function (result) {
            // pool.terminate();
            return result;
          });
        try {
          return JSON.parse(gotData);
        } catch (e) {
          return null;
        }
      },
      { concurrency: 3 }
    );

    return globbedData;
  };
  const safePath = req.query.report.split("/").slice(-1)[0];

  const globbedData = await pool
    .exec(getGlobbedFiles, [safePath])
    .then(function (result) {
      return result;
    })
    .catch(function (err) {
      console.error(err);
    })
    .then(function (result) {
      // pool.terminate();
      return result;
    });

  res.statusCode = 200;
  res.json(
    globbedData.filter((lhr) => {
      if (!lhr) return false;
      return lhr.variant === "Latest";
    })
  );
};
