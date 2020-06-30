import Dependency from "./dependency";

export default class Module {
  file: String;
  name: String;
  dependencies: Array<Dependency>;
}
