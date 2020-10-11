export default async (req, res) => {
  res.statusCode = 200;
  const isProd = process.env.NODE_ENV !== "development";
  const url = isProd
    ? "https://lighthouse-perf-compare.vercel.app/urls.json"
    : "http://localhost:3000/urls.json";
  console.log(url);
  const json = await fetch(url).then(res => {
    return res.json();
  });

  res.json(json);
};
