import Joi from "@hapi/joi";

export const schema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required(),
  version: Joi.string().required(),
  applicationID: Joi.string().required(),
});

export default class ApplicationOverride {
  id: String;
  name: String;
  version: String;
  applicationID: String;
}
