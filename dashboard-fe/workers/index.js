// const dbDriver = require("../src/database/drivers");
const path = require("path");

require(path.join(__dirname, "../src/database/drivers/index.ts"));
module.exports.group = async (props, callback) => {
  const { name } = props;
  await dbDriver.setup();
  if (name) {
    const found = await dbDriver.group_findByName(name);
    return found ? [found] : [];
  } else {
    callback("didnt find name " + name);
    return dbDriver.group_findAll();
  }
};
