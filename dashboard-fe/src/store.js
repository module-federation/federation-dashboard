import { observable, action, autorun, computed } from "mobx";
import "mobx-react-lite/batchingOptOut";
import gql from "graphql-tag";
import ApolloClient from "apollo-boost";

import { fetchUser } from "./user";

const client = new ApolloClient({
  uri: "http://localhost:3000/api/graphql",
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
    : (key) => global.localStorage.getItem(key);

class Store {
  client = client;
  @observable selectedApplication = null;
  @observable detailDrawerOpen = false;

  @observable versionManagementEnabled = false;
  @observable groups = [];

  @observable group = getLocalStorage("group") || "default";
  @observable versionType = getLocalStorage("versionType") || "development";
  versionTypes = ["development", "production"];

  @observable isAuthorized = false;
  @observable authUser = null;
  @observable user = null;

  @computed get showVersionManagement() {
    return this.versionManagementEnabled && this.versionType === "production";
  }

  @action setGroup(g) {
    this.group = g;
    global.localStorage.setItem("group", this.group);
  }

  @action setVersionType(vt) {
    this.versionType = vt;
    global.localStorage.setItem("versionType", this.versionType);
  }

  @action setAuthUser(authUser) {
    this.authUser = authUser;
    if (this.authUser) {
      this.isAuthorized = true;
      client
        .query({
          query: GET_USER,
          variables: {
            email: this.authUser.email,
          },
        })
        .then((data) => {
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
                    defaultGroup: "default",
                  },
                },
              })
              .then((updateData) => {
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
    const user = await fetchUser();
    store.setAuthUser(user);

    client
      .query({
        query: GET_INITIAL_DATA,
      })
      .then(({ data: { dashboard, groups } }) => {
        store.versionManagementEnabled = dashboard.versionManagementEnabled;
        store.groups = groups;
      });
  });
}

export default store;
