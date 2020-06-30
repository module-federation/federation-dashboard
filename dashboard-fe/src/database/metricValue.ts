import Joi from "@hapi/joi";

export const schema = Joi.object({
  type: Joi.string().required(),
  id: Joi.string().required(),
  name: Joi.string().required(),
  date: Joi.date().required(),
  value: Joi.string().required(),
});

export default class MetricValue {
  type: String;
  id: String;
  name: String;
  date: Date;
  value: Number;
}
