import Joi from "@hapi/joi";

export const schema = Joi.object({
  consumingApplicationID: Joi.string().required(),
  applicationID: Joi.string().required(),
  name: Joi.string().required(),
  usedIn: Joi.array()
    .items(
      Joi.object({
        file: Joi.string().required(),
        url: Joi.string().required()
      })
    )
    .required()
});

export class ConsumeUsedIn {
  file: string;
  url: string;
}

export default class Consume {
  consumingApplicationID: string;
  applicationID: string;
  name: string;
  usedIn: ConsumeUsedIn[];
}
