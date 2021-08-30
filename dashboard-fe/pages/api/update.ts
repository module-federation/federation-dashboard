import ApplicationManager from "../../src/managers/Application";
import auth0 from "../../src/auth0";
import dbDriver from "../../src/database/drivers";

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
  const session = await auth0.getSession(req);
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'noAuth' does not exist on type '{ noAuth... Remove this comment to see the full error message
  if (session && session.noAuth) return callback(req, res);

  // @ts-expect-error ts-migrate(2339) FIXME: Property 'INTERNAL_TOKEN' does not exist on type '... Remove this comment to see the full error message
  if (res.hasValidTokenn) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'user' does not exist on type '{ noAuth: ... Remove this comment to see the full error message
    if (!session || !session.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
  }

  return callback(req, res);
};
const checkForTokens = async () => {
  await dbDriver.setup();
  const { tokens } = await dbDriver.siteSettings_get();
  if (Array.isArray(tokens) && tokens.length === 0) {
    return false;
  } else {
    return tokens;
  }
};

export default async (req: any, res: any) => {
  let session: { noAuth: boolean; user: {} } = false;

  let tokens = await checkForTokens();
  if (tokens) {
    tokens = tokens.map((token) => {
      return token.value;
    });
  } else {
    tokens = false;
  }

  const hasValidToken =
    tokens &&
    tokens.some((token) => {
      return req.query.token === token;
    });

  Object.assign(res, { hasValidToken: hasValidToken });
  if (
    !tokens ||
    req?.headers?.Authorization?.find((token) => tokens.includes(token))
  ) {
    session = {
      user: {},
      noAuth: false,
    };
  }

  apiAuthGate.hasValidToken = hasValidToken;
  return apiAuthGate(req, res, async () => {
    if (dataIsValid(req.body) || hasValidToken) {
      console.log(`Updating ${req.body.name}#${req.body.version}`);
      await ApplicationManager.update(req.body);
      res.send(true);
    } else {
      res.send(false);
    }
  });
};
