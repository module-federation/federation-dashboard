import React from "react";
import "cross-fetch/polyfill";
import { ApolloProvider } from "@apollo/client";
import Head from "next/head";
import Script from "next/script";
import CssBaseline from "@material-ui/core/CssBaseline";

import withAuth from "../components/with-auth";

function MyApp(props) {
  const { Component, pageProps } = props;
  console.log(pageProps);
  React.useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <CssBaseline />
      <Component {...pageProps} />
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-EY5KSYXPTL" />
      <Script
        id="show-banner"
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', 'G-EY5KSYXPTL');`,
        }}
      />
    </>
  );
}

MyApp.getInitialProps = async (props) => {
  return {};
};
export default withAuth(MyApp);
