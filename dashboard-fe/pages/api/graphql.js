import { ApolloServer, gql } from "apollo-server-micro";

import getApplications, { versionManagementEnabled, update } from "./db";

const DEFAULT_VERSIONS = {
  versions: [],
  latest: "",
  override: [],
};

import dbDriver from "../../src/database/drivers";
import ModuleManager from "../../src/managers/Module";

const typeDefs = gql`
  type Query {
    dashboard: DashboardInfo!
    userByEmail(email: String): User
    groups(name: String): [Group!]!
  }

  type Mutation {
    addVersion(application: String!, version: String!): Versions!
    publishVersion(application: String!, version: String!): Versions!
    setRemoteVersion(
      application: String!
      remote: String!
      version: String
    ): Versions!
    updateUser(user: UserInput!): User!
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
    type: String!
    version: String!
    latest: Boolean!
    remote: String!
    remotes: [Remote!]!
    dependencies: [Dependency]!
    overrides: [Override!]!
    modules(name: String): [Module!]!
    consumes: [Consume!]!
  }

  type ApplicationOverride {
    id: ID!
    application: Application!
    version: String
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

  type Module {
    id: ID!
    application: Application!
    name: String!
    file: String
    requires: [String!]!
    consumedBy: [Consume]!
  }

  type Application {
    id: String!
    name: String!
    group: String!
    metadata: [Metadata!]!
    overrides: [ApplicationOverride!]
    versions(type: String, latest: Boolean): [ApplicationVersion!]!
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
  },
  Mutation: {
    addVersion: async (_, { application, version }) => {
      const applications = await getApplications();
      const app = applications.find(({ id }) => id === application);
      if (!app) {
        throw new Error(`Application ${application} not found`);
      }
      app.versions = app.versions || DEFAULT_VERSIONS;
      app.versions.versions = [
        ...app.versions.versions.filter((v) => v !== version),
        version,
      ];
      app.versions.latest = app.versions.latest || version;
      update(app);
      return app.versions;
    },
    publishVersion: async (_, { application, version }) => {
      const applications = await getApplications();
      const app = applications.find(({ id }) => id === application);
      if (!app) {
        throw new Error(`Application ${application} not found`);
      }
      app.versions = app.versions || DEFAULT_VERSIONS;
      app.versions.latest = version;
      update(app);
      return app.versions;
    },
    setRemoteVersion: async (_, { application, remote, version }) => {
      const applications = await getApplications();
      const app = applications.find(({ id }) => id === application);
      app.versions = app.versions || DEFAULT_VERSIONS;
      const overridesWithoutRemote = app.versions.override.filter(
        ({ name }) => name !== remote
      );
      if (version) {
        app.versions.override = [
          ...overridesWithoutRemote,
          {
            name: remote,
            version,
          },
        ];
      } else {
        app.versions.override = overridesWithoutRemote;
      }
      update(app);
      return app.versions;
    },
    updateUser: async (_, { user }) => {
      await dbDriver.setup();
      await dbDriver.user_update({
        id: user.email,
        ...user,
      });
      return dbDriver.user_find(user.email);
    },
  },
  Application: {
    versions: async ({ id }, { type, latest }, ctx) => {
      ctx.type = type;
      await dbDriver.setup();
      let found = await dbDriver.applicationVersion_findAll(id, type);
      if (latest !== undefined) {
        found = found.filter(({ latest }) => latest);
      }
      return found;
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
        ctx.type,
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
