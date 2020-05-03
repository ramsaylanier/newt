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

module.exports = { getPage }
