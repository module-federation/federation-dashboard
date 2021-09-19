import { ApolloServer, gql } from "apollo-server-micro";

import { versionManagementEnabled } from "./db";

import dbDriver from "../../src/database/drivers";
import ModuleManager from "../../src/managers/Module";
import VersionManager from "../../src/managers/Version";
import { privateConfig } from "../../src/config";
import auth0 from "../../src/auth0";
import "../../src/webhooks";
import LRU from "lru-cache";
import { application } from "express";
import { MongoClient } from "mongodb";

const options = {
  max: 500,
  length: function (n, key) {
    return n * 2 + key.length;
  },
  maxAge: 1000 * 60 * 60,
};
const cache = new LRU(options);

const typeDefs = gql`
  scalar Date

  type Query {
    dashboard: DashboardInfo!
    userByEmail(email: String): User
    groups(name: String): [Group!]!
    siteSettings: SiteSettings!
  }

  type Mutation {
    updateApplicationSettings(
      group: String!
      application: String!
      settings: ApplicationSettingsInput!
    ): ApplicationSettings
    deleteApplication(group: String!, application: String!): DeleteApplication
    updateGroupSettings(
      group: String!
      settings: GroupSettingsInput!
    ): GroupSettings
    publishVersion(
      group: String!
      application: String!
      version: String!
    ): ApplicationVersion!
    setRemoteVersion(
      group: String!
      application: String!
      remote: String!
      version: String
    ): Application!
    updateUser(user: UserInput!): User!
    updateSiteSettings(settings: SiteSettingsInput): SiteSettings!
    addMetric(
      group: String!
      application: String
      name: String!
      date: String!
      value: Float!
      url: String
      q1: Float
      q2: Float
      q3: Float
      max: Float
      min: Float
    ): Boolean!
    updateMetric(
      group: String!
      application: String
      name: String!
      date: String!
      value: Float!
      url: String
      q1: Float
      q2: Float
      q3: Float
      max: Float
      min: Float
    ): Boolean!
  }

  enum WebhookEventType {
    updateApplication
    deleteApplication
    updateApplicationVersion
    deleteApplicationVersion
  }

  type Webhook {
    event: WebhookEventType!
    url: String!
  }

  type Token {
    key: String!
    value: String!
  }

  type SiteSettings {
    webhooks: [Webhook]
    tokens: [Token]
    id: String
  }

  input WebhookInput {
    event: WebhookEventType!
    url: String!
  }

  input TokenInput {
    key: String!
    value: String!
  }

  input SiteSettingsInput {
    webhooks: [WebhookInput]
    tokens: [TokenInput]
    id: String
  }

  input MetadataInput {
    name: String!
    value: String!
  }

  input TrackedURLVariantInput {
    name: String!
    search: String
    new: Boolean
  }

  input TrackedURLInput {
    url: String!
    metadata: [MetadataInput]
    variants: [TrackedURLVariantInput!]!
  }

  input GroupSettingsInput {
    trackedURLs: [TrackedURLInput]
  }
  input ApplicationSettingsInput {
    trackedURLs: [TrackedURLInput]
  }

  type DashboardInfo {
    versionManagementEnabled: Boolean!
  }

  type Dependency {
    name: String!
    type: String!
    version: String!
  }

  type Remote {
    internalName: String!
    name: String!
  }

  type ApplicationVersion {
    environment: String!
    version: String!
    latest: Boolean!
    posted: String!
    remotes: [Remote!]!
    dependencies: [Dependency]!
    metadata: [Metadata!]!
    overrides: [Override!]!
    modules(name: String): [Module!]!
    consumes: [Consume!]!
  }

  type ApplicationOverride {
    version: String!
    application: Application!
    name: String!
  }

  type Override {
    id: ID!
    application: Application!
    version: String
    name: String!
  }

  type Consume {
    consumingApplication: Application!
    application: Application
    name: String!
    usedIn: [FileLocation!]!
  }

  type FileLocation {
    file: String!
    url: String
  }

  type MetricValue {
    url: String
    name: String!
    date: Date!
    value: Float!
  }

  type Module {
    id: ID!
    application: Application!
    name: String!
    file: String
    requires: [String!]!
    consumedBy: [Consume]!
    metadata: [Metadata!]!
    tags: [String!]!
  }

  type TrackedURL {
    url: String!
    variants: [TrackedURLVariant!]!
    metadata: [Metadata!]!
  }

  type ApplicationSettings {
    trackedURLs: [TrackedURL]
  }

  type TrackedURLVariant {
    name: String!
    search: String!
    new: Boolean!
  }

  type Application {
    id: String!
    name: String!
    group: String!
    metadata: [Metadata!]!
    remote: String!
    tags: [String!]!
    metrics(names: [String!]): [MetricValue!]!
    overrides: [ApplicationOverride!]!
    versions(
      environment: String
      latest: Boolean
      remote: String
    ): [ApplicationVersion!]!
    settings: ApplicationSettings
  }

  type GroupSettings {
    trackedURLs: [TrackedURL]
  }

  type DeleteApplication {
    group: String!
    application: String!
  }

  type Group {
    id: String!
    name: String!
    metadata: [Metadata!]!
    applications(id: String, remote: String): [Application!]!
    metrics(names: [String!]): [MetricValue!]!
    settings: GroupSettings
  }

  type Metadata {
    name: String!
    value: String!
  }

  input UserInput {
    email: String!
    name: String!
    groups: [String!]
    defaultGroup: String!
  }

  type User {
    id: String!
    email: String!
    name: String!
    groups: [String!]
    defaultGroup: String!
  }

  type Versions {
    versions: [String!]!
    latest: String!
    override: [Dependency!]
  }
`;

