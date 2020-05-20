const fs = require("fs");

let apps = JSON.parse(fs.readFileSync("./data/graph.json").toString());

export const update = (info) => {
  apps = [...apps.filter(({ id }) => id != info.id), info];
  fs.writeFileSync("./data/graph.json", JSON.stringify(apps, null, 2));
};

export default () => apps;
