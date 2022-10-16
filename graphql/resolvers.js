import {
  convertFromRaw,
  Modifier,
  ContentBlock,
  SelectionState,
  convertToRaw,
  genKey,
} from 'draft-js'
import { List } from 'immutable'

const { aql } = require('arangojs')
const {
  getPage,
  getGraph,
  updatePageContent,
  updatePageSettings,
} = require('./connectors/pageConnector.js')
const { getUserById } = require('./connectors/authConnector.js')
const uniq = require('lodash/uniq')

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
  Page: {
    edges: async (parent, args, { db }) => {
      const collection = db.collection('PageEdges')
      try {
        console.log({ parent })
        const outEdges = await collection.outEdges(parent._id)
        const inEdges = await collection.inEdges(parent._id)
        const edges = [...outEdges, ...inEdges]
        console.log({ edges })

        return edges
      } catch (e) {
        console.log(e)
      }
    },
    owner: async (parent) => {
      const ownerId = parent.ownerId
      const owner = await getUserById(ownerId)
      return owner
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
    page: async (parent, args, { db }) => {
      return getPage(args.filter, db)
    },
    graph: async (parent, args, { db }) => {
      return getGraph(args.name, db)
    },
  },
  Mutation: {
    createPage: async (parent, args, { db, pusher, user }) => {
      const collection = db.collection('Pages')
      if (!user) return
      try {
        const newPage = await collection.save({
          title: args.title,
          lastEdited: new Date(),
          ownerId: user.sub,
        })
        const document = await collection.document(newPage)

        pusher &&
          pusher.trigger('subscription', 'pageAdded', {
            message: { ...document, __typename: 'Page' },
          })

        return document
      } catch (e) {
        console.log(e)
      }
    },
    deletePage: async (parent, args, { db, pusher, user }) => {
      if (!user) return null
      const collection = db.collection('Pages')
      try {
        const document = await collection.document(args.id)

        if (document.ownerId !== user.sub) {
          throw Error("You aren't the owner")
        }

        collection.remove(document._key)
        pusher.trigger('subscription', 'pageDeleted', {
          message: { ...document, __typename: 'Page' },
        })
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
        return newDocument
      } catch (e) {
        console.log(e)
      }
    },
    updatePageContent: async (parent, args, { db, pusher }) => {
      return updatePageContent(args, db, pusher)
    },
    updatePageSettings: async (parent, args, { db, user }) => {
      return updatePageSettings(args, db, user)
    },
    addSelectionToPageContent: async (parent, args, { db, pusher }) => {
      try {
        const { selection, pageId, source } = args
        const page = await getPage(`page._id == '${args.pageId}'`, db)
        const newBlock = new ContentBlock({
          key: genKey(),
          type: 'fromExtension',
          text: '',
          data: {
            source,
          },
          characterList: List(),
        })
        page.content.blocks.push(newBlock)
        const contentState = convertFromRaw(page.content)
        const selectionState = SelectionState.createEmpty(newBlock.key)
        const updatedContentState = Modifier.insertText(
          contentState,
          selectionState,
          selection
        )
        const content = convertToRaw(updatedContentState)

        const update = await updatePageContent(
          { content, id: pageId },
          db,
          pusher
        )
        pusher.trigger('subscription', 'contentAddedFromLinker', {
          message: { ...update, __typename: 'Page' },
        })
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
