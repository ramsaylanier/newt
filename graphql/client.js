import { ApolloClient } from 'apollo-client'
import { InMemoryCache, defaultDataIdFromObject } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import { onError } from 'apollo-link-error'
import { ApolloLink, split } from 'apollo-link'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import fetch from 'node-fetch'
import config from '../config'

const host = config.graphql.host

const wsLink = process.browser
  ? new WebSocketLink({
      uri: `ws://${host}`,
      options: {
        reconnect: true,
      },
    })
  : null

const httpLink = new HttpLink({
  uri: `http://${host}`,
  credentials: 'same-origin',
  fetch,
})

const link = process.browser
  ? split(
      // split based on operation type
      ({ query }) => {
        const definition = getMainDefinition(query)
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        )
      },
      wsLink,
      httpLink
    )
  : httpLink

const client = new ApolloClient({
  link: ApolloLink.from([
    onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors)
        graphQLErrors.forEach(({ message, locations, path }) =>
          console.log(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
          )
        )
      if (networkError) console.log(`[Network error]: ${networkError}`)
    }),
    link,
  ]),
  cache: new InMemoryCache({
    addTypename: true,
    dataIdFromObject: (object) => {
      switch (object.__typename) {
        case 'Page':
        case 'PageEdge':
          return object ? object._id : null // append `bar` to the `blah` field as the identifier
        default:
          return defaultDataIdFromObject(object) // fall back to default handling
      }
    },
  }),
  ssrMode: process.browser ? false : true,
})

export default client
