import Group from "./group";

export default class User {
  email: String = "";
  name: String = "";
  groups: Array<Group> = [];
  defaultGroup: String;
}
