import auth0 from "../../src/auth0";
import url from "native-url";

const fetchToken = () => {
  return fetch(url.resolve(privateConfig.EXTERNAL_URL, "api/graphql"), {
    method: "POST",
    redirect: "follow",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      query: `query {
    {
      siteSettings {
        tokens {
          key
          value
        }
        webhooks {
          event
          url
        }
      }
    }
    }
  }`
    })
  });
};

export default async function me(req, res) {
  try {
    await auth0.handleProfile(req, res);
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).end(error.message);
  }
}
