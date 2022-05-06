import React, { FC } from "react";
import { publicConfig } from "../src/config";
import { useUser } from "@auth0/nextjs-auth0";
import { UserProvider } from "@auth0/nextjs-auth0";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { ApolloProvider } from "@apollo/client";
// import store from "../src/store";
const store = {};
export default function withAuth(InnerComponent: FC) {
  if (!publicConfig.WITH_AUTH) {
    const NoAuth = (props: object) => {
      console.log("NI auth");
      return <InnerComponent {...props} user={null} />;
    };
    NoAuth.getInitialProps = InnerComponent.getInitialProps;

    return NoAuth;
  }

  const Authenticated = withPageAuthRequired((props) => {
    const { user, error, isLoading } = useUser();
    const store = require("../src/store");
    console.log(store);
    console.log("ín auth wrapper");
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>{error.message}</div>;
    return (
      <ApolloProvider client={store.client}>
        <InnerComponent {...props} user={user} />
      </ApolloProvider>
    );
  });

  const AuthRoute = (props) => {
    const { user, error, isLoading } = useUser();
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>{error.message}</div>;
    if (!user && typeof window !== "undefined") {
      window.location.href = "/api/auth/login";
      return null;
    }
    const store = require("../src/store").default;
    console.log(store);
    return (
      <ApolloProvider client={store.client}>
        <InnerComponent {...props} user={user} />
      </ApolloProvider>
    );
  };

  const WrappedComponent = (props) => {
    return (
      <UserProvider>
        <AuthRoute {...props} />
      </UserProvider>
    );
  };
  WrappedComponent.getInitialProps = InnerComponent.getInitialProps;

  return WrappedComponent;
}
