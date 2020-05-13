const express = require('express')
const { ApolloServer, gql } = require('apollo-server-express')
const { createServer } = require('http')
const typeDefs = require('./server/typeDefs')
const resolvers = require('./server/resolvers')
const cors = require('cors')

const PORT = parseInt(process.env.PORT, 10) || 4000
const dev = process.env.NODE_ENV !== 'production'

const app = express()
app.use(cors())
const server = new ApolloServer({ typeDefs, resolvers })
server.applyMiddleware({ app })

const httpServer = createServer(server)
server.installSubscriptionHandlers(httpServer)

httpServer.listen(PORT, () => {
  console.log(
    `🚀 Server ready at http://localhost:${PORT}${apolloServer.graphqlPath}`
  )
  console.log(
    `🚀 Subscriptions ready at ws://localhost:${PORT}${apolloServer.subscriptionsPath}`
  )
})
