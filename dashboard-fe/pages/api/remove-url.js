import fs from "fs";

export default async (req, res) => {
  res.statusCode = 200;
  if (!req.body) {
    res.json({ message: "All Good" });
    return;
  }
  let sourceData = JSON.parse(req.body);

  const prev = JSON.parse(fs.readFileSync("public/urls.json", "utf8"));
  const removedUrls = Object.values(prev)
    .filter((preUrl) => {
      if (
        preUrl.name === sourceData[0].name &&
        preUrl.url === sourceData[0].url
      ) {
        return false;
      }
      return true;
    })
    .reduce((acc, item) => {
      acc[`${item.url}-${item.name}`] = item;
      return acc;
    }, {});

  fs.writeFileSync("public/urls.json", JSON.stringify(removedUrls || {}));

  const urlObj = new URL(sourceData[0].url);
  let dirName = urlObj.host.replace("www.", "");
  if (urlObj.pathname !== "/") {
    dirName = dirName + urlObj.pathname.replace(/\//g, "_");
  }
  dirName = "public/reports/" + dirName + "/scatter.json";

  const scatterData = JSON.parse(fs.readFileSync(dirName, "utf8"));
  delete scatterData[sourceData[0].name];
  fs.writeFileSync(dirName, JSON.stringify(scatterData || {}));

  res.json({ message: "All Good" });
};
