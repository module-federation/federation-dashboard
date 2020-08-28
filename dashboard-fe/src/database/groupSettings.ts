import Joi from "@hapi/joi";

import TrackedURL, { schema as trackedURLSchema } from "./trackedURL";

export const schema = Joi.object({
  trackedURLs: Joi.array()
    .items(trackedURLSchema)
    .required()
});

export default class ApplicationSettings {
  trackedURLs?: TrackedURL[];
}
