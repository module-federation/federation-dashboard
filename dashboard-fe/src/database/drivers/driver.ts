import Application from "../application";
import ApplicationVersion from "../applicationVersion";
import MetricValue from "../metricValue";

export default abstract class Driver {
  abstract async application_find(id: String): Promise<Application | null>;
  abstract async application_update(application: Application): Promise<null>;
  abstract async application_delete(id: String): Promise<null>;
  abstract async application_getMetrics(
    id: String
  ): Promise<Array<MetricValue> | null>;
  abstract async application_addMetrics(
    id: String,
    metric: MetricValue
  ): Promise<Array<MetricValue> | null>;

  abstract async applicationVersion_find(
    applicationId: String,
    type: String,
    version: String
  ): Promise<ApplicationVersion | null>;
  abstract async applicationVersion_findLatest(
    applicationId: String,
    type: String
  ): Promise<ApplicationVersion | null>;
  abstract async applicationVersion_update(
    version: ApplicationVersion
  ): Promise<null>;
  abstract async applicationVersion_delete(
    applicationId: String,
    type: String,
    version: String
  ): Promise<null>;
}