const resolvers = {
  Query: {
    dashboard: () => {
      return {
        versionManagementEnabled: versionManagementEnabled(),
      };
    },
    userByEmail: async (_: any, { email }: any) => {
      await dbDriver.setup(email);
      return dbDriver.user_findByEmail(email);
    },
    groups: async (_: any, props: any, ctx: any) => {
      await dbDriver.setup(ctx?.user?.email);
      const { name } = props;
      if (name) {
        const found = await dbDriver.group_findByName(name);
        return found ? [found] : [];
      } else {
        return dbDriver.group_findAll();
      }
    },
    siteSettings: async (_: any, props: any, ctx: any) => {
      await dbDriver.setup(ctx?.user?.email);
      const settings = await dbDriver.siteSettings_get(ctx?.user?.email);
      return settings[0];
    },
  },
  Mutation: {
    updateApplicationSettings: async (
      _: any,
      { group, application, settings }: any,
      ctx
    ) => {
      await dbDriver.setup(ctx?.user?.email);
      const app = await dbDriver.application_find(application);
      app.settings = settings;
      await dbDriver.application_update(app);
      return settings;
    },
    deleteApplication: async (
      _: any,
      { group, application }: any,
      ctx: any
    ) => {
      await dbDriver.setup(ctx?.user?.email);
      dbDriver.application_delete(application);
    },
    updateGroupSettings: async (_: any, { group, settings }: any, ctx: any) => {
      await dbDriver.setup(ctx?.user?.email);
      const grp = await dbDriver.group_find(group);
      grp.settings = settings;
      await dbDriver.group_update(grp);
      return settings;
    },
    addMetric: async (
      _: any,
      { group, application, date, name, value, url }: any,
      ctx: any
    ) => {
      await dbDriver.setup(ctx?.user?.email);
      dbDriver.application_addMetrics(application, {
        date: new Date(Date.parse(date)),
        id: application ? application : group,
        type: application ? "application" : "group",
        name,
        value,
        url,
        //TODO add extra keys
      });
      return true;
    },

    updateMetric: async (
      _: any,
      { group, application, date, name, value, url }: any,
      ctx: any
    ) => {
      await dbDriver.setup(ctx?.user?.email);
      console.log("Mutation", group, value, name);
      dbDriver.group_updateMetric(application, {
        id: application ? application : group,
        type: application ? "application" : "group",
        name,
        value,
        url,
        //TODO add extra keys
      });
      return true;
    },
    publishVersion: async (
      _: any,
      { group, application, version }: any,
      ctx: any
    ) => {
      const out = await VersionManager.publishVersion(
        group,
        application,
        version,
        ctx
      );
      return out;
    },
    setRemoteVersion: async (
      _: any,
      { group, application, remote, version }: any
    ) => {
      return VersionManager.setRemoteVersion(
        group,
        application,
        remote,
        version
      );
    },
    updateUser: async (_: any, { user }: any) => {
      await dbDriver.setup(user.email);
      await dbDriver.user_update({
        id: user.email,
        ...user,
      });
      return dbDriver.user_find(user.email);
    },
    updateSiteSettings: async (_: any, { settings }: any, ctx: any) => {
      await dbDriver.setup(ctx?.user?.email);
      if (process.env.WITH_AUTH) {
        await dbDriver.siteSettings_update({ ...settings, id: ctx.user.email });
        return dbDriver.siteSettings_get(ctx.user.email);
      }
      // await dbDriver.siteSettings_update(settings);
      // return dbDriver.siteSettings_get();
    },
  },
  Application: {
    versions: async ({ id }: any, { environment, latest }: any, ctx: any) => {
      ctx.environment = environment;

      await dbDriver.setup(ctx?.user?.email);
      let found = await dbDriver.applicationVersion_findAll(id, environment);

      if (latest !== undefined) {
        found = found.filter(({ latest }: any) => latest);
      }
      return found;
    },
    metrics: async ({ id }: any, { names }: any, ctx: any) => {
      await dbDriver.setup(ctx?.user?.email);
      const metrics = await dbDriver.application_getMetrics(id);
      if (names) {
      } else {
      }
      return names
        ? metrics.filter(({ name }: any) => names.includes(name))
        : metrics;
    },
  },
  Consume: {
    consumingApplication: async (parent: any, args: any, ctx: any) => {
      await dbDriver.setup(ctx?.user?.email);
      return dbDriver.application_find(parent.consumingApplicationID);
    },
    application: async (parent: any, args: any, ctx: any) => {
      await dbDriver.setup(ctx?.user?.email);
      return dbDriver.application_find(parent.applicationID);
    },
  },
  Module: {
    consumedBy: async (parent: any, args: any, ctx: any) => {
      await dbDriver.setup(ctx?.user?.email);
      return ModuleManager.getConsumedBy(
        ctx.group,
        ctx.environment,
        parent.applicationID,
        parent.name
      );
    },
  },
  ApplicationVersion: {
    modules: async ({ modules }: any, { name }: any) => {
      return name
        ? modules.filter(({ name: moduleName }) => name === moduleName)
        : modules;
    },
  },
  ApplicationOverride: {
    application: async (
      { name, version }: { name: string; version: string },
      props,
      ctx: any
    ) => {
      let env = ctx.environment;
      if (!ctx.environment) {
        env = "development";
      }
      await dbDriver.setup(ctx?.user?.email);
      if (version) {
        // TODO: this needs to come form graph query
        const foundVersion = await dbDriver.applicationVersion_find(
          name,
          env,
          version
        );
        return foundVersion;
      }
      const found = await dbDriver.application_find(name);
      return found;
    },
  },
  Group: {
    metrics: async ({ id }: any, { names }: any, ctx: any) => {
      await dbDriver.setup(ctx?.user?.email);
      const metrics = await dbDriver.group_getMetrics(id);
      if (names) {
      } else {
      }
      return names
        ? metrics.filter(({ name }: any) => names.includes(name))
        : metrics;
    },
    applications: async (
      { id }: any,
      { id: applicationId, remote },
      ctx: any
    ) => {
      ctx.group = id;

      await dbDriver.setup(ctx?.user?.email);
      if (!applicationId) {
        return dbDriver.application_findInGroups([id]);
      } else {
        let found = await dbDriver.application_find(applicationId);
        if (remote && Array.isArray(found.overrides)) {
          found.overrides = found.overrides.filter((override) => {
            if (override.name) {
              return override.name === remote;
            }
            return false;
          });
        }
        return found ? [found] : [];
      }
    },
  },
};

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }) => {
    if (privateConfig.WITH_AUTH) {
      let user;
      if (res.hasValidToken) {
        user = { user: { email: res.hasValidToken } };
      } else {
        user = auth0.getSession(req, res);
      }
      if (!user) {
        res.status(401).json({
          errors: [
            {
              message: "Unauthorized",
              extensions: { code: "UNAUTHENTICATED" },
            },
          ],
        });
        res.end();
        return;
      }
      return {
        user: user.user,
      };
    }
  },
});

