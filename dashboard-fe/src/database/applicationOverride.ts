import Joi from "@hapi/joi";
import { privateConfig } from "../config";
import { IPrivateConfig } from "../private-config";

export const schema = Joi.object({
  name: Joi.string().required(),
  version: (privateConfig as IPrivateConfig).VERSION_MANAGER
    ? Joi.string().required()
    : Joi.string().allow("", null),
});

export default class ApplicationOverride {
  name: string;
  version: string;
}
