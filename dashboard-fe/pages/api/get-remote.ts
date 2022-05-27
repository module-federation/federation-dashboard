import { MongoClient } from "mongodb";
import { createHash, randomUUID } from "crypto";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  res.setHeader("Cache-Control", "no-cache");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  const { currentHost, remoteName, token } = req.query;
  const id = randomUUID();
  const log = (msg) =>
    console.log(`REQ(${id}): ${currentHost}; ${remoteName}; ${msg}`);

  const remoteFindLabel = "find-remote-" + id;
  console.time(remoteFindLabel);

  try {
    const client = new MongoClient(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await client.connect();

    log("Connected to mongo db");

    const mainDb = client.db("fmdashboard");
    const siteSettings = mainDb.collection("siteSettings");

    const foundSettings = await siteSettings.findOne({
      tokens: { key: "readOnlyToken", value: token },
    });

    if (!foundSettings) {
      log("User key not found");
      res.status(401).end();
      return;
    }

    const userDbId = createHash("md5").update(foundSettings.id).digest("hex");

    const userDb = client.db(userDbId);

    if (!userDb) {
      log("User db not found");
      res.status(404).end();
      return;
    }

    const appVersionCollection = userDb.collection("applicationVersions");
    const hostVersion = await appVersionCollection.findOne({
      applicationId: currentHost,
      "consumes.applicationID": remoteName,
    });

    if (!hostVersion) {
      log("host not found");
      res.status(404).end();
      return;
    }

    const app = await appVersionCollection.findOne({
      applicationId: remoteName,
      latest: true,
    });

    if (!app) {
      log("remote version not found");
      res.status(404).end();
      return;
    }

    const name = app.applicationId;
    const version = app.version;
    const remoteURL = app.metadata.find(
      ({ name }) => name === "baseUrl"
    )?.value;

    if (!remoteURL) {
      log("remote url not found");
      res.status(404).end();
      return;
    }

    res.json({ name, version, remoteURL });
    console.timeEnd(remoteFindLabel);
  } catch (err) {
    res.status(500).json(err);
  }
}
