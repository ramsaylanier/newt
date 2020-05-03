const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");
// const next = require("next");
const { createServer } = require("http");
const typeDefs = require("./server/typeDefs");
const resolvers = require("./server/resolvers");

const PORT = parseInt(process.env.PORT, 10) || 4000;
const dev = process.env.NODE_ENV !== "production";
// const app = next({ dev });
// const handle = app.getRequestHandler();

// app.prepare().then(() => {
const server = express();
const apolloServer = new ApolloServer({ typeDefs, resolvers });
apolloServer.applyMiddleware({ app: server });

const httpServer = createServer(server);
apolloServer.installSubscriptionHandlers(httpServer);

// server.all("*", (req, res) => {
//   return handle(req, res);
// });
httpServer.listen(PORT, () => {
  console.log(
    `🚀 Server ready at http://localhost:${PORT}${apolloServer.graphqlPath}`
  );
  console.log(
    `🚀 Subscriptions ready at ws://localhost:${PORT}${apolloServer.subscriptionsPath}`
  );
});
// });
