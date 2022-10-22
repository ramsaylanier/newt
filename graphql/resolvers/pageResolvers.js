import { getUserById } from '../connectors/authConnector.js'
import {
  getPage,
  updatePageContent,
  updatePageSettings,
} from '../connectors/pageConnector.js'
import { aql } from 'arangojs'

import { List } from 'immutable'

import {
  convertFromRaw,
  Modifier,
  ContentBlock,
  SelectionState,
  convertToRaw,
  genKey,
} from 'draft-js'

export const PageFieldResolvers = {
  edges: async (parent, args, { db, user }) => {
    try {
      const collection = await db.collection('PageEdges')
      console.log({ collection })
      const cursor = await db.query(aql`
        FOR edge IN ${collection}
        FILTER edge._to == ${parent._id} && edge._to
          FOR page IN Pages FILTER page._id == edge._from
          RETURN {edge, page}
      `)

      const result = await cursor.all()

      return result
        .filter((r) => {
          return r.page.ownerId === user.sub || !r.page.private
        })
        .map((r) => r.edge)
    } catch (e) {
      console.log(e)
    }
  },
  owner: async (parent) => {
    const ownerId = parent.ownerId
    const owner = await getUserById(ownerId)
    return owner
  },
}

export const PageQueryResolvers = {
  page: async (parent, args, { db, user }) => {
    return getPage(args.filter, db, user)
  },
}

export const PageMutationResolvers = {
  createPage: async (parent, args, { db, user }) => {
    const collection = db.collection('Pages')
    if (!user) return
    try {
      const newPage = await collection.save({
        title: args.title,
        lastEdited: new Date(),
        ownerId: user.sub,
        private: false,
      })
      return await collection.document(newPage)
    } catch (e) {
      console.log(e)
    }
  },
  deletePage: async (parent, args, { db, user }) => {
    if (!user) return null
    const collection = db.collection('Pages')
    try {
      const document = await collection.document(args.id)

      if (document.ownerId !== user.sub) {
        throw Error("You aren't the owner")
      }

      collection.remove(document._key)
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
  addSelectionToPageContent: async (parent, args, { db, pusher, user }) => {
    try {
      const { selection, pageId, source } = args
      const page = await getPage(`page._id == '${args.pageId}'`, db, user)
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
}
