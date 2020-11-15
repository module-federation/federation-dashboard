import _ from "lodash";
import driver from "../database/drivers";

export default class ModuleManager {
  static async getConsumedBy(
    group: any,
    type: any,
    applicationID: any,
    name: any
  ) {
    await driver.setup();

    const applications = await driver.application_findInGroups([group]);
    const found: any = [];
    await Promise.all(
      applications.map(async ({ id: consumerId }) => {
        const versions = await driver.applicationVersion_findAll(
          consumerId,
          type,
          undefined
        );
        if (versions && versions.length > 0) {
          versions[0].consumes
            .filter(
              ({ applicationID: conApp, name: conName }) =>
                conApp === applicationID && conName === name
            )
            .forEach((consume: any) => found.push(consume));
        }
      })
    );
    return found;
  }
}
