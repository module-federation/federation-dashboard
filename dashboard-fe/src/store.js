import { observable, action, autorun, computed } from "mobx";
import "mobx-react-lite/batchingOptOut";
import gql from "graphql-tag";
import ApolloClient from "apollo-boost";
import { publicConfig } from "./config";
import { fetchUser } from "./user";

const clientUrl = process.browser
  ? window.location.origin + "/api/graphql"
  : `${global.internalAddress}/api/graphql?token=${global.INTERNAL_TOKEN}`;
const defaultOptions = {
  watchQuery: {
    fetchPolicy: "no-cache",
    errorPolicy: "ignore"
  },
  query: {
    fetchPolicy: "no-cache",
    errorPolicy: "all"
  }
};
const client = new ApolloClient({
  uri: clientUrl
});

const GET_USER = gql`
  query($email: String!) {
    userByEmail(email: $email) {
      id
      email
      name
      groups
      defaultGroup
    }
  }
`;
const UPDATE_USER = gql`
  mutation($user: UserInput!) {
    updateUser(user: $user) {
      id
      email
      name
      groups
      defaultGroup
    }
  }
`;

const GET_INITIAL_DATA = gql`
  query {
    dashboard {
      versionManagementEnabled
    }
    groups {
      id
      name
    }
  }
`;

const getLocalStorage =
  typeof window === "undefined"
    ? () => undefined
    : key => global.localStorage.getItem(key);

class Store {
  client = client;
  @observable selectedApplication = null;
  @observable detailDrawerOpen = false;

  @observable versionManagementEnabled = false;
  @observable groups = [];

  @observable group = getLocalStorage("group") || "default";
  @observable environment = getLocalStorage("environment") || "development";

  // TODO: Make these as site configurable option
  environments = ["development", "production"];

  @observable isAuthorized = false;
  @observable authUser = null;
  @observable user = null;

  @computed get showVersionManagement() {
    // TODO: Make this a per-environment settable flag
    return this.versionManagementEnabled;
  }

  @action setGroup(g) {
    this.group = g;
    global.localStorage.setItem("group", this.group);
  }

  @action setEnvironment(vt) {
    this.environment = vt;
    global.localStorage.setItem("environment", this.environment);
  }

  @action setAuthUser(authUser) {
    this.authUser = authUser;
    if (this.authUser) {
      this.isAuthorized = true;
      client
        .query({
          query: GET_USER,
          variables: {
            email: this.authUser.email
          }
        })
        .then(data => {
          if (data.data.userByEmail) {
            this.user = data.data.userByEmail;
          } else {
            client
              .mutate({
                mutation: UPDATE_USER,
                variables: {
                  user: {
                    email: this.authUser.email,
                    name: this.authUser.name,
                    groups: ["default"],
                    defaultGroup: "default"
                  }
                }
              })
              .then(updateData => {
                this.user = updateData.data.updateUser;
              });
          }
        });
    } else {
      this.isAuthorized = false;
    }
  }
}

const store = new Store();

if (typeof window !== "undefined") {
  autorun(async () => {
    if (publicConfig.WITH_AUTH) {
      const user = await fetchUser();
      store.setAuthUser(user);
    }

    client
      .query({
        query: GET_INITIAL_DATA
      })
      .then(({ data: { dashboard, groups } }) => {
        store.versionManagementEnabled = dashboard.versionManagementEnabled;
        store.groups = groups;
        if (store.groups.indexOf(store.group) === -1) {
          store.setGroup("default");
        }
      });
  });
}

export default store;
