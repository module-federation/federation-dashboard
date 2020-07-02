import Joi from "@hapi/joi";

import Module, { schema as moduleSchema } from "./module";
import Remote, { schema as remoteSchema } from "./remote";
import Override, { schema as overrideSchema } from "./override";
import Consume, { schema as consumeSchema } from "./consume";
import Dependency, { schema as dependencySchema } from "./dependency";

export enum ApplicationVersionType {
  "development",
  "production",
}

export const schema = Joi.object({
  applicationId: Joi.string().required(),
  type: Joi.any().valid("development", "production").required(),
  version: Joi.string().required(),
  latest: Joi.boolean().required(),
  remote: Joi.string().required(),
  remotes: Joi.array().items(remoteSchema).required(),
  overrides: Joi.array().items(overrideSchema).required(),
  modules: Joi.array().items(moduleSchema).required(),
  consumes: Joi.array().items(consumeSchema).required(),
  dependencies: Joi.array().items(dependencySchema).required(),
});

export default class ApplicationVersion {
  applicationId: String;
  type: String;
  remote: String;
  version: String;
  latest: Boolean;
  remotes: Array<Remote>;
  overrides: Array<Override>;
  modules: Array<Module>;
  consumes: Array<Consume>;
  dependencies: Array<Dependency>;
}