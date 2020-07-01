import { observable, autorun } from "mobx";
import 'mobx-react-lite/batchingOptOut'
import { fetchUser } from './user';

class Store {
  @observable selectedApplication = null;
  @observable detailDrawerOpen = false;
  @observable authUser = null;
}

const store = new Store();

if (typeof window !== 'undefined') {
  autorun(async () => {
    const user = await fetchUser();
    store.authUser = user;
  });
}

export default store;
