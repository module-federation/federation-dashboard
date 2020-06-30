import Joi from "@hapi/joi";

import Dependency, { schema as dependencySchema } from "./dependency";

export const schema = Joi.object({
  file: Joi.string().required(),
  name: Joi.string().required(),
  dependencies: Joi.array()
    .items(dependencySchema)
    .required(),
});

export default class Module {
  file: String;
  name: String;
  dependencies: Array<Dependency>;
}
