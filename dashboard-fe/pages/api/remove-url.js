import fs from "fs";

export default async (req, res) => {
  res.statusCode = 200;
  if (!req.body) {
    res.json({ message: "All Good" });
    return;
  }
  let [sourceData] = JSON.parse(req.body);


  const  dirName = "public/reports/" + sourceData.url + "/scatter.json";

  const scatterData = JSON.parse(fs.readFileSync(dirName, "utf8"));
  delete scatterData[sourceData.name];
  fs.writeFileSync(dirName, JSON.stringify(scatterData || {}));

  res.json({ message: "All Good" });
};
