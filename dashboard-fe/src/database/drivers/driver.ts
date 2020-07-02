import Application from "../application";
import ApplicationVersion from "../applicationVersion";
import MetricValue from "../metricValue";
import Group from "../group";
import User from "../user";

export default abstract class Driver {
  abstract async setup();

  abstract async application_find(id: String): Promise<Application | null>;
  abstract async application_findInGroups(
    groups: Array<String>
  ): Promise<Array<Application> | null>;
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
  abstract async applicationVersion_findAll(
    applicationId: String,
    type: String,
    version: String
  ): Promise<Array<ApplicationVersion>>;
  abstract async applicationVersion_findLatest(
    applicationId: String,
    type: String
  ): Promise<Array<ApplicationVersion>>;
  abstract async applicationVersion_update(
    version: ApplicationVersion
  ): Promise<null>;
  abstract async applicationVersion_delete(
    applicationId: String,
    type: String,
    version: String
  ): Promise<null>;

  abstract async group_find(id: String): Promise<Group>;
  abstract async group_findByName(name: String): Promise<Group>;
  abstract async group_findAll(): Promise<Array<Group>>;
  abstract async group_update(group: Group): Promise<Array<Group>>;
  abstract async group_delete(id: String): Promise<Array<Group>>;

  abstract async user_find(id: String): Promise<User>;
  abstract async user_findByEmail(email: String): Promise<User>;
  abstract async user_findAll(): Promise<Array<User>>;
  abstract async user_update(user: User): Promise<Array<User>>;
  abstract async user_delete(id: String): Promise<Array<User>>;
}
