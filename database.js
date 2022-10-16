const { Database } = require('arangojs')

const host = process.env.DATABASE_HOST
const databaseName = process.env.DATABASE_NAME
const username = process.env.DATABASE_USERNAME
const password = process.env.DATABASE_PASSWORD || ''

const makeDb = async () => {
  const db = new Database({
    url: host,
    databaseName,
    auth: { username, password },
  })

  try {
    const useDb = () => {
      db.useDatabase(name)
      db.useBasicAuth('root', password)
    }

    // useDb()
    const exists = await db.exists()

    if (!exists) {
      db.useDatabase('_system')
      await db.createDatabase(name, [{ username }])
      useDb()
    }

    const pageCollection = db.collection('Pages')
    const pageCollectionExists = await pageCollection.exists()

    if (!pageCollectionExists) {
      pageCollection.create()
    }

    const pageEdgeCollection = db.collection('PageEdges')
    const pageEdgeCollectionExists = await pageEdgeCollection.exists()

    if (!pageEdgeCollectionExists) {
      pageEdgeCollection.create()
    }

    const searchView = db.view('pageSearch')
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
    await searchView.replaceProperties(viewProps)

    return db
  } catch (e) {
    console.log('ERRRROR', e)
  }
}

module.exports = makeDb
