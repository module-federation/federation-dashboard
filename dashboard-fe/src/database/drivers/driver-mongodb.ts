import path from "path";
import Joi from "@hapi/joi";
import bus from "../../event-bus";
import { Collection, MongoClient } from "mongodb";
import sha1 from "sha1";
import LRU from "lru-cache";
import Application, { schema as applicationSchema } from "../application";
import ApplicationVersion, {
  schema as applicationVersionSchema,
} from "../applicationVersion";
import MetricValue, { schema as metricValueSchema } from "../metricValue";
import Group, { schema as groupSchema } from "../group";
import User, { schema as userSchema } from "../user";
import SiteSettings, { schema as siteSettingsSchema } from "../siteSettings";

import Driver from "./driver";

const mongoURL = process.env.MONGO_URL;
const mongoDB = process.env.MONGO_DB || "fmdashboard";

const options = {
  max: 5000,
  length: function (n, key) {
    return n * 2 + key.length;
  },
  maxAge: 1000 * 60 * 60,
};
const applicationTableCache = new LRU(options);

class MongoDriver<T> {
  constructor(private collection: Collection) {}

  async find(id: string): Promise<T | null> {
    return new Promise((resolve) => {
      this.collection.find({ id }).toArray((_, docs) => {
        if (docs && docs.length > 0) {
          delete docs[0]._id;
          resolve(docs[0]);
        } else {
          resolve(null);
        }
      });
    });
  }

  async search(query: any): Promise<Array<T> | null> {
    return new Promise((resolve) => {
      this.collection.find(query).toArray((_, docs) => {
        resolve(docs?.map(({ _id, ...data }) => ({ ...data })) || []);
      });
    });
  }

  async insert(data: T): Promise<null> {
    return new Promise(async (resolve) => {
      this.collection.insertOne(data, () => resolve(null));
    });
  }

  async update<TA>(query: any, data: TA): Promise<null> {
    return new Promise(async (resolve) => {
      this.collection.find(query).toArray((_, docs) => {
        if (docs && docs.length > 0) {
          this.collection.updateOne(query, { $set: data }, {}, () =>
            resolve(null)
          );
        } else {
          this.collection.insertOne(data, () => resolve(null));
        }
      });
    });
  }

  async delete(id: string): Promise<null> {
    return new Promise((resolve) => {
      this.collection.deleteOne({ id }, {}, () => resolve(null));
    });
  }
}

export default class DriverMongoDB implements Driver {
  private applicationTable: MongoDriver<Application> = null;
  private applicationVersionsTable: MongoDriver<ApplicationVersion> = null;
  private metricsTable: MongoDriver<MetricValue> = null;
  private groupsTable: MongoDriver<Group> = null;
  private usersTable: MongoDriver<User> = null;
  private siteSettings: MongoDriver<SiteSettings> = null;
  private connectionSetup: Promise<any>;
  private static isSetup = false;
  private static isInSetup = false;
  private client: MongoClient = null;
  private hashedNamespace: string;

