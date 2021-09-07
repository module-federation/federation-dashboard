import path from "path";
import Joi from "@hapi/joi";
import fs from "fs";
import bus from "../../event-bus";
import { Collection, MongoClient } from "mongodb";

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

class MongoDriver<T> {
  constructor(private collection: Collection) {}

  async find(id: string): Promise<T | null> {
    return new Promise((resolve) => {
      this.collection.find({ id }).toArray((_, docs) => {
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
    return new Promise((resolve) => {
      this.collection.find(query).toArray((_, docs) => {
        resolve(docs.map(({ _id, ...data }) => ({ ...data })) || []);
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
        if (docs.length > 0) {
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

  constructor() {
    this.client = new MongoClient(mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }

  async setup() {
    if (DriverMongoDB.isSetup) {
      return false;
    }

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

      const db = this.client.db(mongoDB);

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
      this.usersTable = new MongoDriver<User>(db.collection("users"));
      this.siteSettings = new MongoDriver<SiteSettings>(
        db.collection("siteSettings")
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
    return await this.applicationTable.find(id);
  }

  async application_findInGroups(
    groups: string[]
  ): Promise<Array<Application> | null> {
    return await this.applicationTable.search({ group: { $in: groups } });
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
      version,
    });
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
      latest: true,
    });
  }

  async applicationVersion_update(version: ApplicationVersion): Promise<any> {
    Joi.assert(version, applicationVersionSchema);
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
    return this.groupsTable.find(id);
  }

  async group_findByName(name: string): Promise<Group> {
    return this.groupsTable
      .search({ name })
      .then((data) => (data && data.length ? data[0] : null));
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
