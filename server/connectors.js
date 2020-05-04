const db = require('./database')
const { aql } = require('arangojs')

const getPage = async (pageId) => {
  const collection = db.collection('Pages')
  try {
    const query = await db.query(aql`
          FOR p IN ${collection}
          FILTER p._id == ${pageId}
          RETURN p
        `)
    return query.next()
  } catch (e) {
    console.log(e)
  }
}

const getGraph = async (graphName) => {
  const graph = await db.graph(graphName)
  const edges = await graph.edgeCollection('PageEdges').all()
  const nodes = await graph.vertexCollection('Pages').all()
  console.log(nodes._result)
  return {
    name: graphName,
    edges: edges._result,
    nodes: nodes._result,
  }
}

module.exports = { getPage, getGraph }
