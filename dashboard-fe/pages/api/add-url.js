import fs from "fs";
import { init } from "../../lighthouse/lib";
import Promise from "bluebird";
import { cache } from "../../lighthouse/utils";

const generateLighthouseReport = (sourceData) => {
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
        const wr = JSON.stringify(
          freshDataSource.map((x) => {
            if (x.url === url && x.name === name) {
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

  const prev = JSON.parse(fs.readFileSync("public/urls.json", "utf8"));

  const isNewVariation = !prev.find((entry) => {
    return sourceData.find(
      (otherEntry) =>
        otherEntry.name === entry.name && otherEntry.url === entry.url
    );
  });

  if (isNewVariation) {
    prev.push(...sourceData);
  } else {
    prev.forEach((item, key) => {
      sourceData.forEach((sourceItem) => {
        if (sourceItem.name === item.name && sourceItem.url === item.url) {
          prev[key] = Object.assign(item, sourceItem);
        }
      });
    });
  }

  fs.writeFileSync("public/urls.json", JSON.stringify(prev || []));
  console.log("cache", cache);

  if (cache.running) {
    Object.assign(cache, { queue: true });

    fs.writeFileSync("public/urls.json", JSON.stringify(prev || []));

    console.log("added to cache");
    res.json({ message: "Queued" });
    return;
  }
  sourceData = JSON.parse(fs.readFileSync("public/urls.json", "utf8"));
  Object.assign(cache, { running: true });
  generateLighthouseReport(sourceData).then(() => {
    if (cache.queue) {
      Object.assign(cache, { queue: false });
      generateLighthouseReport(
        JSON.parse(fs.readFileSync("public/urls.json", "utf8"))
      );
    }
  });

  res.json({ message: "All Good" });
};
