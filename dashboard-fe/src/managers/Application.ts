import _ from "lodash";
import driver from "../database/drivers";
import Module from "../database/module";
import Override from "../database/override";
import Consume from "../database/consume";
import Dependency from "../database/dependency";
import ApplicationVersion from "../database/applicationVersion";
import Group from "../database/group";

import "../webhooks";

const convertMetadata = (metadataObj) =>
  Object.entries(metadataObj).map(([name, value]) => ({
    name: name.toString(),
    value: value.toString(),
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
        tags: application.tags,
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
      ...(application.dependencies || []).map((dep) => ({
        ...dep,
        type: "dependency",
      })),
      ...(application.devDependencies || []).map((dep) => ({
        ...dep,
        type: "devDependency",
      })),
      ...(application.optionalDependencies || []).map((dep) => ({
        ...dep,
        type: "optionalDependency",
      })),
      ...(application.peerDependencies || []).map((dep) => ({
        ...dep,
        type: "peerDependency",
      })),
    ].map((d) => d);

    const modules = application.modules.map((module) => ({
      ...module,
      metadata: convertMetadata(module.metadata),
      tags: module.tags || [],
    }));

    console.log(`application.version = ${application.version}`);
    const version: ApplicationVersion = {
      applicationId: application.id as String,
      version: (application.version as String) || "1.0.0",
      posted: application.posted || new Date(),
      type: (application.type as String) || "development",
      latest: true,
      modules,
      consumes: application.consumes as Array<Consume>,
      overrides: application.overrides as Array<Override>,
      dependencies: dependencies as Array<Dependency>,
      remotes: [],
      remote: application.remote,
    };
    const appVer = await driver.applicationVersion_find(
      version.applicationId,
      version.type,
      version.version
    );

    if (appVer) {
      if (_.isEqual(appVer, version)) {
        console.log(
          `${version.applicationId}#${version.version}:${version.type} is unchanged`
        );
        return;
      }
    }

    await driver.applicationVersion_update(version);

    // Demote any previous versions to not latest
    const found = await driver.applicationVersion_findLatest(
      version.applicationId,
      version.type
    );
    await Promise.all(
      found
        .filter(
          ({ version: v, type: t }) =>
            v !== version.version && t == version.type
        )
        .map((appVersion) =>
          driver.applicationVersion_update({
            ...appVersion,
            latest: false,
          })
        )
    );
  }
}
