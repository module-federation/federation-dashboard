import ApplicationManager from "../../src/managers/Application";
import auth0 from "../../src/auth0";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

const dataIsValid = (data) =>
  data &&
  data.id !== undefined &&
  data.id.length > 0 &&
  data.name !== undefined &&
  data.name.length > 0 &&
  data.overrides !== undefined &&
  data.consumes !== undefined &&
  data.modules !== undefined;

export default async (req, res) => {
  try {
    await auth0.handleProfile(req, res);
  } catch (error) {
    res.status(error.status || 500).end(error.message);
  }
  if (dataIsValid(req.body)) {
    console.log(`Updating ${req.body.name}#${req.body.version}`);
    await ApplicationManager.update(req.body);
    res.send(true);
  } else {
    res.send(false);
  }
};
