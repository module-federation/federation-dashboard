import Joi from "@hapi/joi";

export const schema = Joi.object({
  email: Joi.string().required(),
  name: Joi.string().required(),
  groups: Joi.array()
    .items(Joi.string().required())
    .required(),
  defaultGroup: Joi.string().required(),
});

export default class User {
  email: String = "";
  name: String = "";
  groups: Array<string> = [];
  defaultGroup: String;
}
