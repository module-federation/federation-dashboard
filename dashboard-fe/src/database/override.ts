import Joi from "@hapi/joi";

export const schema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required(),
  version: Joi.string().required(),
  location: Joi.string().required(),
  applicationID: Joi.string().required()
});

export default class Override {
  id: string;
  name: string;
  version: string;
  location: string;
  applicationID: string;
}
