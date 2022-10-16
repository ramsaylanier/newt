import React from 'react'
import withApollo from 'next-with-apollo'
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client'
import { defaultDataIdFromObject } from 'apollo-cache-inmemory'

export default withApollo(
  ({ initialState }) => {
    const cache = new InMemoryCache({
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
    }).restore(initialState)

    return new ApolloClient({
      uri: '/api/graphql',
      credentials: 'same-origin',
      cache,
    })
  },
  {
    render: function Page({ Page, props }) {
      return (
        <ApolloProvider client={props.apollo}>
          <Page {...props} />
        </ApolloProvider>
      )
    },
  }
)
