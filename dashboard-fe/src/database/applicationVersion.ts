import Joi from "@hapi/joi";

import Module, { schema as moduleSchema } from "./module";
import Remote, { schema as remoteSchema } from "./remote";

export enum ApplicationVersionType {
  "development",
  "production",
}

export const schema = Joi.object({
  applicationId: Joi.string().required(),
  type: Joi.any()
    .valid("development", "production")
    .required(),
  version: Joi.string().required(),
  latest: Joi.boolean().required(),
  remotes: Joi.array()
    .items(remoteSchema)
    .required(),
  modules: Joi.array()
    .items(moduleSchema)
    .required(),
});

export default class ApplicationVersion {
  applicationId: String;
  type: String;
  version: String;
  latest: Boolean;
  remotes: Array<Remote>;
  modules: Array<Module>;
}
