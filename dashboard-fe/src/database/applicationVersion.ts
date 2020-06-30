import Application from "./application";

import Module from "./module";
import Remote from "./remote";

export default class ApplicationVersion {
  applicationId: String;
  type: String;
  version: String;
  latest: Boolean;
  remotes: Array<Remote>;
  modules: Array<Module>;
}
