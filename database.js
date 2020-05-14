const { Database } = require('arangojs')

const host = process.env.DATABASE_HOST
const name = process.env.DATABASE_NAME

const makeDb = async () => {
  const db = new Database({
    url: host,
  })

  try {
    const useDb = () => {
      db.useDatabase(name)
      db.useBasicAuth('root', '')
    }

    useDb()
    const exists = await db.exists()

    if (!exists) {
      console.log('nope')
      db.useDatabase('_system')
      await db.createDatabase(name, [{ username: 'root' }])
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
