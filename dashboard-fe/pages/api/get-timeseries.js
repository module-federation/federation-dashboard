import fs from "fs";
import path from "path";
import glob from "glob";
import workerpool from "workerpool";
const pool = workerpool.pool({
  options: {
    minWorkers: 1,
    maxQueueSize: 5,
    timeout: 10000,
    workerType: "auto",
  },
});

export default async (req, res) => {
  const getGlobbedFiles = async (safePath) => {
    const glob = (await import(/* webpackIgnore: true */ "glob")).default;
    const path = await import(/* webpackIgnore: true */ "path");
    const fs = await import(/* webpackIgnore: true */ "fs");
    const BBPromise = await import(/* webpackIgnore: true */ "bluebird");
    const BPromise = BBPromise.default || BBPromise;
    const workerpoolP = await import(/* webpackIgnore: true */ "workerpool");
    const workerpool = workerpoolP.default || workerpoolP;
    const pool = workerpool.pool({
      options: {
        minWorkers: 2,
        maxQueueSize: 10,
        timeout: 10000,
        workerType: "auto",
      },
    });

    async function getData(fileName, type = "utf8") {
      const fs = await import(/* webpackIgnore: true */ "fs");

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
            pool.terminate();
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
