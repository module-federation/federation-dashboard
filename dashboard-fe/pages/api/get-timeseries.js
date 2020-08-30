import fs from "fs";
import path from "path";
import glob from "glob";
import workerize from "node-inline-worker";

export default async (req, res) => {
  res.statusCode = 200;

  const getGlobbedFiles = workerize(async safePath => {
    console.log(safePath);
    console.log('in worker')
    const glob = __non_webpack_require__("glob");
    const path = __non_webpack_require__("path");
    const fs = __non_webpack_require__("fs");
    const BPromise = __non_webpack_require__("bluebird");
    function getData(fileName, type) {
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
          console.log('files')
          resolve(files.filter(file => !file.includes("scatter.json")));
        }
      );
    });
    const globbedData = await BPromise.map(
      globbedFiles,
      async filePath => {
        console.log('async get data', filePath)
        return getData(filePath, "utf8").then(data => JSON.parse(data));
      },
      { concurrency: 3 }
    );

    return globbedData;
  });

  const safePath = req.query.report.split("/").slice(-1)[0];

  const globbedData = await getGlobbedFiles(safePath);

  res.send(globbedData);
};
