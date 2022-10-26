import { aql } from 'arangojs'
import { forEach } from 'lodash'

const getPage = async (filter, db, user) => {
  const collection = db.collection('Pages')

  try {
    const cursor = await db.query(aql`
          FOR page IN ${collection}
          FILTER ${aql.literal(filter)}
            RETURN page
        `)

    const result = cursor.next()

    if (!result.private || result.ownerId === user.sub) {
      return result
    } else {
      throw Error('No access')
    }
  } catch (e) {
    console.log(e)
  }
}

const getGraph = async (graphName, db, user) => {
  try {
    const graph = await db.graph(graphName)
    const { collection: edgeCollection } = await graph.edgeCollection(
      'PageEdges'
    )
    const { collection: nodeCollection } = await graph.vertexCollection('Pages')
    const nodesCursor = await db.query(
      aql`
      FOR node IN ${nodeCollection}
      FILTER node.ownerId == ${user.sub} || !node.private
      RETURN node
      `
    )
    const nodes = await nodesCursor.all()
    const nodeIds = nodes.map((n) => n._id)
    const edgeCursor = await db.query(
      aql`
          FOR edge IN ${edgeCollection}
          FILTER edge._from IN ${nodeIds} && edge._to IN ${nodeIds}
            RETURN edge
        `
    )
    const edges = await edgeCursor.all()

    return {
      name: graphName,
      edges,
      nodes,
    }
  } catch (e) {
    console.log(e)
  }
}

const updatePageContent = async (args, db, pusher) => {
  try {
    const collection = await db.collection('Pages')
    const edgeCollection = await db.collection('PageEdges')
    const document = await collection.document(args.id)
    const update = await collection.update(document._key, {
      content: args.content,
      lastEdited: new Date(),
    })
    const newDocument = await collection.document(update)
    const entityMap = args.content.entityMap
    const blocks = args.content.blocks

    let linksFromContent = []

    Object.keys(entityMap).forEach(async (key) => {
      const entity = entityMap[key]
      if (entity.type === 'PAGELINK') {
        const pageKey = entity.data.pageKey
        const block = blocks.find((b) => {
          const keys = b.entityRanges.map((r) => r.key)
          return keys.includes(Number(key))
        })
        const link = { pageKey, blockKey: block.key }
        linksFromContent.push(link)
      }
    })

    linksFromContent = linksFromContent.reduce((links, currentLink) => {
      const existingLink = links.find((l) => l.pageKey === currentLink.pageKey)
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

    console.log({ linksFromContent })

    // update edges
    const { edges } = await edgeCollection.outEdges(`Pages/${args.id}`)
    edges.forEach((edge) => {
      const contentLink = linksFromContent.find(
        (l) => `Pages/${l.pageKey}` === edge._to
      )
      if (contentLink) {
        console.log({ contentLink })
        edgeCollection.update(edge._key, {
          blockKey: contentLink.blockKeys,
        })
        linksFromContent = linksFromContent.filter(
          (l) => l.pageKey !== contentLink.pageKey
        )
      } else {
        edgeCollection.remove(edge._id)
      }
    })

    console.log({ linksFromContent })

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

        pusher.trigger('subscription', 'pageEdgeAdded', {
          message: { ...edge, __typename: 'PageEdge' },
        })
      } catch (e) {
        console.log(e)
      }
    })

    return await collection.document(newDocument)
  } catch (e) {
    console.trace(e)
  }
}

const updatePageSettings = async (args, db, user) => {
  const collection = db.collection('Pages')

  try {
    const document = await collection.document(args.id)
    if (document.ownerId !== user.sub) {
      throw Error("You aren't the owner of this page")
    }

    const update = await collection.update(document._key, args.update)
    const newDocument = await collection.document(update)
    return collection.document(newDocument)
  } catch (e) {
    console.log(e)
  }
}

module.exports = { getPage, getGraph, updatePageContent, updatePageSettings }
