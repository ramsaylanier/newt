import {
  PageFieldResolvers,
  PageQueryResolvers,
  PageMutationResolvers,
} from './resolvers/pageResolvers.js'

import { getPage, getGraph } from './connectors/pageConnector.js'
import { getUserById } from './connectors/authConnector.js'
import { aql } from 'arangojs'
import { uniq } from 'lodash'

const resolvers = {
  User: {
    pages: async (parent, args, { db }) => {
      let filter = `FILTER page.ownerId == '${parent.id}'`
      let limit = ''
      try {
        const collection = db.view('pageSearch')
        const { filters = [], count = 25, offset = 0 } = args
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

        const pages = []
        for await (const page of query) {
          pages.push(page)
        }

        return pages
      } catch (e) {
        console.log(e)
      }
    },
  },
  Page: PageFieldResolvers,
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
    currentUser: (parent, args, { user }) => {
      if (!user) return null
      const { sub, ...rest } = user
      return {
        id: sub,
        ...rest,
      }
    },
    user: async (parent, args) => {
      const user = await getUserById(args.userId)
      return user
    },
    ...PageQueryResolvers,
    graph: async (parent, args, { db }) => {
      return getGraph(args.name, db)
    },
  },
  Mutation: {
    ...PageMutationResolvers,
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
  // Subscription: {
  //   pageAdded: {
  //     subscribe: (parent, args, context) => {
  //       return pubSub.asyncIterator(['pageAdded'])
  //     },
  //   },
  //   // pageDeleted: {
  //   //   subscribe: () => pubSub.asyncIterator(['pageDeleted']),
  //   // },
  //   // pageEdgeAdded: {
  //   //   subscribe: () => pubSub.asyncIterator(['pageEdgeAdded']),
  //   // },
  // },
}

export default resolvers
