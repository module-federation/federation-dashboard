import Metadata, { schema as metadataSchema } from "./metadata";

import Joi from "@hapi/joi";

export const schema = Joi.object({
  name: Joi.string().required(),
  application: Joi.array()
    .items(Joi.string().required())
    .required(),
  metadata: Joi.array()
    .items(metadataSchema)
    .required(),
});

export default class Group {
  name: String;
  application: Array<String>;
  metadata: Array<Metadata>;
}
