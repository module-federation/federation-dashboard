import ApplicationManager from "../../src/managers/Application";
import auth0 from "../../src/auth0";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb"
    }
  }
};

const dataIsValid = data =>
  data &&
  data.id !== undefined &&
  data.id.length > 0 &&
  data.name !== undefined &&
  data.name.length > 0 &&
  data.overrides !== undefined &&
  data.consumes !== undefined &&
  data.modules !== undefined;

const apiAuthGate = async (req, res, callback) => {
  const session = await auth0.getSession(req);
  if (session && session.noAuth) return callback(req, res);

  if (req?.query?.token !== global.INTERNAL_TOKEN) {
    if (!session || !session.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
  }

  return callback(req, res);
};

export default async (req, res) => {
  return apiAuthGate(req, res, async () => {
    if (dataIsValid(req.body)) {
      console.log(`Updating ${req.body.name}#${req.body.version}`);
      await ApplicationManager.update(req.body);
      res.send(true);
    } else {
      res.send(false);
    }
  });
};
