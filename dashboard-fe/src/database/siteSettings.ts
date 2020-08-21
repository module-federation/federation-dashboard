import Joi from "@hapi/joi";

export enum EventType {
  "updateApplication",
  "deleteApplication",
  "updateApplicationVersion",
  "deleteApplicationVersion",
}

export const webhookSchema = Joi.object({
  event: Joi.any()
    .valid(
      "updateApplication",
      "deleteApplication",
      "updateApplicationVersion",
      "deleteApplicationVersion"
    )
    .required(),
  url: Joi.string().required(),
});

export const schema = Joi.object({
  webhooks: Joi.array().items(webhookSchema.required()).required(),
});

export class Webhook {
  event: EventType;
  url: string = "";
}

export default class SiteSettings {
  webhooks: Webhook[] = [];
}
