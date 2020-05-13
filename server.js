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

const httpServer = createServer(function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Request-Method', '*')
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET')
  res.setHeader('Access-Control-Allow-Headers', '*')
})
server.installSubscriptionHandlers(httpServer)

httpServer.listen(PORT, () => {
  console.log(
    `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
  )
  console.log(
    `🚀 Subscriptions ready at ws://localhost:${PORT}${server.subscriptionsPath}`
  )
})
