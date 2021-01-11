import Joi from "@hapi/joi";

export enum DependencyType {
  "dependency",
  "devDependency",
  "optionalDependency",
  "peerDependency",
}

export const schema = Joi.object({
  name: Joi.string().required(),
  version: Joi.string().required(),
  type: Joi.any()
    .valid(
      "dependency",
      "devDependency",
      "optionalDependency",
      "peerDependency"
    )
    .required(),
});

export default class Dependency {
  name: string;
  version: string;
  type: DependencyType;
}
