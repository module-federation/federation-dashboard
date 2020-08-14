import Metadata, { schema as metadataSchema } from "./metadata";

import Joi from "@hapi/joi";

import GroupSettings, { schema as groupSettingsSchema } from "./groupSettings";

export const schema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required(),
  metadata: Joi.array().items(metadataSchema).required(),
  settings: groupSettingsSchema.required(),
});

export default class Group {
  id: string;
  name: string;
  metadata: Metadata[];
  settings?: GroupSettings;
}
