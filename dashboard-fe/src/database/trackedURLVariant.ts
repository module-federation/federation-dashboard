import Joi from "@hapi/joi";

export const schema = Joi.object({
  name: Joi.string().required(),
  search: Joi.string()
    .allow("")
    .optional(),
  new: Joi.boolean()
});

export default class TrackedURLVariant {
  name: string = "";
  search: string = "";
  new: boolean = false;
}
