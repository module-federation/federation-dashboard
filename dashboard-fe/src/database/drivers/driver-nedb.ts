import Datastore from "nedb";
import path from "path";
import Joi from "@hapi/joi";
import fs from "fs";
import bus from "../../event-bus";

import Application, { schema as applicationSchema } from "../application";
import ApplicationVersion, {
  schema as applicationVersionSchema
} from "../applicationVersion";
import MetricValue, { schema as metricValueSchema } from "../metricValue";
import Group, { schema as groupSchema } from "../group";
import User, { schema as userSchema } from "../user";
import SiteSettings, { schema as siteSettingsSchema } from "../siteSettings";

import Driver from "./driver";

const dir = process.env.DATA_DIR || path.join(process.cwd(), "./.fm-dashboard");

const createDatastore = (name) => {
  const ds = new Datastore({
    filename: path.join(dir, `/${name}.db`),
  });
  ds.loadDatabase();
  ds.persistence.setAutocompactionInterval(60 * 1000);
  return ds;
};

const applications = createDatastore("application");
const applicationVersions = createDatastore("applicationVersions");
const metrics = createDatastore("metrics");
const groups = createDatastore("groups.db");
const users = createDatastore("users.db");

const siteSettingsPath = path.join(dir, "/siteSettings.json");

class TableDriver<T> {
  private store: Datastore;

  constructor(store: Datastore) {
    this.store = store;
  }

  async find(id: string): Promise<T | null> {
    return new Promise(resolve => {
      this.store.find({ id }, (_, docs) => {
        if (docs.length > 0) {
          delete docs[0]._id;
          resolve(docs[0]);
        } else {
          resolve(null);
        }
      });
    });
  }

  async search(query: any): Promise<Array<T> | null> {
    return new Promise(resolve => {
      this.store.find(query, (_, docs) => {
        resolve(docs.map(({ _id, ...data }) => ({ ...data })) || []);
      });
    });
  }

  async insert(data: T): Promise<null> {
    return new Promise(async resolve => {
      this.store.insert(data, () => resolve());
    });
  }

  async update(query: any, data: T): Promise<null> {
    return new Promise(async resolve => {
      this.store.find(query, (_, docs) => {
        if (docs.length > 0) {
          this.store.update(query, { $set: data }, {}, () => resolve());
        } else {
          this.store.insert(data, () => resolve());
        }
      });
    });
  }

  async delete(id: string): Promise<null> {
    return new Promise(resolve => {
      this.store.remove({ id }, {}, () => resolve());
    });
  }
}

export default class DriverNedb implements Driver {
  private applicationTable: TableDriver<Application> = new TableDriver<
    Application
  >(applications);
  private applicationVersionsTable: TableDriver<
    ApplicationVersion
  > = new TableDriver<ApplicationVersion>(applicationVersions);
  private metricsTable: TableDriver<MetricValue> = new TableDriver<MetricValue>(
    metrics
  );
  private groupsTable: TableDriver<Group> = new TableDriver<Group>(groups);
  private usersTable: TableDriver<User> = new TableDriver<User>(users);
  private static isSetup = false;
  private static isInSetup = false;

  constructor() {}

  async setup() {
    if (DriverNedb.isSetup || DriverNedb.isInSetup) {
      return false;
    }
    DriverNedb.isInSetup = true;

    const defaultGroup = await this.group_find("default");
    if (!defaultGroup) {
      await this.group_update({
        id: "default",
        name: "default",
        metadata: []
      });
    }

    DriverNedb.isSetup = true;
  }

  async application_find(id: string): Promise<Application | null> {
    return this.applicationTable.find(id);
  }
  async application_findInGroups(
    groups: string[]
  ): Promise<Array<Application> | null> {
    return this.applicationTable.search({ group: { $in: groups } });
  }
  async application_getMetrics(id: string): Promise<Array<MetricValue> | null> {
    return this.metricsTable.search({
      type: "application",
      id
    });
  }

