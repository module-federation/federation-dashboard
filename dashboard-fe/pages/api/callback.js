import auth0 from "../../src/auth0";

export default async function callback(req, res) {
  try {
    await auth0.handleCallback(req, res);
  } catch (error) {
    console.error("auth errr", error);
    await auth0.handleLogout(req, res);
    res.status(error.status || 500).end(error.message);
  }
}
