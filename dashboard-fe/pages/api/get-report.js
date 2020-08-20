import fs from "fs";
import path from "path";
function getData(fileName, type) {
  return fs.promises.readFile(fileName, { encoding: type });
}
export default async (req, res) => {
  res.statusCode = 200;

  const safePath = req.query.report.split("/").slice(-1)[0];
  console.log("get Report", safePath);

  const json = await getData(
    path.join("public/reports", safePath, "scatter.json"),
    "utf8"
  );

  res.send(json);
};
