const { Database, aql } = require('arangojs')
const db = new Database({ url: 'http://localhost:8529' })

async function init() {
  db.useDatabase('nkg')
  db.useBasicAuth('root', '')
  const searchView = db.arangoSearchView('pageSearch')
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
}

init()

module.exports = db
