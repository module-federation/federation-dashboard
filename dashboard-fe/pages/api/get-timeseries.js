import fs from "fs";
import path from "path";
import glob from "glob";
import workerize from "node-inline-worker";

export default async (req, res) => {
  res.statusCode = 200;

  const getGlobbedFiles = workerize(async (safePath) => {
    console.log(safePath);
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
          resolve(files.filter((file) => !file.includes("scatter.json")));
        }
      );
    });
    console.log('globbed files',globbedFiles);
    const globbedData = await BPromise.map(
      globbedFiles,
      async (filePath) => {
        return getData(filePath, "utf8").then((data) => JSON.parse(data)).catch(e=>console.log(e));
      },
      { concurrency: 3 }
    );

    return globbedData;
  });

  const safePath = req.query.report.split("/").slice(-1)[0];
console.log('getting globbed files')
  const globbedData = await getGlobbedFiles(safePath);
console.log('got blobbed files')
  res.send(globbedData);
};
