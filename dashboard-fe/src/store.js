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

class Store {
  client = client;
  @observable selectedApplication = null;
  @observable detailDrawerOpen = false;

  @observable isAuthorized = false;
  @observable authUser = null;

  @action setAuthUser(authUser) {
    this.authUser = authUser;
    this.isAuthorized = true;
    console.log(this.authUser.email);
    client
      .query({
        query: GET_USER,
        variables: {
          email: this.authUser.email,
        },
      })
      .then((data) => {
        console.log("GET_USER");
        console.log(data.data.userByEmail);
      });
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
