import fs from "fs";
import path from "path";

export default async (req, res) => {
  res.statusCode = 200;

  const safePath = req.query.report.split("/").slice(-1)[0];
  console.log("get Report", safePath);
  const hostname = "http://" + req.headers.host + "/";
  const url = hostname + path.join("reports", safePath, "scatter.json");
  const json = await fetch(url).then(res => res.json());
  res.send(json);
};
