import "cross-fetch/polyfill";
import ApolloClient from "apollo-boost";
import { ApolloProvider } from "@apollo/react-hooks";
import Head from "next/head";
import CssBaseline from "@material-ui/core/CssBaseline";
import { Auth0Provider } from "use-auth0-hooks";

const client = new ApolloClient({
  uri: "http://localhost:3000/api/graphql",
});

function MyApp({ Component, pageProps }) {
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
      <Auth0Provider
        domain="jacob-ebey.auth0.com"
        clientId="vjF7pqeEveWVjToEwICt3WJUWU8iiaNK"
        redirectUri="http://localhost:3000"
      >
        <ApolloProvider client={client}>
          <Component {...pageProps} />
        </ApolloProvider>
      </Auth0Provider>
    </React.Fragment>
  );
}

export default MyApp;