const apolloHandler = apolloServer.start().then(() =>
  apolloServer.createHandler({
    path: "/api/graphql",
  })
);

async function runMiddleware(req: any, res: any, fn: any) {
  const callback = await fn;
  return new Promise(async (resolve, reject) => {
    callback(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

const allowCors = async (req: any, res: any, next: any) => {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  // another common pattern
  // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  return next(req, res);
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
        const pluginToken = tokens.find((t) => t.key === "readOnlyToken");
        return pluginToken?.value === token;
      });
      resolve(foundSettings);
    });
  }).then((foundToken) => {
    client.close();
    if (foundToken) {
      return foundToken.id;
    }
    return false;
  });
};

async function handler(req: any, res: any) {
  await runMiddleware(req, res, allowCors);
  // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
  // let session: { noAuth: boolean; user: {} } = false;
  // if (process.env.WITH_AUTH && !req.query.token) {
  //   session = auth0.getSession(req, res);
  // }
  console.time("checkForTokens");
  let user;
  user = cache.get(req.query.token);
  if (!user) {
    user = await checkForTokens(req.query.token || "noToken");
    if (req.query.token) {
      cache.set(req.query.token, user);
    }
  }
  console.timeEnd("checkForTokens");

  // if (
  //   !tokens ||
  //   req?.headers?.Authorization?.find((token) => tokens.includes(token))
  // ) {
  //   session = {
  //     user: {},
  //     noAuth: false,
  //   };
  // }
  // const hasValidToken =
  //   tokens &&
  //   tokens.some((token) => {
  //     return req.query.token === token;
  //   });
  // if (process.env.NODE_ENV === "production") {
  //   console.log("has valid token", hasValidToken);
  // }
  res.hasValidToken = user;
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'INTERNAL_TOKEN' does not exist on type '... Remove this comment to see the full error message
  // if (!hasValidToken) {
  //   // @ts-expect-error ts-migrate(2339) FIXME: Property 'user' does not exist on type '{ noAuth: ... Remove this comment to see the full error message
  //   if (!session || !session.user) {
  //     // @ts-expect-error ts-migrate(2339) FIXME: Property 'noAuth' does not exist on type '{ noAuth... Remove this comment to see the full error message
  //     if (!session.noAuth) {
  //       res.status(401).json({
  //         errors: [
  //           {
  //             message: "Unauthorized",
  //             extensions: { code: "UNAUTHENTICATED" },
  //           },
  //         ],
  //       });
  //     }
  //   }
  // }

  await runMiddleware(req, res, apolloHandler);
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;
