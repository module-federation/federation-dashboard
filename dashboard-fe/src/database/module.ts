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
  id: String;
  name: String;
  applicationID: String;
  requires: Array<String>;
  file: String;
  tags: Array<string>;
  metadata: Array<Metadata>;
}
