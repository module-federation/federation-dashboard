const { ApolloGateway, RemoteGraphQLDataSource } = require("@apollo/gateway");
const { ApolloServer } = require("apollo-server-micro");
const { parse } = require("graphql/language/parser");

const plugins = require("./plugins");

async function getFederatedSchema(server) {
  const introspectionResult = await server.executeOperation({
    query: "query __ApolloGetServiceDefinition__ { _service { sdl } }",
  });
  const federatedSchema = introspectionResult.data._service.sdl;
  return parse(federatedSchema);
}

async function createServer() {
  const initializedPlugins = await Promise.all(
    plugins.map(async (plugin) => {
      const typeDefsPromise = getFederatedSchema(plugin.server);

      const dataSource = new RemoteGraphQLDataSource({
        process: async ({ context, request }) => {
          server.context = context;
          return plugin.server.executeOperation(request);
        },
      });

      return {
        dataSource,
        name: plugin.name,
        typeDefs: await typeDefsPromise,
      };
    })
  );

  const pluginDataSources = {};
  const localServiceList = [];
  for (const plugin of initializedPlugins) {
    pluginDataSources[plugin.name] = plugin.dataSource;
    localServiceList.push({
      name: plugin.name,
      typeDefs: plugin.typeDefs,
    });
  }

  const gateway = new ApolloGateway({
    localServiceList,
    buildService: (config) =>
      pluginDataSources[config.name] || new RemoteGraphQLDataSource(config),
  });

  const server = new ApolloServer({
    gateway,
    playground: true,
    subscriptions: false,
  });

  return server;
}

module.exports = createServer;
