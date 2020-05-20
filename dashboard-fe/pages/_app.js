import "cross-fetch/polyfill";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "@apollo/react-hooks";
import Head from "next/head";
import Router from "next/router";

const client = new ApolloClient({
  uri: "http://localhost:3000/api/graphql",
});

function MyApp({ Component, pageProps }) {
  React.useEffect(() => {
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
      <ApolloProvider client={client}>
        <Component {...pageProps} />
      </ApolloProvider>
    </React.Fragment>
  );
}

if (process.env.NODE_ENV !== "production") {
  Router.events.on("routeChangeComplete", () => {
    const path = "/_next/static/chunks/styles.chunk.module.css";
    const chunksSelector = `link[href*="${path}"]:not([rel=preload])`;
    const chunksNodes = document.querySelectorAll(chunksSelector);
    if (chunksNodes.length) {
      const timestamp = new Date().valueOf();
      chunksNodes[0].href = `${path}?ts=${timestamp}`;
    }
  });
}

export default MyApp;
