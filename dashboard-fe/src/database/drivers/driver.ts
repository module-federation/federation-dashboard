import Application from "../application";
import ApplicationVersion from "../applicationVersion";
import MetricValue from "../metricValue";
import Group from "../group";
import User from "../user";
import SiteSettings from "../siteSettings";

export default abstract class Driver {
  abstract setup();

  abstract application_find(id: string): Promise<Application | null>;
  abstract application_findInGroups(
    groups: string[]
  ): Promise<Array<Application> | null>;
  abstract application_update(application: Application): Promise<null>;
  abstract application_delete(id: string): Promise<null>;
  abstract application_getMetrics(
    id: string
  ): Promise<Array<MetricValue> | null>;

  abstract async application_addMetrics(
    id: string,
    metric: MetricValue
  ): Promise<Array<MetricValue> | null>;

  abstract async applicationVersion_find(
    applicationId: string,
    environment: string,
    version: string
  ): Promise<ApplicationVersion | null>;
  abstract async applicationVersion_findAll(
    applicationId: string,
    environment: string,
    version: string
  ): Promise<Array<ApplicationVersion>>;
  abstract async applicationVersion_findLatest(
    applicationId: string,
    environment: string
  ): Promise<Array<ApplicationVersion>>;
  abstract async applicationVersion_update(
    version: ApplicationVersion
  ): Promise<null>;
  abstract async applicationVersion_delete(
    applicationId: string,
    environment: string,
    version: string
  ): Promise<null>;

  abstract async group_find(id: string): Promise<Group>;
  abstract async group_findByName(name: string): Promise<Group>;
  abstract async group_findAll(): Promise<Array<Group>>;
  abstract async group_update(group: Group): Promise<Array<Group>>;
  abstract async group_delete(id: string): Promise<Array<Group>>;
  abstract async group_getMetrics(
    id: string
  ): Promise<Array<MetricValue> | null>;

  abstract async group_updateMetric(group: Group): Promise<Array<Group> | null>;

  abstract async user_find(id: string): Promise<User>;
  abstract async user_findByEmail(email: string): Promise<User>;
  abstract async user_findAll(): Promise<Array<User>>;
  abstract async user_update(user: User): Promise<Array<User>>;
  abstract async user_delete(id: string): Promise<Array<User>>;

  abstract async siteSettings_get(): Promise<SiteSettings>;
  abstract async siteSettings_update(
    settings: SiteSettings
  ): Promise<SiteSettings>;
}
