import Joi from "@hapi/joi";
import { privateConfig } from "../config";
import { IPrivateConfig } from "../private-config";

export const schema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required(),
  version: (privateConfig as IPrivateConfig).VERSION_MANAGER
    ? Joi.string().required()
    : Joi.string().allow("", null),
  location: Joi.string().required(),
  applicationID: Joi.string().required()
});

export default class Override {
  id: string;
  name: string;
  version: string;
  location: string;
  applicationID: string;
}
