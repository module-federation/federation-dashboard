import DriverMongoDB from "./driver-mongodb";

let driver = null;
if (process.env.MONGO_URL) {
  driver = new DriverMongoDB();
} else {
  const DriverNedb = require("./driver-nedb").default
  driver = new DriverNedb();
}

export default driver;
