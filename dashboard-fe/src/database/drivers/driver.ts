import Application from "../application";
import ApplicationVersion from "../applicationVersion";
import MetricValue from "../metricValue";
import Group from "../group";
import User from "../user";
import SiteSettings from "../siteSettings";

export default abstract class Driver {
  abstract setup(id: string);

  abstract application_find(id: string): Promise<Application | null>;
  abstract application_findInGroups(
    groups: string[]
  ): Promise<Array<Application> | null>;
  abstract application_update(application: Application): Promise<null>;
  abstract application_delete(id: string): Promise<null>;
  abstract application_getMetrics(
    id: string
  ): Promise<Array<MetricValue> | null>;

  abstract application_addMetrics(
    id: string,
    metric: MetricValue
  ): Promise<Array<MetricValue> | null>;

  abstract applicationVersion_find(
    applicationId: string,
    environment: string,
    version: string
  ): Promise<ApplicationVersion | null>;
  abstract applicationVersion_findAll(
    applicationId: string,
    environment: string,
    version: string
  ): Promise<Array<ApplicationVersion>>;
  abstract applicationVersion_findLatest(
    applicationId: string,
    environment: string
  ): Promise<Array<ApplicationVersion>>;
  abstract applicationVersion_update(
    version: ApplicationVersion
  ): Promise<null>;
  abstract applicationVersion_delete(
    applicationId: string,
    environment: string,
    version: string
  ): Promise<null>;

  abstract group_find(id: string): Promise<Group>;
  abstract group_findByName(name: string): Promise<Group>;
  abstract group_findAll(): Promise<Array<Group>>;
  abstract group_update(group: Group): Promise<Array<Group>>;
  abstract group_delete(id: string): Promise<Array<Group>>;
  abstract group_getMetrics(id: string): Promise<Array<MetricValue> | null>;

  abstract group_updateMetric(group: Group): Promise<Array<Group> | null>;

  abstract user_find(id: string): Promise<User>;
  abstract user_findByEmail(email: string): Promise<User>;
  abstract user_findAll(): Promise<Array<User>>;
  abstract user_update(user: User): Promise<Array<User>>;
  abstract user_delete(id: string): Promise<Array<User>>;

  abstract siteSettings_get(id: string): Promise<SiteSettings>;
  abstract siteSettings_update(settings: SiteSettings): Promise<SiteSettings>;
}
