import fs from "fs";
import { init } from "../../lighthouse/lib";
import deepmerge from "deepmerge";
import Promise from "bluebird";
import { cache } from "../../lighthouse/utils.js";

const generateLighthouseReport = sourceData => {
  return Promise.map(
    sourceData,
    async ({ name, url, new: isNew }) => {
      if (!isNew) {
        return;
      }
      // if (!sourceData.name) {
      //   fs.writeFileSync(
      //     "public/urls.json",
      //     JSON.stringify(sourceData) || "[]"
      //   );
      // }
      return init(url, name || "Initial Test").then(() => {
        const freshDataSource = JSON.parse(
          fs.readFileSync("public/urls.json", "utf8")
        );

        const wr = Object.values(freshDataSource).map(x => {
          if (x.url === url && x.name === name) {
            x.new = false;
          }
          return x;
        });

        const write = wr.reduce((acc, item) => {
          acc[`${item.url}-${item.name}`] = item;
          return acc;
        }, freshDataSource);
        if (!sourceData.name) {
          fs.writeFileSync("public/urls.json", JSON.stringify(write));
        }
      });
    },
    { concurrency: 1 }
  ).then(() => {
    Object.assign(cache, { running: false });
  });
};

export default async (req, res) => {
  res.statusCode = 200;
  if (!req.body) {
    res.json({ message: "All Good" });
    return;
  }
  let sourceData = JSON.parse(req.body);

  let prev = JSON.parse(fs.readFileSync("public/urls.json", "utf8"));
  sourceData.reduce((acc, item) => {
    acc[`${item.url}-${item.name}`] = item;
    return acc;
  }, prev);

  fs.writeFileSync("public/urls.json", JSON.stringify(prev || []));

  console.log("cache", cache);

  if (cache.running) {
    Object.assign(cache, { queue: true });

    fs.writeFileSync("public/urls.json", JSON.stringify(prev || []));

    console.log("added to cache");
    res.json({ message: "Queued" });
    return;
  }
  sourceData = Object.values(
    JSON.parse(fs.readFileSync("public/urls.json", "utf8"))
  );
  Object.assign(cache, { running: true });
  generateLighthouseReport(sourceData).then(() => {
    if (cache.queue) {
      Object.assign(cache, { queue: false });
      generateLighthouseReport(
        Object.values(JSON.parse(fs.readFileSync("public/urls.json", "utf8")))
      );
    }
  });

  res.json({ message: "All Good" });
};
