const path = require("path");
const Datastore = require("nedb");

const dir = process.env.DATA_DIR || path.join(process.cwd(), "./.fm-dashboard");

const db = new Datastore({
  filename: path.join(dir, "/apps.db"),
});
db.loadDatabase();

module.exports.update = (info) => {
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

module.exports = () =>
  new Promise((resolve) => db.find({}, (_, docs) => resolve(docs)));
