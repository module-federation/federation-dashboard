import Metadata, { schema as metadataSchema } from "./metadata";

import Joi from "@hapi/joi";

export const schema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required(),
  metadata: Joi.array()
    .items(metadataSchema)
    .required()
});

export default class Group {
  id: string;
  name: string;
  metadata: Metadata[];
}
