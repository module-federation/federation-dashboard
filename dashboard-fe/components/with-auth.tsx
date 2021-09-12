import React, { Component, FC } from "react";
import { publicConfig } from "../src/config";
import { useUser } from "@auth0/nextjs-auth0";
import { UserProvider } from "@auth0/nextjs-auth0";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";

export default function withAuth(InnerComponent: FC) {
  if (!publicConfig.WITH_AUTH) {
    const NoAuth = (props: object) => {
      return <InnerComponent {...props} user={null} />;
    };
    return NoAuth;
  }

  const Authenticated = withPageAuthRequired((props) => {
    const { user, error, isLoading } = useUser();
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>{error.message}</div>;
    return <InnerComponent {...props} user={user} />;
  });

  const WrappedComponent = (props) => (
    <UserProvider>
      <Authenticated {...props} />
    </UserProvider>
  );

  return WrappedComponent;
}
