import Datastore from "nedb";
import path from "path";
import Joi from "@hapi/joi";

import Application, { schema as applicationSchema } from "../application";
import ApplicationVersion, {
  schema as applicationVersionSchema,
} from "../applicationVersion";
import MetricValue, { schema as metricValueSchema } from "../metricValue";
import Group, { schema as groupSchema } from "../group";
import User, { schema as userSchema } from "../user";

import Driver from "./driver";

const dir = process.env.DATA_DIR || path.join(process.cwd(), "./.fm-dashboard");

const applications = new Datastore({
  filename: path.join(dir, "/application.db"),
});
applications.loadDatabase();
const applicationVersions = new Datastore({
  filename: path.join(dir, "/applicationVersions.db"),
});
applicationVersions.loadDatabase();
const metrics = new Datastore({
  filename: path.join(dir, "/metrics.db"),
});
metrics.loadDatabase();
const groups = new Datastore({
  filename: path.join(dir, "/groups.db"),
});
groups.loadDatabase();
const users = new Datastore({
  filename: path.join(dir, "/users.db"),
});
users.loadDatabase();

class TableDriver<T> {
  private store: Datastore;

  constructor(store: Datastore) {
    this.store = store;
  }

  async find(id: String): Promise<T | null> {
    return new Promise((resolve) => {
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
    return new Promise((resolve) => {
      this.store.find(query, (_, docs) => {
        resolve(docs.map(({ _id, ...data }) => ({ ...data })) || []);
      });
    });
  }

  async insert(data: T): Promise<null> {
    return new Promise(async (resolve) => {
      this.store.insert(data, () => resolve());
    });
  }

  async update(query: any, data: T): Promise<null> {
    return new Promise(async (resolve) => {
      this.store.find(query, (_, docs) => {
        if (docs.length > 0) {
          this.store.update(query, { $set: data }, {}, () => resolve());
        } else {
          this.store.insert(data, () => resolve());
        }
      });
    });
  }

  async delete(id: String): Promise<null> {
    return new Promise((resolve) => {
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
        metadata: [],
      });
    }

    DriverNedb.isSetup = true;
  }

  async application_find(id: String): Promise<Application | null> {
    return this.applicationTable.find(id);
  }
  async application_findInGroups(
    groups: Array<String>
  ): Promise<Array<Application> | null> {
    return this.applicationTable.search({ group: { $in: groups } });
  }
  async application_getMetrics(id: String): Promise<Array<MetricValue> | null> {
    return this.metricsTable.search({
      type: "application",
      id,
    });
  }
  async application_addMetrics(
    id: String,
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
    return this.applicationTable.update({ id: application.id }, application);
  }
  async application_delete(id: String): Promise<null> {
    return this.applicationTable.delete(id);
  }

  async applicationVersion_find(
    applicationId: String,
    type: String,
    version: String
  ): Promise<ApplicationVersion | null> {
    const versions = await this.applicationVersionsTable.search({
      applicationId,
      type,
      version,
    });
    return versions.length > 0 ? versions[0] : null;
  }

  async applicationVersion_findAll(
    applicationId: String,
    type: String,
    version: String
  ): Promise<Array<ApplicationVersion>> {
    const q = {
      applicationId,
    };
    if (type) {
      q.type = type;
    }
    if (version) {
      q.version = version;
    }
    const versions = await this.applicationVersionsTable.search(q);
    return versions.length > 0 ? versions : [];
  }

  async applicationVersion_findLatest(
    applicationId: String,
    type: String
  ): Promise<Array<ApplicationVersion>> {
    return this.applicationVersionsTable.search({
      applicationId,
      type,
      latest: true,
    });
  }

  async applicationVersion_update(version: ApplicationVersion): Promise<null> {
    Joi.assert(version, applicationVersionSchema);
    await this.applicationVersionsTable.update(
      {
        applicationId: version.applicationId,
        type: version.type,
        version: version.version,
      },
      version
    );
  }

  async applicationVersion_delete(
    applicationId: String,
    type: String,
    version: String
  ): Promise<null> {
    const id = [applicationId, type, version].join(":");
    return this.applicationVersionsTable.delete(id);
  }

  async group_find(id: String): Promise<Group> {
    return this.groupsTable.find(id);
  }
  async group_findByName(name: String): Promise<Group> {
    return this.groupsTable
      .search({ name })
      .then((data) => (data && data.length ? data[0] : null));
  }

  async group_findAll(): Promise<Array<Group>> {
    return this.groupsTable.search({});
  }

  async group_update(group: Group): Promise<Array<Group>> {
    Joi.assert(group, groupSchema);
    return this.groupsTable.update({ id: group.id }, group);
  }

  async group_delete(id: String): Promise<Array<Group>> {
    return this.groupsTable.delete(id);
  }

  async user_find(id: String): Promise<User> {
    return this.usersTable.find(id);
  }
  async user_findByEmail(email: String): Promise<User> {
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
  async user_delete(id: String): Promise<Array<User>> {
    return this.usersTable.delete(id);
  }
}
