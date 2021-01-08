import _ from "lodash";
import driver from "../database/drivers";
import Module from "../database/module";
import Override from "../database/override";
import Consume from "../database/consume";
import Dependency from "../database/dependency";
import ApplicationVersion from "../database/applicationVersion";
import Group from "../database/group";

import "../webhooks";

const convertMetadata = (metadataObj: any) =>
  Object.entries(metadataObj || {}).map(([name, value]) => ({
    name: name.toString(),
    value: value.toString()
  }));

export default class ApplicationManager {
  static async update(application: any) {
    await driver.setup();

    const app = await driver.application_find(application.id);
    const groupName = application.group || "default";
    if (!app) {
      console.log(`Adding app ${application.id}`);
      driver.application_update({
        id: application.id,
        name: application.name,
        group: groupName,
        overrides: [],
        metadata: convertMetadata(application.metadata),
        tags: application.tags || []
      });
    }

    const group = await driver.group_find(groupName);
    if (!group) {
      const g = new Group();
      g.id = groupName;
      g.name = groupName;
      g.metadata = [];
      await driver.group_update(g);
    }

    const dependencies = [
      ...(application.dependencies || []).map((dep: any) => ({
        ...dep,
        type: "dependency"
      })),
      ...(application.devDependencies || []).map((dep: any) => ({
        ...dep,
        type: "devDependency"
      })),
      ...(application.optionalDependencies || []).map((dep: any) => ({
        ...dep,
        type: "optionalDependency"
      })),
      ...(application.peerDependencies || []).map((dep: any) => ({
        ...dep,
        type: "peerDependency"
      }))
    ].map(d => d);

    const modules = application.modules.map((module: any) => ({
      ...module,
      metadata: convertMetadata(module.metadata),
      tags: module.tags || []
    }));

    application.version = application.version || "1.0.0";
    application.environment = application.environment || "development";

    console.log(`application.version = ${application.version}`);
    const version: ApplicationVersion = {
      applicationId: application.id as string,
      version: application.version,
      posted: application.posted || new Date(),
      environment: application.environment,
      latest: true,
      modules,
      consumes: application.consumes as Consume[],
      overrides: application.overrides as Override[],
      dependencies: dependencies as Dependency[],
      remotes: [],
      remote: application.remote
    };
    const appVer = await driver.applicationVersion_find(
      version.applicationId,
      version.environment,
      version.version
    );

    if (appVer) {
      if (_.isEqual(appVer, version)) {
        console.log(
          `${version.applicationId}#${version.version}:${version.environment} is unchanged`
        );
        return;
      }
    }

    await driver.applicationVersion_update(version);

    // Demote any previous versions to not latest
    const found = await driver.applicationVersion_findLatest(
      version.applicationId,
      version.environment
    );
    await Promise.all(
      found
        .filter(
          ({ version: v, environment: t }) =>
            v !== version.version && t == version.environment
        )
        .map((appVersion: any) =>
          driver.applicationVersion_update({
            ...appVersion,
            latest: false
          })
        )
    );
  }
}
