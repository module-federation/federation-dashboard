import Joi from "@hapi/joi";

export const schema = Joi.object({
  internalName: Joi.string().required(),
  name: Joi.string().required()
});

export default class Remote {
  internalName: string;
  name: string;
}
