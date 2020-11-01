import fs from "fs";
import auth0 from "../../src/auth0";

export default async (req, res) => {
  try {
    await auth0.handleProfile(req, res);
  } catch (error) {
    res.status(error.status || 500).end(error.message);
  }
  res.statusCode = 200;
  if (!req.body) {
    res.json({ message: "All Good" });
    return;
  }
  let [sourceData] = JSON.parse(req.body);

  const dirName = "public/reports/" + sourceData.url + "/scatter.json";

  const scatterData = JSON.parse(fs.readFileSync(dirName, "utf8"));
  delete scatterData[sourceData.name];
  fs.writeFileSync(dirName, JSON.stringify(scatterData || {}));

  res.json({ message: "All Good" });
};
