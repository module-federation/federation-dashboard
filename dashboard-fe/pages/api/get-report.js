//import workerize from "node-inline-worker";
//import workerpool from "workerpool
const { getReport } = require("../../lighthouse/utils");
export default async (req, res) => {
  res.statusCode = 200;

  const safePath = req.query.report.split("/").slice(-1)[0];

  const json = await getReport(safePath);
  res.send(json);
};
