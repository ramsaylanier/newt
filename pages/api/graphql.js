import { ApolloServer } from 'apollo-server-micro'
import typeDefs from '../../graphql/typeDefs'
import resolvers from '../../graphql/resolvers'
import makeDb from '../../database'

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: async (ctx) => {
    const db = await makeDb()
    return { ...ctx, db }
  },
})

export const config = {
  api: {
    bodyParser: false,
  },
}

export default apolloServer.createHandler({ path: '/api/graphql' })
