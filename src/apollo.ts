import ApolloClient from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { WebSocketLink } from "apollo-link-ws";
import { setContext } from "apollo-link-context";
import { onError } from "apollo-link-error";
import { split, ApolloLink } from "apollo-link";
import { createHttpLink } from "apollo-link-http";
import { getMainDefinition } from "apollo-utilities";
import { getToken } from "./firebase";
import * as config from "./config.json";

const endpoint = config.graphqlUrl;

const getHeaders = async () => {
  return {
    "X-Auth-Token": await getToken(),
  };
};

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.map(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );
    if (networkError) {
      console.log(`[Network error]: ${networkError}`);
    }
  }
});

const ws = new WebSocketLink({
  uri: `wss://${endpoint}`,
  options: {
    reconnect: true,
    lazy: true,
    connectionParams: async () => {
      return await getHeaders();
    },
  },
});

const http = ApolloLink.from([
  setContext(async () => {
    return {
      headers: await getHeaders(),
    };
  }),
  createHttpLink({
    uri: `https://${endpoint}`,
  }),
]);

const link = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  ws,
  http
);

export const client = new ApolloClient({
  link: errorLink.concat(link),
  cache: new InMemoryCache(),
}) as any;
