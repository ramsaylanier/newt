const db = require('./database')
const { aql } = require('arangojs')

const getPage = async (f) => {
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

const getGraph = async (graphName) => {
  const graph = await db.graph(graphName)
  const edges = await graph.edgeCollection('PageEdges').all()
  const nodes = await graph.vertexCollection('Pages').all()
  return {
    name: graphName,
    edges: edges._result,
    nodes: nodes._result,
  }
}

module.exports = { getPage, getGraph }
