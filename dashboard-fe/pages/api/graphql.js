import { ApolloServer, gql } from "apollo-server-micro";

import home from "../../data/home.json";
import search from "../../data/search.json";
import dsl from "../../data/dsl.json";
import nav from "../../data/nav.json";

const importData = ({ federationRemoteEntry, modules }) => {
  const app = federationRemoteEntry.origins[0].loc;
  const overrides = {};
  const consumes = [];
  const modulesObj = {};

  modules.forEach(({ identifier }) => {
    const data = identifier.split(" ");
    if (data[0] === "remote") {
      if (data.length === 4) {
        consumes.push({
          consumingApplicationID: app,
          applicationID: data[1].replace("webpack/container/reference/", ""),
          name: data[2],
        });
      }
    } else if (data[0] === "container" && data[1] === "entry") {
      JSON.parse(data[2]).forEach(([name, file]) => {
        modulesObj[file] = {
          id: `${app}:${name}`,
          name,
          applicationID: app,
          requires: new Set(),
          file,
        };
      });
    }
  });

  modules.forEach(({ identifier, issuerName, reasons }) => {
    const data = identifier.split("|");
    if (data[0] === "overridable") {
      if (issuerName) {
        // This is a hack
        const issuerNameMinusExtension = issuerName.replace(".js", "");
        if (modulesObj[issuerNameMinusExtension]) {
          modulesObj[issuerNameMinusExtension].requires.add(data[3]);
        }
      }
      if (reasons) {
        reasons.forEach(({ module }) => {
          const moduleMinusExtension = module.replace(".js", "");
          if (modulesObj[moduleMinusExtension]) {
            modulesObj[moduleMinusExtension].requires.add(data[3]);
          }
        });
      }
      overrides[data[3]] = {
        id: data[3],
        name: data[3],
        verson: data[1],
        location: data[2],
        applicationID: app,
      };
    }
  });

  const out = {
    id: app,
    name: app,
    overrides: Object.values(overrides),
    consumes,
    modules: Object.values(modulesObj).map((mod) => ({
      ...mod,
      requires: Array.from(mod.requires.values()),
    })),
  };

  return out;
};

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
  importData(home),
  importData(search),
  importData(dsl),
  importData(nav),
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
