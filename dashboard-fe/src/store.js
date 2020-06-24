import { observable } from "mobx";

class Store {
  @observable selectedApplication = null;
  @observable detailDrawerOpen = false;
}

const store = new Store();
export default store;
