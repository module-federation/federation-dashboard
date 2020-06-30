import Datastore from "nedb";
import path from "path";

import Application from "../application";
import ApplicationVersion from "../applicationVersion";
import MetricValue from "../metricValue";

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

class TableDriver<T> {
  private store: Datastore;

  constructor(store: Datastore) {
    this.store = store;
  }

  async find(id: String): Promise<T | null> {
    return new Promise((resolve) => {
      this.store.find({ id }, (_, docs) => {
        if (docs.length > 0) {
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
        if (docs.length > 0) {
          resolve(docs[0]);
        } else {
          resolve(null);
        }
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

  async application_find(id: String): Promise<Application | null> {
    return this.applicationTable.find(id);
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
    return this.metricsTable.insert({
      type: "application",
      id,
      ...metric,
    });
  }
  async application_update(application: Application): Promise<null> {
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
    const id = [applicationId, type, version].join(":");
    return this.applicationVersionsTable.find(id);
  }
  async applicationVersion_findLatest(
    applicationId: String,
    type: String
  ): Promise<ApplicationVersion | null> {
    return new Promise(async (resolve) => {
      const found = await this.applicationVersionsTable.search({
        applicationId,
        type,
        latest: true,
      });
      resolve(found && found.length > 0 ? found[0] : null);
    });
  }
  async applicationVersion_update(version: ApplicationVersion): Promise<null> {
    return new Promise(async (resolve) => {
      // Insert or update this version
      await this.applicationVersionsTable.update(
        {
          applicationId: version.applicationId,
          type: version.type,
          version: version.version,
        },
        version
      );

      // If it's the latest version then un-mark latest on any other versions
      if (version.latest) {
        const found = await this.applicationVersionsTable.search({
          applicationId: version.applicationId,
          type: version.type,
        });
        await Promise.all(
          found
            .filter(({ version: v }) => v !== version.version)
            .map((appVersion) =>
              this.applicationVersionsTable.update(
                {
                  applicationId: appVersion.applicationId,
                  type: appVersion.type,
                  version: appVersion.version,
                },
                {
                  ...appVersion,
                  latest: false,
                }
              )
            )
        );
      }

      resolve();
    });
  }
  async applicationVersion_delete(
    applicationId: String,
    type: String,
    version: String
  ): Promise<null> {
    const id = [applicationId, type, version].join(":");
    return this.applicationVersionsTable.delete(id);
  }
}
