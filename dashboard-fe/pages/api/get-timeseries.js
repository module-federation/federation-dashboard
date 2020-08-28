import fs from "fs";
import path from "path";
import glob from "glob";

function getData(fileName, type) {
  return fs.promises.readFile(fileName, { encoding: type });
}

export default async (req, res) => {
  res.statusCode = 200;

  const safePath = req.query.report.split("/").slice(-1)[0];
  const globbedFiles = await new Promise((resolve, reject) => {
    glob(path.join("public/reports", safePath, "*.json"), {}, (er, files) => {
      if (er) {
        reject(er);
      }
      resolve(files.filter(file => !file.includes("scatter.json")));
    });
  });
  const globbedData = await Promise.all(
    globbedFiles.map(filePath => {
      return getData(filePath, "utf8").then(data => JSON.parse(data));
    })
  );

  res.send(globbedData);
};
