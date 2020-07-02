import dbDriver from "../database/drivers";

export default class VersionManager {
  static async publishVersion(group, application, version) {
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
          ({ version: v, type: t }) =>
            v !== version.version && t == version.type
        )
        .map((appVersion) =>
          dbDriver.applicationVersion_update({
            ...appVersion,
            latest: false,
          })
        )
    );

    return app;
  }

  static async setRemoteVersion(group, application, remote, version) {
    const app = await dbDriver.applicationVersion_find(
      application,
      "production",
      version
    );
    const overridesWithoutRemote = app.overrides.filter(
      ({ name }) => name !== remote
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

    await dbDriver.applicationVersion_update(app);

    return app;
  }
}
