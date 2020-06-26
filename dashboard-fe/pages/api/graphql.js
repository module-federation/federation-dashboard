import { ApolloServer, gql } from "apollo-server-micro";

import getApplications from "./db";

const typeDefs = gql`
  type Query {
    applications(name: String): [Application!]!
    consumingApplications(name: String): [Application!]!
    modules(application: String, name: String): [Module!]!
    consumes(application: String, name: String): [Consume!]!
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
  }
`;

const resolvers = {
  Query: {
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
};

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
});

const handler = apolloServer.createHandler({ path: "/api/graphql" });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;
