import React, { Component, FC } from "react";
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
      console.log("showing inner component");
      return <InnerComponent {...props} user={null} />;
    };
    return NoAuth;
  }

  const Authenticated = withPageAuthRequired((props) => {
    const { user, error, isLoading } = useUser();

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>{error.message}</div>;
    return (
      <ApolloProvider client={store.client}>
        <InnerComponent {...props} user={user} />
      </ApolloProvider>
    );
  });

  const WrappedComponent = (props) => (
    <UserProvider>
      <Authenticated {...props} />
    </UserProvider>
  );

  return WrappedComponent;
}
