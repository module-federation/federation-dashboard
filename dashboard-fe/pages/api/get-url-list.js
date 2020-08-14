export default async (req, res) => {
  res.statusCode = 200;
  const isProd = process.env.NODE_ENV !== "development";
  const url = isProd
    ? "http://mf-dash.ddns.net:3000/urls.json"
    : "http://localhost:3000/urls.json";

  const json = await fetch(url).then((res) => {
    return res.json();
  });

  res.json(json);
};
