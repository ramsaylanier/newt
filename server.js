const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");
const { PubSub } = require("graphql-subscriptions");
const next = require("next");
const db = require("./database");
const { aql } = require("arangojs");
const { createServer } = require("http");

const PORT = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const pubSub = new PubSub();

const typeDefs = gql`
  type Page {
    _key: String
    title: String
  }

  type Query {
    pages: [Page]
  }

  type Mutation {
    createPage(title: String!): Page
  }

  type Subscription {
    pageAdded(title: String!): Page
  }
`;

const resolvers = {
  Query: {
    pages: async (parent, args, context, info) => {
      const collection = db.collection("Pages");
      try {
        const query = await db.query(aql`
          FOR p IN ${collection}
          RETURN p
        `);
        return query._result;
      } catch (e) {
        console.log(e);
      }
    },
  },
  Mutation: {
    createPage: async (parent, args, context, info) => {
      const collection = db.collection("Pages");

      try {
        const newPage = await collection.save({ title: args.title });
        console.log(newPage);
        pubSub.publish("pageAdded", { pageAdded: { newPage } });
        return collection.document(newPage);
      } catch (e) {
        console.log(e);
      }
    },
  },
  Subscription: {
    pageAdded: {
      subscribe: () => pubSub.asyncIterator("pageAdded"),
    },
  },
};

app.prepare().then(() => {
  const server = express();

  const apolloServer = new ApolloServer({ typeDefs, resolvers });
  apolloServer.applyMiddleware({ app: server });

  server.all("*", (req, res) => {
    return handle(req, res);
  });

  const httpServer = createServer(server);
  apolloServer.installSubscriptionHandlers(httpServer);
  httpServer.listen(PORT, () => {
    console.log(
      `🚀 Server ready at http://localhost:${PORT}${apolloServer.graphqlPath}`
    );
    console.log(
      `🚀 Subscriptions ready at ws://localhost:${PORT}${apolloServer.subscriptionsPath}`
    );
  });
});
