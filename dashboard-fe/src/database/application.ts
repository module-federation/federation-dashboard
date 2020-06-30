import Metadata from "./metadata";
import MetricValue from "./metricValue";

export default class Application {
  id: String;
  name: String;
  metadata: Array<Metadata>;
}
