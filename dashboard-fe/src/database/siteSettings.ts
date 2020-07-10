import Joi from "@hapi/joi";

export enum URLType {
  "addApplication",
  "updateApplication",
  "deleteApplication",
  "addApplicationVersion",
  "updateApplicationVersion",
  "deleteApplicationVersion",
}

export const webhookSchema = Joi.object({
  event: Joi.any()
    .valid(
      "addApplication",
      "updateApplication",
      "deleteApplication",
      "addApplicationVersion",
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
  event: URLType;
  url: String = "";
}

export default class SiteSettings {
  webhooks: Array<Webhook> = [];
}
