import Joi from "@hapi/joi";

export const schema = Joi.object({
  consumingApplicationID: Joi.string().required(),
  applicationID: Joi.string().required(),
  name: Joi.string().required(),
  usedIn: Joi.array()
    .items(
      Joi.object({
        file: Joi.string().required(),
        url: Joi.string().required(),
      })
    )
    .required(),
});

export class ConsumeUsedIn {
  file: String;
  url: String;
}

export default class Consume {
  consumingApplicationID: String;
  applicationID: String;
  name: String;
  usedIn: Array<ConsumeUsedIn>;
}
