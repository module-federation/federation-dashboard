import Joi from "@hapi/joi";

export const schema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required(),
  applicationID: Joi.string().required(),
  requires: Joi.array().items(Joi.string()).required(),
  file: Joi.string().required(),
});

export default class Module {
  id: String;
  name: String;
  applicationID: String;
  requires: Array<String>;
  file: String;
}
