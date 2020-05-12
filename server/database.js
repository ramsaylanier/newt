const { Database, aql } = require('arangojs')
const config = require('../config')

console.log(config)

let db = new Database({
  url: config.database.host,
})

const useDatabase = () => {
  db.useDatabase(config.database.name)
  db.useBasicAuth('root', '')
}

const checkExists = async () => {
  const exists = await db.exists()
  if (!exists) {
    db.useDatabase('_system')
    const created = await db.createDatabase(config.database.name, [
      { username: 'root' },
    ])
    if (created) {
      useDatabase()
      checkExists()
    }
  }
}

async function init() {
  try {
    useDatabase()
    checkExists()

    const pageCollection = db.collection('Pages')
    const pageCollectionExists = await pageCollection.exists()

    if (!pageCollectionExists) {
      pageCollection.create()
    }

    const pageEdgeCollection = db.edgeCollection('PageEdges')
    const pageEdgeCollectionExists = await pageEdgeCollection.exists()

    if (!pageCollectionExists) {
      pageEdgeCollection.create()
    }

    const searchView = db.arangoSearchView('pageSearch')
    const searchViewExists = await searchView.exists()

    if (!searchViewExists) {
      searchView.create()
    }

    const data = await searchView.get()
    const viewProps = {
      links: {
        Pages: {
          fields: {
            title: {
              analyzers: ['text_en', 'identity'],
            },
          },
        },
      },
    }
    const result = await searchView.setProperties(viewProps)
  } catch (e) {
    console.log('ERRRROR', e)
  }
}

init()

module.exports = db