  async application_addMetrics(
    id: string,
    metric: MetricValue
  ): Promise<Array<MetricValue> | null> {
    Joi.assert(metric, metricValueSchema);
    return this.metricsTable.insert({
      type: "application",
      id,
      ...metric
    });
  }
  async application_update(application: Application): Promise<null> {
    Joi.assert(application, applicationSchema);
    bus.publish("updateApplication", application);
    return this.applicationTable.update({ id: application.id }, application);
  }
  async application_delete(id: string): Promise<null> {
    return this.applicationTable.delete(id);
  }

  async applicationVersion_find(
    applicationId: string,
    environment: string,
    version: string
  ): Promise<ApplicationVersion | null> {
    const versions = await this.applicationVersionsTable.search({
      applicationId,
      environment,
      version
    });
    return versions.length > 0 ? versions[0] : null;
  }

  async applicationVersion_findAll(
    applicationId: string,
    environment: string,
    version?: string
  ): Promise<Array<ApplicationVersion>> {
    const q: any = {
      applicationId
    };
    if (environment) {
      q.environment = environment;
    }
    if (version) {
      q.version = version;
    }
    const versions = await this.applicationVersionsTable.search(q);
    return versions.length > 0 ? versions : [];
  }

  async applicationVersion_findLatest(
    applicationId: string,
    environment: string
  ): Promise<Array<ApplicationVersion>> {
    return this.applicationVersionsTable.search({
      applicationId,
      environment,
      latest: true
    });
  }

  async applicationVersion_update(version: ApplicationVersion): Promise<any> {
    Joi.assert(version, applicationVersionSchema);
    await this.applicationVersionsTable.update(
      {
        applicationId: version.applicationId,
        environment: version.environment,
        version: version.version
      },
      version
    );
    bus.publish("updateApplicationVersion", version);
  }

  async applicationVersion_delete(
    applicationId: string,
    environment: string,
    version: string
  ): Promise<null> {
    const id = [applicationId, environment, version].join(":");
    return this.applicationVersionsTable.delete(id);
  }
  async group_getMetrics(id: string): Promise<Array<MetricValue> | null> {
    return this.metricsTable.search({
      type: "group",
      id
    });
  }

  // @ts-ignore
  async group_updateMetric(
    application: Application,
    group: Group
  ): Promise<Array<Group>> {
    bus.publish("groupMetricUpdated", group);
    // @ts-ignore
    return this.metricsTable.update({ id: group.id }, group);
  }

  async group_find(id: string): Promise<Group> {
    return this.groupsTable.find(id);
  }
  async group_findByName(name: string): Promise<Group> {
    return this.groupsTable
      .search({ name })
      .then(data => (data && data.length ? data[0] : null));
  }

  async group_findAll(): Promise<Array<Group>> {
    return this.groupsTable.search({});
  }

  async group_update(group: Group): Promise<Array<Group>> {
    Joi.assert(group, groupSchema);
    bus.publish("groupUpdated", group);
    return this.groupsTable.update({ id: group.id }, group);
  }

  async group_delete(id: string): Promise<Array<Group>> {
    return this.groupsTable.delete(id);
  }

  async user_find(id: string): Promise<User> {
    return this.usersTable.find(id);
  }
  async user_findByEmail(email: string): Promise<User> {
    const found = await this.usersTable.search({ email });
    return Promise.resolve(found.length > 0 ? found[0] : null);
  }
  async user_findAll(): Promise<Array<User>> {
    return this.usersTable.search({});
  }
  async user_update(user: User): Promise<Array<User>> {
    Joi.assert(user, userSchema);
    return this.usersTable.update({ id: user.id }, user);
  }
  async user_delete(id: string): Promise<Array<User>> {
    return this.usersTable.delete(id);
  }

  async siteSettings_get(): Promise<SiteSettings> {
    let settings = {
      webhooks: []
    };
    if (fs.existsSync(siteSettingsPath)) {
      try {
        settings = JSON.parse(fs.readFileSync(siteSettingsPath).toString());
      } catch (e) {
        console.error(e);
      }
    } else {
      fs.writeFileSync(siteSettingsPath, JSON.stringify(settings));
    }
    return Promise.resolve(settings);
  }
  async siteSettings_update(settings: SiteSettings): Promise<SiteSettings> {
    Joi.assert(settings, siteSettingsSchema);
    fs.writeFileSync(siteSettingsPath, JSON.stringify(settings));
    return Promise.resolve(settings);
  }
}
