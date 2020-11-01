//import workerize from "node-inline-worker";
//import workerpool from "workerpool
const { getReport } = require("../../lighthouse/utils");

import auth0 from "../../src/auth0";

export default async function me(req, res) {
  try {
    await auth0.handleProfile(req, res);
    res.statusCode = 200;
    const safePath = req.query.report.split("/").slice(-1)[0];
    const json = await getReport(safePath);
    res.send(json);
  } catch (error) {
    res.status(error.status || 500).end(error.message);
  }
}
