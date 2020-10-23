import Joi from "@hapi/joi";
import config from "../config";
console.log("VMZA", config.VERSION_MANAGER);
export const schema = Joi.object({
  name: Joi.string().required(),
  version: config.VERSION_MANAGER
    ? Joi.string().required()
    : Joi.string().allow("", null),
});

export default class ApplicationOverride {
  name: string;
  version: string;
}
