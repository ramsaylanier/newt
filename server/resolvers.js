const { PubSub } = require('graphql-subscriptions')
const pubSub = new PubSub()
const db = require('./database')
const { aql } = require('arangojs')
const { getPage } = require('./connectors')
const { uuid } = require('uuidv4')

const resolvers = {
  Page: {
    edges: async (parent, args) => {
      const collection = db.edgeCollection('PageEdges')
      try {
        const outEdges = await collection.outEdges(parent._id)
        const inEdges = await collection.inEdges(parent._id)
        const edges = [...outEdges, ...inEdges]
        return edges
      } catch (e) {
        console.log(e)
      }
    },
  },
  PageEdge: {
    from: async (parent) => {
      const collection = db.collection('Page')
      try {
        const page = await getPage(parent._from)
        return page
      } catch (e) {
        console.log(e)
      }
    },
    to: async (parent) => {
      const collection = db.collection('Page')
      try {
        return getPage(parent._to)
      } catch (e) {
        console.log(e)
      }
    },
  },
  Query: {
    pages: async (parent, args, context, info) => {
      const collection = db.collection('Pages')
      const filters = args.filters || []
      let filter = 'FILTER '

      filters.forEach((filter) => {
        const isLast = index === filters.length
      })
      try {
        const query = await db.query(aql`
          FOR p IN ${collection}
          RETURN p
        `)
        return query._result
      } catch (e) {
        console.log(e)
      }
    },
    page: async (parent, args, context, info) => {
      return getPage(args.id)
    },
  },
  Mutation: {
    createPage: async (parent, args, context, info) => {
      const collection = db.collection('Pages')

      try {
        const newPage = await collection.save({ title: args.title })
        const document = collection.document(newPage)
        pubSub.publish('pageAdded', { pageAdded: document })
        return document
      } catch (e) {
        console.log(e)
      }
    },
    deletePage: async (parent, args, context, info) => {
      const collection = db.collection('Pages')
      try {
        const document = await collection.document(args.id)
        collection.remove(document._key)
        pubSub.publish('pageDeleted', { pageDeleted: document })
        return document
      } catch (e) {
        console.log(e)
      }
    },
    updatePageTitle: async (parent, args, context, info) => {
      const collection = db.collection('Pages')
      try {
        const document = await collection.document(args.id)
        const update = await collection.update(document._key, {
          title: args.title,
        })
        const newDocument = await collection.document(update)
        pubSub.publish('pageUpdated', { pageUpdated: newDocument })
        return newDocument
      } catch (e) {
        console.log(e)
      }
    },
    updatePageContent: async (parent, args, context, info) => {
      const collection = db.collection('Pages')
      console.log(args)
      try {
        const document = await collection.document(args.id)
        const update = await collection.update(document._key, {
          content: args.content,
        })
        const newDocument = await collection.document(update)
        pubSub.publish('pageUpdated', { pageUpdated: newDocument })
        return newDocument
      } catch (e) {
        console.log(e)
      }
    },
    createPageEdges: async (parent, args, context, info) => {
      const { source, targets, blockKey } = args
      const collection = db.edgeCollection('PageEdges')
      const edges = []
      try {
        const existingEdges = await collection.outEdges(`Pages/${source}`)
        targets.forEach(async (target) => {
          const existingTarget = existingEdges.some((edge) => {
            return edge._to.includes(target)
          })

          if (!existingTarget) {
            const edge = collection.save({
              _from: `Pages/${source}`,
              _to: `Pages/${target}`,
              blockKey,
            })
            edges.push(edge)
          }
        })

        return Promise.all(edges).then((values) => {
          return values
        })
      } catch (e) {
        console.log(e)
      }
    },
  },
  Subscription: {
    pageAdded: {
      subscribe: () => pubSub.asyncIterator(['pageAdded']),
    },
    pageDeleted: {
      subscribe: () => pubSub.asyncIterator(['pageDeleted']),
    },
  },
}

module.exports = resolvers
