import Joi from "@hapi/joi";
import { privateConfig } from "../config";

export const schema = Joi.object({
  name: Joi.string().required(),
  // @ts-ignore
  version: privateConfig.VERSION_MANAGER
    ? Joi.string().required()
    : Joi.string().allow("", null),
});

export default class ApplicationOverride {
  name: string;
  version: string;
}
