import createApolloServer from "@module-federation/dashboard-graphql";

const initializeHandlerPromise = (async () => {
  const apolloServer = await createApolloServer();

  return apolloServer.createHandler({ path: "/api/graphql" });
})();

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (...args) => {
  const handler = await initializeHandlerPromise;

  return handler(...args);
};
