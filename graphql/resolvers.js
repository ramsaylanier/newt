const { PubSub } = require('graphql-subscriptions')
const pubSub = new PubSub()
const { aql } = require('arangojs')
const { getPage, getGraph } = require('./connectors')
const uniq = require('lodash/uniq')
const forEach = require('lodash/forEach')

const resolvers = {
  Page: {
    edges: async (parent, args, { db }) => {
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
    from: async (parent, args, { db }) => {
      try {
        return getPage(`page._id == '${parent._from}'`, db)
      } catch (e) {
        console.log(e)
      }
    },
    to: async (parent, args, { db }) => {
      try {
        return getPage(`page._id == '${parent._to}'`, db)
      } catch (e) {
        console.log(e)
      }
    },
    excerpt: async (parent, args, { db }) => {
      const collection = db.collection('Pages')
      try {
        const query = await db.query(aql`
          FOR page IN ${collection}
            LET blocks = page.content.blocks || []
            FOR b in blocks
              LET block = b || {}
              FILTER block.key IN ${parent.blockKeys || []}
              RETURN block 
        `)
        return query._result.map((r) => r.text)
      } catch (e) {
        console.log(e)
      }
    },
  },
  Graph: {
    nodes: async (parent) => {
      return parent.nodes
    },
    edges: async (parent) => {
      return parent.edges
    },
  },
  Query: {
    pages: async (parent, args, { db }) => {
      let filter = ''
      let limit = ''
      try {
        const collection = db.collection('pageSearch')
        const { filters = [], count, offset = 0 } = args
        filters.forEach((f) => {
          filter += `FILTER ${f.filter}`
        })
        filter = aql.literal(filter)
        if (count) {
          limit = `LIMIT ${offset}, ${count}`
        }
        limit = aql.literal(limit)
        const query = await db.query(aql`
          FOR page IN ${collection} 
          ${filter}
          SORT page.lastEdited DESC
          ${limit}
          RETURN page
        `)
        return query._result || []
      } catch (e) {
        console.log(e)
      }
    },
    page: async (parent, args, { db }) => {
      return getPage(args.filter, db)
    },
    graph: async (parent, args, { db }) => {
      return getGraph(args.name, db)
    },
  },
  Mutation: {
    createPage: async (parent, args, { db }) => {
      const collection = db.collection('Pages')

      try {
        const newPage = await collection.save({
          title: args.title,
          lastEdited: new Date(),
        })
        const document = collection.document(newPage)
        pubSub.publish('pageAdded', { pageAdded: document })
        return document
      } catch (e) {
        console.log(e)
      }
    },
    deletePage: async (parent, args, { db }) => {
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
    updatePageTitle: async (parent, args, { db }) => {
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
    updatePageContent: async (parent, args, { db }) => {
      const collection = db.collection('Pages')
      const edgeCollection = db.edgeCollection('PageEdges')
      try {
        const document = await collection.document(args.id)
        const update = await collection.update(document._key, {
          content: args.content,
          lastEdited: new Date(),
        })
        const newDocument = await collection.document(update)
        pubSub.publish('pageUpdated', { pageUpdated: newDocument })
        const entityMap = args.content.entityMap
        const blocks = args.content.blocks

        let linksFromContent = []

        Object.keys(entityMap).forEach(async (key) => {
          const entity = entityMap[key]
          const pageKey = entity.data.pageKey
          if (entity.type === 'PAGELINK') {
            const block = blocks.find((b) => {
              const keys = b.entityRanges.map((r) => r.key)
              return keys.includes(Number(key))
            })
            const link = { pageKey, blockKey: block.key }
            linksFromContent.push(link)
          }
        })

        linksFromContent = linksFromContent.reduce((links, currentLink) => {
          const existingLink = links.find(
            (l) => l.pageKey === currentLink.pageKey
          )
          if (existingLink) {
            existingLink.blockKeys.push(currentLink.blockKey)
          } else {
            links.push({
              pageKey: currentLink.pageKey,
              blockKeys: [currentLink.blockKey],
            })
          }

          return links
        }, [])

        const existingLinks = await edgeCollection.outEdges(`Pages/${args.id}`)
        existingLinks.forEach((existingLink) => {
          const contentLink = linksFromContent.find(
            (l) => l.pageKey === existingLinks._key
          )
          if (contentLink) {
            edgeCollection.update(existingLink._key, {
              blockKey: contentLink.blockKeys,
            })
            linksFromContent = linksFromContent.filter(
              (l) => l.pageKey !== contentLink.pageKey
            )
          } else {
            edgeCollection.remove(existingLink._id)
          }
        })

        // using forEach from lodash because I'm lazy
        // and didn't want to setup multiple Promise.all() for other subscriptions
        forEach(linksFromContent, async (link) => {
          try {
            const result = await edgeCollection.save(
              {
                _from: `Pages/${args.id}`,
                _to: `Pages/${link.pageKey}`,
                blockKeys: link.blockKeys,
              },
              { returnNew: true }
            )
            const edge = {
              ...result.new,
              from: result.new._from,
              to: result.new._to,
            }

            pubSub.publish('pageEdgeAdded', { pageEdgeAdded: edge })
          } catch (e) {
            console.log(e)
          }
        })

        return collection.document(newDocument)
      } catch (e) {
        console.log(e)
      }
    },
    createPageEdge: async (parent, args, { db }) => {
      const { source, target, blockKey } = args
      const collection = db.edgeCollection('PageEdges')
      try {
        const edges = []
        const existingEdges = await collection.outEdges(`Pages/${source}`)
        const existingEdge = existingEdges.find((edge) => {
          return edge._to.includes(target)
        })

        if (existingEdge) {
          const existingBlockKeys = existingEdge.blockKeys || []
          existingBlockKeys.push(blockKey)
          const newBlockKeys = uniq(existingBlockKeys)
          const updatedEdge = await collection.update(
            existingEdge._key,
            {
              blockKeys: newBlockKeys,
            },
            { returnNew: true }
          )
          edges.push(updatedEdge.new)
        } else {
          const newEdge = await collection.save({
            _from: `Pages/${source}`,
            _to: `Pages/${target}`,
            blockKeys: [blockKey],
          })
          const edge = await collection.edge(newEdge._id)
          edges.push(edge)
        }

        return edges
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
    pageEdgeAdded: {
      subscribe: () => pubSub.asyncIterator(['pageEdgeAdded']),
    },
  },
}

export default resolvers