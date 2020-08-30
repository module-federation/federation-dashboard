import workerize from "node-inline-worker";

export default async (req, res) => {
  res.statusCode = 200;

  const safePath = req.query.report.split("/").slice(-1)[0];
  console.log("get Report", safePath);
  const getReport = workerize(async safePath => {
    const fs = __non_webpack_require__('fs');
    const path = __non_webpack_require__('path');
    function getData(fileName, type) {
      return fs.promises.readFile(fileName, { encoding: type });
    }

    return await getData(
      path.join(process.cwd(), "public/reports", safePath, "scatter.json"),
      "utf8"
    ).catch(() => "{}");
  });

  const json = await getReport(safePath);
  res.send(json);
};
