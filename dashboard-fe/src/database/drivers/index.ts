import DriverMongoDB from "./driver-mongodb";

let driver = null;
if (process.env.MONGO_URL) {
  driver = new DriverMongoDB();
} else {
  const DriverNedb = require('./driver-nedb')
  driver = new DriverNedb();
}

export default driver;
