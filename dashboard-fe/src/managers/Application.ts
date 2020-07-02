import _ from "lodash";
import driver from "../database/drivers";
import Module from "../database/module";
import Override from "../database/override";
import Consume from "../database/consume";
import Dependency from "../database/dependency";
import ApplicationVersion from "../database/applicationVersion";

export default class ApplicationManager {
  static async update(application: any) {
    const app = await driver.application_find(application.id);
    if (!app) {
      driver.application_update({
        id: application.id,
        name: application.name,
        group: application.group || "default",
        metadata: [],
      });
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

    const version: ApplicationVersion = {
      applicationId: application.id as String,
      version: (application.version as String) || "1.0.0",
      type: (application.type as String) || "development",
      latest: true,
      modules: application.modules as Array<Module>,
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
