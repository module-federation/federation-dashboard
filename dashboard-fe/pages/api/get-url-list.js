import { publicConfig } from "../../src/config";

export default async (req, res) => {
  res.statusCode = 200;
  const isProd = process.env.NODE_ENV !== "development";
  const url = isProd
    ? process.browser
      ? publicConfig.EXTERNAL_URL.endsWith("/")
        ? publicConfig.EXTERNAL_URL
        : publicConfig.EXTERNAL_URL + "/"
      : "http://localhost:3000/"
    : "http://localhost:3000/";

  const json = await fetch(url + "urls.json").then((res) => {
    return res.json().then((json) => {
      return Object.values(json);
    });
  });

  res.json(json);
};
