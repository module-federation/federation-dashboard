import Joi from "@hapi/joi";

export const schema = Joi.object({
  name: Joi.string().required(),
  value: Joi.string().required(),
});

export default class Metadata {
  name: String = "";
  value: String = "";
}
