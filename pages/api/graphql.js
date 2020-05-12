import { ApolloServer } from 'apollo-server-micro'
import typeDefs from '../../graphql/typeDefs'
import resolvers from '../../graphql/resolvers'
import database from '../../database'

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context(ctx) {
    return { ...ctx, db: database }
  },
})

export const config = {
  api: {
    bodyParser: false,
  },
}

export default apolloServer.createHandler({ path: '/api/graphql' })
