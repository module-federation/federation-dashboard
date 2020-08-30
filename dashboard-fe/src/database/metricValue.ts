import Joi from "@hapi/joi";

export const schema = Joi.object({
  type: Joi.string().required(),
  id: Joi.string().required(),
  name: Joi.string().required(),
  date: Joi.date().required(),
  value: Joi.number().required(),
  url: Joi.string(),
});

export default class MetricValue {
  type: string;
  id: string;
  name: string;
  date: Date;
  value: number;
  url: string;
}
