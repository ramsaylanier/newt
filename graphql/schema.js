import { makeExecutableSchema } from 'graphql-tools'
import typeDefs from './typeDefs'

export default makeExecutableSchema({
  typeDefs,
})
