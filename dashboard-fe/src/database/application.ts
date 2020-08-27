import Joi from "@hapi/joi";

import ApplicationSettings, {
  schema as applicationSettingsSchema
} from "./applicationSettings";
import Metadata, { schema as metadataSchema } from "./metadata";
import ApplicationOverride, {
  schema as applicationOverrideSchema
} from "./applicationOverride";

export const schema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required(),
  group: Joi.string().required(),
  overrides: Joi.array()
    .items(applicationOverrideSchema)
    .required(),
  tags: Joi.array()
    .items(Joi.string())
    .required(),
  metadata: Joi.array()
    .items(metadataSchema)
    .required(),
  settings: applicationSettingsSchema
});

export default class Application {
  id: string;
  name: string;
  group: string;
  metadata: Metadata[];
  tags: string[];
  overrides: ApplicationOverride[];
  settings?: ApplicationSettings;
}
