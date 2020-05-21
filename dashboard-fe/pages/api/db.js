import Datastore from "nedb";

const db = new Datastore({ filename: "./data/apps.db" });
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

export default () =>
  new Promise((resolve) => db.find({}, (_, docs) => resolve(docs)));
