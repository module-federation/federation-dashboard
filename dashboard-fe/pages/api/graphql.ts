import { ApolloServer, gql } from "apollo-server-micro";

import { versionManagementEnabled } from "./db";

import dbDriver from "../../src/database/drivers";
import ModuleManager from "../../src/managers/Module";
import VersionManager from "../../src/managers/Version";

const typeDefs = gql`
  scalar Date

  type Query {
    dashboard: DashboardInfo!
    userByEmail(email: String): User
    groups(name: String): [Group!]!
    siteSettings: SiteSettings!
  }

  type Mutation {
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
      application: String!
      name: String!
      date: String!
      value: Float!
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
  type SiteSettings {
    webhooks: [Webhook]!
  }

  input WebhookInput {
    event: WebhookEventType!
    url: String!
  }
  input SiteSettingsInput {
    webhooks: [WebhookInput]!
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
    remote: String!
    remotes: [Remote!]!
    dependencies: [Dependency]!
    overrides: [Override!]!
    modules(name: String): [Module!]!
    consumes: [Consume!]!
  }

  type ApplicationOverride {
    version: String!
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

  type Application {
    id: String!
    name: String!
    group: String!
    metadata: [Metadata!]!
    tags: [String!]!
    metrics(names: [String!]): [MetricValue!]!
    overrides: [ApplicationOverride!]!
    versions(environment: String, latest: Boolean): [ApplicationVersion!]!
  }

  type Group {
    id: String!
    name: String!
    metadata: [Metadata!]!
    applications(id: String): [Application!]!
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
    userByEmail: async (_, { email }) => {
      await dbDriver.setup();
      return dbDriver.user_findByEmail(email);
    },
    groups: async (_, { name }, ctx) => {
      await dbDriver.setup();
      if (name) {
        const found = await dbDriver.group_findByName(name);
        return found ? [found] : [];
      } else {
        return dbDriver.group_findAll();
      }
    },
    siteSettings: () => {
      return dbDriver.siteSettings_get();
    },
  },
  Mutation: {
    addMetric: async (_, { group, application, date, name, value }) => {
      await dbDriver.setup();
      dbDriver.application_addMetrics(application, {
        date: new Date(Date.parse(date)),
        id: application,
        type: "application",
        name,
        value,
      });
      return true;
    },
    publishVersion: async (_, { group, application, version }) => {
      const out = await VersionManager.publishVersion(
        group,
        application,
        version
      );
      return out;
    },
    setRemoteVersion: async (_, { group, application, remote, version }) => {
      return VersionManager.setRemoteVersion(
        group,
        application,
        remote,
        version
      );
    },
    updateUser: async (_, { user }) => {
      await dbDriver.setup();
      await dbDriver.user_update({
        id: user.email,
        ...user,
      });
      return dbDriver.user_find(user.email);
    },
    updateSiteSettings: async (_, { settings }) => {
      await dbDriver.setup();
      await dbDriver.siteSettings_update(settings);
      return dbDriver.siteSettings_get();
    },
  },
  Application: {
    versions: async ({ id }, { environment, latest }, ctx) => {
      ctx.environment = environment;
      await dbDriver.setup();
      let found = await dbDriver.applicationVersion_findAll(id, environment);
      if (latest !== undefined) {
        found = found.filter(({ latest }) => latest);
      }
      return found;
    },
    metrics: async ({ id }, { names }, ctx) => {
      await dbDriver.setup();
      const metrics = await dbDriver.application_getMetrics(id);
      if (names) {
      } else {
      }
      return names
        ? metrics.filter(({ name }) => names.includes(name))
        : metrics;
    },
  },
  Consume: {
    consumingApplication: async (parent, args, ctx) => {
      await dbDriver.setup();
      return dbDriver.application_find(parent.consumingApplicationID);
    },
    application: async (parent, args, ctx) => {
      await dbDriver.setup();
      return dbDriver.application_find(parent.applicationID);
    },
  },
  Module: {
    consumedBy: async (parent, args, ctx) => {
      await dbDriver.setup();
      return ModuleManager.getConsumedBy(
        ctx.group,
        ctx.environment,
        parent.applicationID,
        parent.name
      );
    },
  },
  ApplicationVersion: {
    modules: async ({ modules }, { name }) => {
      return name
        ? modules.filter(({ name: moduleName }) => name === moduleName)
        : modules;
    },
  },
  Group: {
    applications: async ({ id }, { id: applicationId }, ctx) => {
      ctx.group = id;
      await dbDriver.setup();
      if (!applicationId) {
        return dbDriver.application_findInGroups([id]);
      } else {
        const found = await dbDriver.application_find(applicationId);
        return found ? [found] : [];
      }
    },
  },
};

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
});

const handler = apolloServer.createHandler({
  path: "/api/graphql",
  cors: true,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;