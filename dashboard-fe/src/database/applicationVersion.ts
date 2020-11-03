import Joi from "@hapi/joi";

import Module, { schema as moduleSchema } from "./module";
import Remote, { schema as remoteSchema } from "./remote";
import Override, { schema as overrideSchema } from "./override";
import Consume, { schema as consumeSchema } from "./consume";
import Dependency, { schema as dependencySchema } from "./dependency";
import { privateConfig } from "../config";
export const schema = Joi.object({
  applicationId: Joi.string().required(),
  environment: Joi.string().required(),
  // @ts-ignore
  version: privateConfig.VERSION_MANAGER
    ? Joi.string().required()
    : Joi.string().allow("", null),
  posted: Joi.date().required(),
  latest: Joi.boolean().required(),
  remote: Joi.string().required(),
  remotes: Joi.array().items(remoteSchema).required(),
  overrides: Joi.array().items(overrideSchema).required(),
  modules: Joi.array().items(moduleSchema).required(),
  consumes: Joi.array().items(consumeSchema).required(),
  dependencies: Joi.array().items(dependencySchema).required(),
});

export default class ApplicationVersion {
  applicationId: string;
  environment: string;
  remote: string;
  version: string;
  posted: Date;
  latest: Boolean;
  remotes: Remote[];
  overrides: Override[];
  modules: Module[];
  consumes: Consume[];
  dependencies: Dependency[];
}
