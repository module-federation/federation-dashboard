export default async (req, res) => {
  res.statusCode = 200;
  const isProd = process.env.NODE_ENV !== "development";
  const url = isProd
    ? process.browser
      ? "http://mf-dash.ddns.net:3000/"
      : "http://localhost:3000/"
    : "http://localhost:3000/";

  const json = await fetch(url + "urls.json").then(res => {
    return res.json();
  });

  res.json(json);
};
