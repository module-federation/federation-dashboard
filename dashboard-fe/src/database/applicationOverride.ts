import Joi from "@hapi/joi";

export const schema = Joi.object({
  name: Joi.string().required(),
  version: Joi.string().required()
});

export default class ApplicationOverride {
  name: string;
  version: string;
}
