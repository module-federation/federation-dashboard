import Joi from "@hapi/joi";

export const schema = Joi.object({
  id: Joi.string().required(),
  email: Joi.string().required(),
  name: Joi.string().required(),
  groups: Joi.array()
    .items(Joi.string().required())
    .required(),
  defaultGroup: Joi.string().required()
});

export default class User {
  id: string = "";
  email: string = "";
  name: string = "";
  groups: string[] = [];
  defaultGroup: string;
}
