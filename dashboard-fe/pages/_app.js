import React from "react";
if (!process.browser) {
  React.useLayoutEffect = React.useEffect;
}
import "cross-fetch/polyfill";
import { ApolloProvider } from "@apollo/client";
import Head from "next/head";
import CssBaseline from "@material-ui/core/CssBaseline";
import store from "../src/store";
import { publicConfig } from "../src/config";
import PropTypes from "prop-types";
import withAuth from "../components/with-auth";
import { UserProvider } from "@auth0/nextjs-auth0";

function MyApp(props) {
  const { Component, pageProps } = props;
  React.useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    <React.Fragment>
      <Head>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <CssBaseline />
      <ApolloProvider client={store.client}>
        <Component {...pageProps} />
      </ApolloProvider>
    </React.Fragment>
  );
}
MyApp.getInitialProps = async (props) => {
  return props;
};
export default withAuth(MyApp);
