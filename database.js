const { Database } = require('arangojs')
const config = require('./config')

const makeDb = async () => {
  const db = new Database({
    url: config.database.host,
  })

  try {
    const useDb = () => {
      db.useDatabase(config.database.name)
      db.useBasicAuth('root', '')
    }

    useDb()
    const exists = await db.exists()

    if (!exists) {
      console.log('nope')
      db.useDatabase('_system')
      await db.createDatabase(config.database.name, [{ username: 'root' }])
      useDb()
    }

    const pageCollection = db.collection('Pages')
    const pageCollectionExists = await pageCollection.exists()

    if (!pageCollectionExists) {
      pageCollection.create()
    }

    const pageEdgeCollection = db.edgeCollection('PageEdges')
    const pageEdgeCollectionExists = await pageEdgeCollection.exists()

    if (!pageEdgeCollectionExists) {
      pageEdgeCollection.create()
    }

    const searchView = db.arangoSearchView('pageSearch')
    const searchViewExists = await searchView.exists()

    if (!searchViewExists) {
      searchView.create()
    }

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
    await searchView.setProperties(viewProps)

    return db
  } catch (e) {
    console.log('ERRRROR', e)
  }
}

module.exports = makeDb
