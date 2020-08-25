import Joi from "@hapi/joi";

import Metadata, { schema as metadataSchema } from "./metadata";

export const schema = Joi.object({
  url: Joi.string().required(),
  metadata: Joi.array().items(metadataSchema).required(),
});

export default class TrackedURL {
  url: string;
  metadata: Metadata[];
}
