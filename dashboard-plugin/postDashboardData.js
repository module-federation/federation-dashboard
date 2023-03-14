const fetch = require("node-fetch");
async function postDashboardData({ data, headers }) {
  const client = this._options.fetchClient ? this._options.fetchClient : fetch;
  try {
    const res = await client(this._options.dashboardURL, {
      method: "POST",
      body: data,
      headers: {
        Accept: "application/json",
        "Content-type": "application/json",
        ...headers
      }
    });

    if (!res.ok) throw new Error(res.statusText);
  } catch (err) {
    console.warn(
      `Error posting data to dashboard URL: ${this._options.dashboardURL}`
    );
    console.error(err);
  }
}

module.exports = postDashboardData;
