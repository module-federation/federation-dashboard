import Joi from "@hapi/joi";

import Metadata, { schema as metadataSchema } from "./metadata";

export const schema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required(),
  group: Joi.string().required(),
  metadata: Joi.array()
    .items(metadataSchema)
    .required(),
});

export default class Application {
  id: String;
  name: String;
  group: String;
  metadata: Array<Metadata>;
}
