import Joi from "@hapi/joi";

import Metadata, { schema as metadataSchema } from "./metadata";
import TrackedURLVariant, {
  schema as variantSchema
} from "./trackedURLVariant";

export const schema = Joi.object({
  url: Joi.string().required(),
  metadata: Joi.array().items(metadataSchema),
  variants: Joi.array().items(variantSchema)
});

export default class TrackedURL {
  url: string;
  metadata?: Metadata[];
  variants?: TrackedURLVariant[];
}
