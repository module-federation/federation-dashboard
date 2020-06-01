const { buildFederatedSchema } = require("@apollo/federation");
const { ApolloServer } = require("apollo-server");

const resolvers = require("./resolvers");
const typeDefs = require("./type-defs");

const server = new ApolloServer({
  introspection: true,
  playground: false,
  subscriptions: false,
  schema: buildFederatedSchema({
    resolvers,
    typeDefs,
  }),
});

module.exports = server;
