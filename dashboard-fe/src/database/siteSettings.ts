import Joi from "@hapi/joi";

export enum EventType {
  "updateApplication",
  "deleteApplication",
  "updateApplicationVersion",
  "deleteApplicationVersion",
  "updateTrackedURLS",
}

export const webhookSchema = Joi.object({
  event: Joi.any()
    .valid(
      "updateApplication",
      "deleteApplication",
      "updateApplicationVersion",
      "deleteApplicationVersion",
      "updateTrackedURLS"
    )
    .required(),
  url: Joi.string().required(),
});

export const tokenSchema = Joi.object({
  key: Joi.string().required(),
  value: Joi.string().required(),
});

export const schema = Joi.object({
  webhooks: Joi.array().items(webhookSchema).required(),
  tokens: Joi.array().items(tokenSchema).required(),
  id: Joi.string(),
});

export class Token {
  key: string;
  value: string;
}

export class Webhook {
  event: EventType;
  url: string = "";
}

export default class SiteSettings {
  webhooks: Webhook[] = [];
  tokens: Token[] = [];
  id?: string;
}