  constructor() {
    this.client = new MongoClient(mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }

  async setup(namespace: string | null): Promise<any> {
    if (DriverMongoDB.isSetup) {
      return false;
    }
    let hashedNamespace = sha1(namespace);
    // mongo can only support a database name of 38 chars
    this.hashedNamespace = hashedNamespace = hashedNamespace.substring(0, 38);

    let connectionSetupResolve;
    this.connectionSetup = new Promise((resolve) => {
      connectionSetupResolve = resolve;
    });

    if (DriverMongoDB.isInSetup) {
      return this.connectionSetup;
    }

    DriverMongoDB.isInSetup = true;
    this.client.connect(async (err) => {
      if (err) {
        console.error("Error during MongoDB database startup");
        console.error(err.toString());
        process.exit(1);
      }
      console.log(`Connected successfully to server: ${mongoDB}`);
      console.log(
        `Connected successfully to server: ${hashedNamespace}(${namespace})`
      );

      const mainDB = this.client.db(mongoDB);

      const db = this.client.db(hashedNamespace);

      this.applicationTable = new MongoDriver<Application>(
        db.collection("applications")
      );
      this.applicationVersionsTable = new MongoDriver<ApplicationVersion>(
        db.collection("applicationVersions")
      );
      this.metricsTable = new MongoDriver<MetricValue>(
        db.collection("metrics")
      );
      this.groupsTable = new MongoDriver<Group>(db.collection("groups"));
      this.usersTable = new MongoDriver<User>(mainDB.collection("users"));
      this.siteSettings = new MongoDriver<SiteSettings>(
        mainDB.collection("siteSettings")
      );

      const defaultGroup = await this.group_find("default");
      if (!defaultGroup) {
        await this.group_update({
          id: "default",
          name: "default",
          metadata: [],
        });
      }

      DriverMongoDB.isSetup = true;
      connectionSetupResolve();
    });
    return this.connectionSetup;
  }

  async application_find(id: string): Promise<Application | null> {
    const cacheKey = `${this.hashedNamespace}-${id}`;
    let application = applicationTableCache.get(cacheKey);

    if (!application) {
      application = await this.applicationTable.find(id);
      applicationTableCache.set(cacheKey, application);
    }
    return application;
  }

  async application_findInGroups(
    groups: string[]
  ): Promise<Array<Application> | null> {
    const cacheKey = `${this.hashedNamespace}-${sha1(JSON.stringify(groups))}`;
    let application = applicationTableCache.get(cacheKey);
    if (!application) {
      application = await this.applicationTable.search({
        group: { $in: groups },
      });
      applicationTableCache.set(cacheKey, application);
    }
    return application;
  }

  async application_getMetrics(id: string): Promise<Array<MetricValue> | null> {
    return await this.metricsTable.search({
      type: "application",
      id,
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
      ...metric,
    });
  }

  async application_update(application: Application): Promise<null> {
    const cacheKey = `${this.hashedNamespace}-${application.id}`;

    Joi.assert(application, applicationSchema);
    bus.publish("updateApplication", application);
    applicationTableCache.del(cacheKey);
    return this.applicationTable.update({ id: application.id }, application);
  }

  async application_delete(id: string): Promise<null> {
    const cacheKey = `${this.hashedNamespace}-${id}`;
    applicationTableCache.del(cacheKey);
    return this.applicationTable.delete(id);
  }

  async applicationVersion_find(
    applicationId: string,
    environment: string,
    version: string
  ): Promise<ApplicationVersion | null> {
    const cacheKey = `${this.hashedNamespace}-${sha1(
      JSON.stringify({ applicationId, environment, version })
    )}`;
    let versions = applicationTableCache.get(cacheKey);
    if (!versions) {
      versions = await this.applicationVersionsTable.search({
        applicationId,
        environment,
        version,
      });
      // applicationTableCache.set(cacheKey, versions);
    }
    return versions.length > 0 ? versions[0] : null;
  }

  async applicationVersion_findAll(
    applicationId: string,
    environment: string,
    version?: string
  ): Promise<Array<ApplicationVersion>> {
    const q: any = {
      applicationId,
    };
    if (environment) {
      q.environment = environment;
    }
    if (version) {
      q.version = version;
    }
    const cacheKey = `${this.hashedNamespace}-${sha1(JSON.stringify(q))}`;
    let versions = applicationTableCache.get(cacheKey);
    if (!versions) {
      versions = await this.applicationVersionsTable.search(q);
      applicationTableCache.set(cacheKey, versions);
    }
    return versions.length > 0 ? versions : [];
  }

  async applicationVersion_findLatest(
    applicationId: string,
    environment: string
  ): Promise<Array<ApplicationVersion>> {
    const cacheKey = `${this.hashedNamespace}-${sha1(
      JSON.stringify({ applicationId, environment, latest: true })
    )}`;
    let latestVersion = applicationTableCache.get(cacheKey);
    if (!latestVersion) {
      latestVersion = await this.applicationVersionsTable.search({
        applicationId,
        environment,
        latest: true,
      });
      applicationTableCache.set(cacheKey, latestVersion);
    }
    return latestVersion;
  }

  async applicationVersion_update(version: ApplicationVersion): Promise<any> {
    Joi.assert(version, applicationVersionSchema);

    applicationTableCache.reset();
    await this.applicationVersionsTable.update(
      {
        applicationId: version.applicationId,
        environment: version.environment,
        version: version.version,
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
    const cacheKey = `${this.hashedNamespace}-${sha1(
      JSON.stringify({
        applicationId,
        environment,
        version,
      })
    )}`;
    applicationTableCache.del(cacheKey);
    const id = [applicationId, environment, version].join(":");
    return this.applicationVersionsTable.delete(id);
  }

  async group_getMetrics(id: string): Promise<Array<MetricValue> | null> {
    return this.metricsTable.search({
      type: "group",
      id,
    });
  }

  async group_updateMetric(group: Group): Promise<Array<Group>> {
    bus.publish("groupMetricUpdated", group);
    return this.metricsTable.update({ id: group.id }, group);
  }

  async group_find(id: string): Promise<Group> {
    const cacheKey = `${this.hashedNamespace}-${sha1(id)}`;
    let group = applicationTableCache.get(cacheKey);
    if (!group) {
      group = this.groupsTable.find(id);
      applicationTableCache.set(cacheKey, group);
    }
    return group;
  }

  async group_findByName(name: string): Promise<Group> {
    const cacheKey = `${this.hashedNamespace}-${sha1(name)}`;
    let group = applicationTableCache.get(cacheKey);
    if (!group) {
      group = await this.groupsTable
        .search({ name })
        .then((data) => (data && data.length ? data[0] : null));
      applicationTableCache.set(cacheKey, group);
    }
    return group;
  }

  async group_findAll(): Promise<Array<Group>> {
    const cacheKey = `${this.hashedNamespace}-group_findAll`;
    let group = applicationTableCache.get(cacheKey);
    if (!group) {
      group = await this.groupsTable.search({});
      applicationTableCache.set(cacheKey, group);
    }
    return group;
  }

  async group_update(group: Group): Promise<Array<Group>> {
    Joi.assert(group, groupSchema);
    bus.publish("groupUpdated", group);
    const cacheKey = `${this.hashedNamespace}-${sha1(group.id)}`;
    applicationTableCache.del(cacheKey);
    return this.groupsTable.update({ id: group.id }, group);
  }

  async group_delete(id: string): Promise<Array<Group>> {
    const cacheKey = `${this.hashedNamespace}-${sha1(id)}`;
    applicationTableCache.del(cacheKey);
    return this.groupsTable.delete(id);
  }

  async user_find(id: string): Promise<User> {
    const cacheKey = id;
    let user = applicationTableCache.get(cacheKey);
    if (!user) {
      user = await this.usersTable.find(id);
      applicationTableCache.set(cacheKey, user);
    }
    return user;
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
    applicationTableCache.del(user.id);
    return this.usersTable.update({ id: user.id }, user);
  }

  async user_delete(id: string): Promise<Array<User>> {
    applicationTableCache.del(id);
    return this.usersTable.delete(id);
  }

  async getTokens(token: string) {
    const settings = await this.siteSettings.search({});
    return settings.find(({ tokens }) => {
      return tokens?.[0]?.value === token || "noToken";
    });
  }

  // @ts-ignore
  async siteSettings_get(id): Promise<Array<SiteSettings> | any> {
    let settings = {
      webhooks: [],
      tokens: [],
      id: id ? id : "siteSettings",
    };

    if (!(await this.siteSettings.search({ id: settings.id }))) {
      await this.siteSettings.update({ id: settings.id }, settings);
    }

    const siteSetting = await this.siteSettings.search({ id: settings.id });

    return siteSetting;
  }

  async siteSettings_update(settings: SiteSettings): Promise<SiteSettings> {
    if (!settings.id) {
      settings.id = "siteSettings";
    }
    Joi.assert(settings, siteSettingsSchema);
    return this.siteSettings.update({ id: settings.id }, settings);
  }
}
