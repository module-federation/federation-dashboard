import dbDriver from "../database/drivers";

export default class VersionManager {
  static async  publishVersion(group: any, application: any, version: any) {
    await dbDriver.setup();

    // TODO: Pass in the environment
    const app = await dbDriver.applicationVersion_find(
      application,
      "production",
      version
    );
    app.latest = true;

    await dbDriver.applicationVersion_update(app);

    // Demote any previous versions to not latest
    const found = await dbDriver.applicationVersion_findLatest(
      application,
      "production"
    );
    await Promise.all(
      found
        .filter(
          ({ version: v, environment: t }) =>
            v !== app.version && t == app.environment
        )
        .map((appVersion: any) =>
          dbDriver.applicationVersion_update({
            ...appVersion,
            latest: false,
          })
        )
    );

    return app;
  }

  static async setRemoteVersion(
    group: any,
    application: any,
    remote: any,
    version: any
  ) {
    const app = await dbDriver.application_find(application);
    const overridesWithoutRemote = app.overrides.filter(
      ({ name }: any) => name !== remote
    );
    if (version) {
      app.overrides = overridesWithoutRemote;
      app.overrides.push({
        name: remote,
        version,
      });
    } else {
      app.overrides = overridesWithoutRemote;
    }

    await dbDriver.application_update(app);

    return app;
  }
}
