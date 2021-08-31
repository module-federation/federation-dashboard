import auth0 from "../../src/auth0";

export default async function me(req, res) {
  try {
    console.log("handling profile");
    const profile = auth0.handleProfile(req, res);
    return profile;
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).end(error.message);
  }
}
