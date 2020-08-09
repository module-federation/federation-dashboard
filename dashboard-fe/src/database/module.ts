import Joi from "@hapi/joi";
import Metadata, { schema as metadataSchema } from "./metadata";

export const schema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required(),
  applicationID: Joi.string().required(),
  requires: Joi.array().items(Joi.string()).required(),
  file: Joi.string().required(),
  tags: Joi.array().items(Joi.string()).required(),
  metadata: Joi.array().items(metadataSchema).required(),
});

export default class Module {
  id: string;
  name: string;
  applicationID: string;
  requires: string[];
  file: string;
  tags: string[];
  metadata: Metadata[];
}
