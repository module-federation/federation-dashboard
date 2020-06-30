import Application from "./application";
import MetricValue from "./metricValue";
import Metadata from "./metadata";

export default class Group {
  name: String;
  application: Array<Application>;
  metrics: Array<MetricValue>;
  metadata: Array<Metadata>;
}
