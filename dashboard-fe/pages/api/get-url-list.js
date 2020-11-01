import auth0 from "../../src/auth0";

export default async (req, res) => {
  try {
    await auth0.handleProfile(req, res);
  } catch (error) {
    res.status(error.status || 500).end(error.message);
  }
  res.statusCode = 200;
  const isProd = process.env.NODE_ENV !== "development";
  const url = isProd
    ? process.browser
      ? "http://mf-dash.ddns.net:3000/"
      : "http://localhost:3000/"
    : "http://localhost:3000/";

  const json = await fetch(url + "urls.json").then((res) => {
    return res.json().then((json) => {
      return Object.values(json);
    });
  });

  res.json(json);
};
