import { observable, action, autorun } from "mobx";
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

class Store {
  client = client;
  @observable selectedApplication = null;
  @observable detailDrawerOpen = false;

  @observable isAuthorized = false;
  @observable authUser = null;
  @observable user = null;

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
  });
}

export default store;
