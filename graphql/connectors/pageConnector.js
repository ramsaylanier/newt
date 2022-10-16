const { aql } = require('arangojs')
const forEach = require('lodash/forEach')

const getPage = async (f, db) => {
  const collection = db.collection('Pages')
  try {
    const filter = aql.literal(`FILTER ${f}`)
    const query = await db.query(aql`
          FOR page IN ${collection}
          ${filter}
          RETURN page
        `)

    return query.next()
  } catch (e) {
    console.log(e)
  }
}

const getGraph = async (graphName, db) => {
  const graph = await db.graph(graphName)
  const edges = await graph.edgeCollection('PageEdges').all()
  const nodes = await graph.vertexCollection('Pages').all()
  return {
    name: graphName,
    edges: edges._result,
    nodes: nodes._result,
  }
}

const updatePageContent = async (args, db, pusher) => {
  const collection = db.collection('Pages')
  const edgeCollection = db.collection('PageEdges')

  try {
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

        pusher.trigger('subscription', 'pageEdgeAdded', {
          message: { ...edge, __typename: 'PageEdge' },
        })
      } catch (e) {
        console.log(e)
      }
    })

    return collection.document(newDocument)
  } catch (e) {
    console.log(e)
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
