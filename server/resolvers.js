const { PubSub } = require("graphql-subscriptions");
const pubSub = new PubSub();
const db = require("./database");
const { aql } = require("arangojs");

const resolvers = {
  Page: {
    edges: async (parent, args) => {
      console.log(parent);
    },
  },
  Query: {
    pages: async (parent, args, context, info) => {
      const collection = db.collection("Pages");
      const filters = args.filters || [];
      let filter = "FILTER ";

      filters.forEach((filter) => {
        const isLast = index === filters.length;
      });
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
    page: async (parent, args, context, info) => {
      const collection = db.collection("Pages");
      try {
        const query = await db.query(aql`
          FOR p IN ${collection}
          FILTER p._key == ${args.id}
          RETURN p
        `);
        return query.next();
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
        const document = collection.document(newPage);
        pubSub.publish("pageAdded", { pageAdded: document });
        return document;
      } catch (e) {
        console.log(e);
      }
    },
    deletePage: async (parent, args, context, info) => {
      const collection = db.collection("Pages");
      try {
        const document = await collection.document(args.id);
        collection.remove(document._key);
        pubSub.publish("pageDeleted", { pageDeleted: document });
        return document;
      } catch (e) {
        console.log(e);
      }
    },
    updatePageTitle: async (parent, args, context, info) => {
      const collection = db.collection("Pages");
      try {
        const document = await collection.document(args.id);
        const update = await collection.update(document._key, {
          title: args.title,
        });
        const newDocument = await collection.document(update);
        pubSub.publish("pageUpdated", { pageUpdated: newDocument });
        return newDocument;
      } catch (e) {
        console.log(e);
      }
    },
    createPageEdges: async (parent, args, context, info) => {
      const { source, targets } = args;
      const collection = db.edgeCollection("PageEdges");
      const edges = [];
      try {
        const existingEdges = await collection.outEdges(`Pages/${source}`);
        targets.forEach(async (target) => {
          const existingTarget = existingEdges.some((edge) => {
            return edge._to.includes(target);
          });

          if (!existingTarget) {
            const edge = collection.save({
              _from: `Pages/${source}`,
              _to: `Pages/${target}`,
            });
            edges.push(edge);
          }
        });

        return Promise.all(edges).then((values) => {
          return values;
        });
      } catch (e) {
        console.log(e);
      }
    },
  },
  Subscription: {
    pageAdded: {
      subscribe: () => pubSub.asyncIterator(["pageAdded"]),
    },
    pageDeleted: {
      subscribe: () => pubSub.asyncIterator(["pageDeleted"]),
    },
  },
};

module.exports = resolvers;
