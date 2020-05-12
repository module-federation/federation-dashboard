import { ApolloServer, gql } from "apollo-server-micro";

const typeDefs = gql`
  type Query {
    applications: [Application!]!
    modules(name: String): [Module!]!
    consumes(name: String): [Consume!]!
  }

  type Module {
    id: ID!
    application: Application!
    name: String!
    requires: [Override!]!
  }

  type Override {
    id: ID!
    application: Application!
    name: String!
  }

  type Consume {
    consumingApplication: Application!
    application: Application!
    name: String!
  }

  type Application {
    id: ID!
    name: String!
    modules: [Module!]!
    overrides: [Override!]!
    consumes: [Consume!]!
  }
`;

const apps = [
  {
    id: 1,
    name: "Home",
    modules: [
      {
        id: 1,
        name: "Header",
        applicationID: 1,
        requires: [1],
      },
    ],
    overrides: [
      {
        id: 1,
        name: "react",
        applicationID: 1,
      },
      {
        id: 2,
        name: "react-dom",
        applicationID: 1,
      },
    ],
    consumes: [
      {
        consumingApplicationID: 1,
        applicationID: 2,
        name: "Button",
      },
    ],
  },
  {
    id: 2,
    name: "Search",
    modules: [
      {
        id: 2,
        name: "Button",
        applicationID: 2,
        requires: [3],
      },
    ],
    overrides: [
      {
        id: 3,
        name: "react",
        applicationID: 2,
      },
      {
        id: 4,
        name: "react-dom",
        applicationID: 2,
      },
    ],
    consumes: [
      {
        consumingApplicationID: 2,
        applicationID: 1,
        name: "Header",
      },
    ],
  },
];

const resolvers = {
  Query: {
    applications() {
      return apps;
    },
    modules(_, { name: nameFilter }) {
      return apps
        .map(({ modules }) => modules)
        .flat()
        .filter(({ name }) => name.includes(nameFilter));
    },
    consumes(_, { name: nameFilter }) {
      return apps
        .map(({ consumes }) => consumes)
        .flat()
        .filter(({ name }) => name.includes(nameFilter));
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
