export enum DependencyType {
  "dependency",
  "devDependency",
  "optionalDependency",
  "peerDependency",
}

export default class Dependency {
  name: String;
  version: String;
  type: DependencyType;
}
