import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { onError } from "apollo-link-error";
import { ApolloLink, split } from "apollo-link";
import { WebSocketLink } from "apollo-link-ws";
import { getMainDefinition } from "apollo-utilities";
import { SubscriptionClient } from "subscriptions-transport-ws";
import fetch from "node-fetch";

const wsLink = process.browser
  ? new WebSocketLink({
      uri: `ws://localhost:3000/graphql`,
      options: {
        reconnect: true,
      },
    })
  : null;

const httpLink = new HttpLink({
  uri: "http://localhost:3000/graphql",
  credentials: "same-origin",
  fetch,
});

const link = process.browser
  ? split(
      // split based on operation type
      ({ query }) => {
        const definition = getMainDefinition(query);
        console.log(definition);
        return (
          definition.kind === "OperationDefinition" &&
          definition.operation === "subscription"
        );
      },
      wsLink,
      httpLink
    )
  : httpLink;

const client = new ApolloClient({
  link: ApolloLink.from([
    onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors)
        graphQLErrors.forEach(({ message, locations, path }) =>
          console.log(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
          )
        );
      if (networkError) console.log(`[Network error]: ${networkError}`);
    }),
    link,
  ]),
  cache: new InMemoryCache(),
  ssrMode: process.browser ? false : true,
});

export default client;
