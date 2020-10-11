import fs from "fs";
import { init } from "../../lighthouse/lib";
import deepmerge from "deepmerge";
import Promise from "bluebird";
const alreadyRunning = {};

export default async (req, res) => {
  res.statusCode = 200;
  if (!req.body) {
    res.json({ message: "All Good" });
    return;
  }
  const sourceData = JSON.parse(req.body);

  Promise.map(
    sourceData,
    async ({ name, url, new: isNew }) => {
      if (!isNew) {
        return;
      }
      if (!sourceData.name) {
        fs.writeFileSync("public/urls.json", req.body || "[]");
      }
      return init(url, name || "Initial Test").then(() => {
        const wr = JSON.stringify(
          sourceData.map(x => {
            if (x.url === url) {
              x.new = false;
            }
            return x;
          })
        );
        if (!sourceData.name) {
          fs.writeFileSync("public/urls.json", wr);
        }
      });
    },
    { concurrency: 1 }
  );

  res.json({ message: "All Good" });
};
