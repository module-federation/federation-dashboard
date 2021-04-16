import DriverNedb from "./driver-nedb";
import DriverMongoDB from "./driver-mongodb";

let driver = null;
if (process.env.MONGO_URL) {
  driver = new DriverMongoDB();
} else {
  driver = new DriverNedb();
}

export default driver;
