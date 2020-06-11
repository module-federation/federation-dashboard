import Datastore from "nedb";
import path from "path";
import fetch from "node-fetch";

const dir = process.env.DATA_DIR || path.join(process.cwd(), "./.fm-dashboard");
const versionManager = process.env.VERSION_MANAGER || null;

const db = new Datastore({
  filename: path.join(dir, "/apps.db"),
});
db.loadDatabase();

export const update = (info) => {
  db.find({ id: info.id }, (_, docs) => {
    if (docs.length > 0) {
      console.log(`Updating ${info.id}`);
      db.update({ id: info.id }, { $set: info });
    } else {
      console.log(`Adding ${info.id}`);
      db.insert(info);
    }
  });
};

export const getVersionInfo = (app) => {
  if (versionManager) {
    return fetch(`${versionManager}/${app}`).then((resp) => resp.json());
  } else {
    return Promise.resolve({
      versions: [],
      latest: "",
    });
  }
};

export const publishVersion = (app, version) => {
  if (versionManager) {
    console.log(`Telling version manager to set '${app}' to '${version}'`);
    return fetch(`${versionManager}/${app}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ version }),
    }).then((resp) => resp.json());
  } else {
    return Promise.resolve({
      versions: [],
      latest: "",
    });
  }
};

export const versionManagementEnabled = () => {
  return versionManager !== null;
};

export default () =>
  new Promise((resolve) => db.find({}, (_, docs) => resolve(docs)));
