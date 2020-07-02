import { ApolloServer, gql } from "apollo-server-micro";

import getApplications, { versionManagementEnabled, update } from "./db";

const DEFAULT_VERSIONS = {
  versions: [],
  latest: "",
  override: [],
};

import dbDriver from "../../src/database/drivers";

const typeDefs = gql`
  type Query {
    dashboard: DashboardInfo!

    applications(name: String): [Application!]!
    consumingApplications(name: String): [Application!]!
    modules(application: String, name: String): [Module!]!
    consumes(application: String, name: String): [Consume!]!

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

  type NewDependency {
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
    dependencies: [NewDependency]!
  }

  type NewOverride {
    id: ID!
    application: NewApplication!
    version: String
    name: String!
  }

  type NewConsume {
    consumingApplication: NewApplication!
    application: NewApplication
    name: String!
    usedIn: [FileLocation!]!
  }

  type NewModule {
    id: ID!
    application: NewApplication!
    name: String!
    file: String
    requires: [Override!]!
  }

  type NewApplication {
    id: String!
    name: String!
    group: String!
    metadata: [Metadata!]!
    remote: String!
    remotes: [Remote!]!
    overrides: [NewOverride!]!
    modules: [NewModule!]!
    consumes: [NewConsume!]!
    dependencies: [NewDependency!]!
    versions(type: String, latest: Boolean): [ApplicationVersion!]!
  }

  type Group {
    id: String!
    name: String!
    metadata: [Metadata!]!
    applications(id: String): [NewApplication!]!
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

  type Module {
    id: ID!
    application: Application!
    name: String!
    file: String
    requires: [Override!]!
    consumedBy: [Consume!]!
  }

  type Override {
    id: ID!
    application: Application!
    version: String
    name: String!
  }

  type FileLocation {
    file: String!
    url: String
  }

  type Consume {
    consumingApplication: Application!
    application: Application
    name: String!
    usedIn: [FileLocation!]!
  }

  type Dependency {
    name: String!
    version: String!
  }

  type Versions {
    versions: [String!]!
    latest: String!
    override: [Dependency!]
  }

  type Application {
    dependencies: [Dependency!]!
    devDependencies: [Dependency!]!
    optionalDependencies: [Dependency!]!
    id: ID!
    name: String!
    remote: String!
    modules: [Module!]!
    overrides: [Override!]!
    consumes: [Consume!]!
    versions: Versions!
  }
`;

const resolvers = {
  Query: {
    dashboard: () => {
      return {
        versionManagementEnabled: versionManagementEnabled(),
      };
    },
    applications: async (_, { name: nameFilter }) => {
      const applications = await getApplications();
      const applicationFilter = nameFilter
        ? ({ name }) => name.includes(nameFilter)
        : () => true;
      return applications.filter(applicationFilter);
    },
    consumingApplications: async (_, { name }) => {
      const applications = await getApplications();
      return applications.filter(
        ({ consumes }) =>
          consumes.filter(({ applicationID }) => applicationID === name)
            .length > 0
      );
    },
    modules: async (_, { application, name: nameFilter }) => {
      const applications = await getApplications();
      const applicationFilter = application
        ? ({ name }) => name.includes(application)
        : () => true;
      const filter = nameFilter
        ? ({ name }) => name.includes(nameFilter)
        : () => true;
      return applications
        .filter(applicationFilter)
        .map(({ modules }) => modules)
        .flat()
        .filter(filter);
    },
    consumes: async (_, { application, name: nameFilter }) => {
      const applications = await getApplications();
      const applicationFilter = application
        ? ({ name }) => name.includes(application)
        : () => true;
      const filter = nameFilter
        ? ({ name }) => name.includes(nameFilter)
        : () => true;
      return applications
        .filter(applicationFilter)
        .map(({ consumes }) => consumes)
        .flat()
        .filter(filter);
    },
    userByEmail: async (_, { email }) => {
      await dbDriver.setup();
      return dbDriver.user_findByEmail(email);
    },
    groups: async (_, { name }) => {
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
  NewApplication: {
    versions: async ({ id }, { type, latest }) => {
      await dbDriver.setup();
      let found = await dbDriver.applicationVersion_findAll(id, type);
      if (latest !== undefined) {
        found = found.filter(({ latest }) => latest);
      }
      return found;
    },
  },
  Group: {
    applications: async ({ id }, { id: applicationId }) => {
      await dbDriver.setup();
      if (!applicationId) {
        return dbDriver.application_findInGroups([id]);
      } else {
        const found = await dbDriver.application_find(applicationId);
        return found ? [found] : [];
      }
    },
  },
  Module: {
    application: async ({ applicationID }) => {
      const applications = await getApplications();
      return applications.find(({ id }) => id === applicationID);
    },
    requires: async ({ requires, applicationID }) => {
      const applications = await getApplications();
      const app = applications.find(({ id }) => id === applicationID);
      return requires.map((reqId) =>
        app.overrides.find(({ id }) => id === reqId)
      );
    },
    consumedBy: async ({ applicationID, name }) => {
      const applications = await getApplications();
      return applications
        .map(({ consumes }) => consumes)
        .flat()
        .filter(
          ({ applicationID: conApp, name: conName }) =>
            conApp === applicationID && conName === name
        );
    },
  },
  Override: {
    application: async ({ applicationID }) => {
      const applications = await getApplications();
      return applications.find(({ id }) => id === applicationID);
    },
  },
  Consume: {
    consumingApplication: async ({ consumingApplicationID }) => {
      const applications = await getApplications();
      return applications.find(({ id }) => id === consumingApplicationID);
    },
    application: async ({ applicationID }) => {
      const applications = await getApplications();
      return applications.find(({ id }) => id === applicationID);
    },
  },
  Application: {
    versions: async ({ id }) => {
      const applications = await getApplications();
      const app = applications.find(({ id: appId }) => appId === id);
      return app.versions || DEFAULT_VERSIONS;
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
