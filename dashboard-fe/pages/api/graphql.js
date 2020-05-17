import { ApolloServer, gql } from "apollo-server-micro";

import apps from "../../data/graph.json";

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
    application: Application!
    name: String!
    usedIn: [FileLocation!]!
  }

  type Application {
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
      return apps.filter(applicationFilter);
    },
    modules(_, { application, name: nameFilter }) {
      const applicationFilter = application
        ? ({ name }) => name.includes(application)
        : () => true;
      const filter = nameFilter
        ? ({ name }) => name.includes(nameFilter)
        : () => true;
      return apps
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
      return apps
        .filter(applicationFilter)
        .map(({ consumes }) => consumes)
        .flat()
        .filter(filter);
    },
  },
  Module: {
    application({ applicationID }) {
      return apps.find(({ id }) => id === applicationID);
    },
    requires({ requires, applicationID }) {
      const app = apps.find(({ id }) => id === applicationID);
      return requires.map((reqId) =>
        app.overrides.find(({ id }) => id === reqId)
      );
    },
  },
  Override: {
    application({ applicationID }) {
      return apps.find(({ id }) => id === applicationID);
    },
  },
  Consume: {
    consumingApplication({ consumingApplicationID }) {
      return apps.find(({ id }) => id === consumingApplicationID);
    },
    application({ applicationID }) {
      return apps.find(({ id }) => id === applicationID);
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
