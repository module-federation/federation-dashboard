import Joi from "@hapi/joi";

export const schema = Joi.object({
  name: Joi.string(),
  value: Joi.string(),
});

export default class Metadata {
  name: string = "";
  value: string = "";
}
