import { ApolloServer, gql } from "apollo-server-micro";

import getApplications from "./db";

const typeDefs = gql`
  type Query {
    applications(name: String): [Application!]!
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
    applications(_, { name: nameFilter }) {
      const applicationFilter = nameFilter
        ? ({ name }) => name.includes(nameFilter)
        : () => true;
      return getApplications().filter(applicationFilter);
    },
    modules(_, { application, name: nameFilter }) {
      const applicationFilter = application
        ? ({ name }) => name.includes(application)
        : () => true;
      const filter = nameFilter
        ? ({ name }) => name.includes(nameFilter)
        : () => true;
      return getApplications()
        .filter(applicationFilter)
        .map(({ modules }) => modules)
        .flat()
        .filter(filter);
    },
    consumes(_, { application, name: nameFilter }) {
      const applicationFilter = application
        ? ({ name }) => name.includes(application)
        : () => true;
      const filter = nameFilter
        ? ({ name }) => name.includes(nameFilter)
        : () => true;
      return getApplications()
        .filter(applicationFilter)
        .map(({ consumes }) => consumes)
        .flat()
        .filter(filter);
    },
  },
  Module: {
    application({ applicationID }) {
      return getApplications().find(({ id }) => id === applicationID);
    },
    requires({ requires, applicationID }) {
      const app = getApplications().find(({ id }) => id === applicationID);
      return requires.map((reqId) =>
        app.overrides.find(({ id }) => id === reqId)
      );
    },
    consumedBy({ applicationID, name }) {
      return getApplications()
        .map(({ consumes }) => consumes)
        .flat()
        .filter(
          ({ applicationID: conApp, name: conName }) =>
            conApp === applicationID && conName === name
        );
    },
  },
  Override: {
    application({ applicationID }) {
      return getApplications().find(({ id }) => id === applicationID);
    },
  },
  Consume: {
    consumingApplication({ consumingApplicationID }) {
      return getApplications().find(({ id }) => id === consumingApplicationID);
    },
    application({ applicationID }) {
      return getApplications().find(({ id }) => id === applicationID);
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
