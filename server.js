const express = require('express')
const { ApolloServer } = require('apollo-server-express')
const { createServer } = require('http')
const typeDefs = require('./server/typeDefs')
const resolvers = require('./server/resolvers')
const makeDb = require('./server/database')

const PORT = parseInt(process.env.PORT, 10) || 4000

const app = express()
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async (ctx) => {
    const db = await makeDb()
    return { ...ctx, db }
  },
})
server.applyMiddleware({ app })
const httpServer = createServer(app)
server.installSubscriptionHandlers(httpServer)

httpServer.listen(PORT, () => {
  console.log(
    `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
  )
  console.log(
    `🚀 Subscriptions ready at ws://localhost:${PORT}${server.subscriptionsPath}`
  )
})
