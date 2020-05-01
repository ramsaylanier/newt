import { ApolloServer, gql } from "apollo-server-micro";
import { aql } from "arangojs";
import db from "../../database";

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
        return collection.document(newPage);
      } catch (e) {
        console.log(e);
      }
    },
  },
};

const apolloServer = new ApolloServer({ typeDefs, resolvers });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default apolloServer.createHandler({ path: "/api/graphql" });
