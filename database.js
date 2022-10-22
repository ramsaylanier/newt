import { Database } from 'arangojs'

const host = process.env.DATABASE_HOST
const databaseName = process.env.DATABASE_NAME
const username = process.env.DATABASE_USERNAME
const password = process.env.DATABASE_PASSWORD || ''

export const GRAPH_NAME = 'pagesGraph'

export const makeDb = async () => {
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
      db.createEdgeCollection('PageEdges')
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

    const graph = db.graph(GRAPH_NAME)
    const graphExists = await graph.exists()

    if (!graphExists) {
      graph.create([
        {
          collection: 'PageEdges',
          from: ['Pages'],
          to: ['Pages'],
        },
      ])
    }

    return db
  } catch (e) {
    console.log('ERRRROR', e)
  }
}
