import { privateConfig } from "../../src/config";

export default (req, res) => {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=60000, stale-while-revalidate=59"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  const { currentHost, remoteName, token } = req.query;
  console.log(
    new URL(`/api/graphql?token=${token}`, privateConfig.EXTERNAL_URL).href
  );
  fetch(
    new URL(`/api/graphql?token=${token}`, privateConfig.EXTERNAL_URL).href,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: `query {
    groups {
      name
      applications(id: "${currentHost}", remote: "${remoteName}") {
        name
        versions {
          version
          metadata {
            name
            value
          }
        }
        metadata {
          name
          value
        }
        overrides {
          name
          version
          application {
            metadata {
              name
              value
            }
          }
        }
      }
    }
  }`,
      }),
    }
  ).then(function (response) {
    response.json().then(function (data) {
      res.json(data.data);
    });
  });
};
