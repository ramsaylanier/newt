import { makeExecutableSchema } from 'apollo-server-micro'
import typeDefs from './typeDefs'

export default makeExecutableSchema({
  typeDefs,
})
