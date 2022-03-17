import ApplicationManager from "../../src/managers/Application";
import auth0 from "../../src/auth0";
import dbDriver from "../../src/database/drivers";
import { privateConfig } from "../../src/config";
import { MongoClient } from "mongodb";
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

const dataIsValid = (data: any) =>
  data &&
  data.id !== undefined &&
  data.id.length > 0 &&
  data.name !== undefined &&
  data.name.length > 0 &&
  data.overrides !== undefined &&
  data.consumes !== undefined &&
  data.modules !== undefined;

const apiAuthGate = async (req: any, res: any, callback: any) => {
  // const session = await auth0.getSession(req,res);// @ts-expect-error ts-migrate(2339) FIXME: Property 'noAuth' does not exist on type '{ noAuth... Remove this comment to see the full error message
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'INTERNAL_TOKEN' does not exist on type '... Remove this comment to see the full error message
  if (!res.hasValidToken) {
    // if (!session || !session.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
    // }
  }

  return callback(req, res);
};

const checkForTokens = async (token) => {
  // create fresh connection for when no user exists to setup driver
  const client = new MongoClient(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  return new Promise((resolve) => {
    client.connect(async (err) => {
      if (err) {
        console.error("Error during MongoDB database startup");
        console.error(err.toString());
        process.exit(1);
      }
      const mainDB = client.db("fmdashboard");
      const siteSettings = mainDB.collection("siteSettings");
      const settings = await siteSettings.find({}).toArray();
      const foundSettings = settings.find(({ tokens }) => {
        const pluginToken = tokens.find((t) => t.key === "pluginToken");
        if (!pluginToken?.value || !token) {
          return false;
        }
        return pluginToken?.value === token;
      });
      resolve(foundSettings);
    });
  }).then((foundToken) => {
    if (foundToken) {
      return foundToken.id;
    }
    return false;
  });
};

export default async (req: any, res: any) => {
  let user = privateConfig.WITH_AUTH
    ? await checkForTokens(req.query.token || "noToken")
    : true;
  // if (tokens) {
  //   tokens = tokens.map((token) => {
  //     return token.value;
  //   });
  // } else {
  //   tokens = false;
  // }
  //
  // const hasValidToken =
  //   tokens &&
  //   tokens.some((token) => {
  //     return req.query.token === token;
  //   });
  //
  // Object.assign(res, { hasValidToken: hasValidToken });
  // if (
  //   !tokens ||
  //   req?.headers?.Authorization?.find((token) => tokens.includes(token))
  // ) {
  //   session = {
  //     user: {},
  //     noAuth: false,
  //   };
  // }

  // @ts-ignore
  res.hasValidToken = user;
  return apiAuthGate(req, res, async () => {
    if (dataIsValid(req.body) && user) {
      console.log(`Updating ${req.body.name}#${req.body.version}`);
      await ApplicationManager.update(req.body, user);
      res.send(true);
    } else {
      res.send(false);
    }
  });
};
