const isProd = process.env.NODE_ENV === 'production'
let databaseName, databaseHost, graphqlHost

if (isProd) {
  databaseName = process.env.DATABASE_NAME
  databaseHost = process.env.DATABASE_HOST
  graphqlHost = process.env.GRAPHQL_HOST
} else {
  databaseName = 'newt'
  databaseHost = 'http://localhost:8529'
  graphqlHost = 'localhost:4000/graphql'
}

module.exports = {
  database: {
    host: databaseHost,
    name: databaseName,
  },
  graphql: {
    host: graphqlHost,
  },
}
