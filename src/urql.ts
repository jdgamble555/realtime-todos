import { SubscriptionClient } from "subscriptions-transport-ws";
import {
  createClient,
  defaultExchanges,
  subscriptionExchange,
  fetchExchange,
} from "@urql/svelte";
import * as config from "./config.json";
import { getToken } from "./firebase";

import { pipe, mergeMap, fromPromise, fromValue, map } from "wonka";
import type { Exchange, Operation } from "urql";

// allow for async headers...
const isPromise = (value: any) => value && typeof value.then === "function";

const fetchOptionsExchange = (fn: any): Exchange => ({ forward }) => (ops$) => {
  return pipe(
    ops$,
    mergeMap((operation: Operation) => {
      const result = fn(operation.context.fetchOptions);
      return pipe(
        isPromise(result) ? fromPromise(result) : fromValue(result),
        map((fetchOptions: RequestInit | (() => RequestInit)) => ({
          ...operation,
          context: { ...operation.context, fetchOptions },
        }))
      );
    }),
    forward
  );
};

const endPoint = config.graphqlUrl;

const getHeaders = async () => {
  return {
    "X-Auth-Token": await getToken(),
  };
};

const subscriptionClient = new SubscriptionClient(`wss://${endPoint}`, {
  reconnect: true,
  lazy: true,
  connectionParams: async () => {
    return await getHeaders();
  },
});

export const client = createClient({
  url: `https://${endPoint}`,
  exchanges: [
    ...defaultExchanges,
    subscriptionExchange({
      forwardSubscription(operation) {
        return subscriptionClient.request(operation);
      },
    }),
    fetchOptionsExchange(async (fetchOptions: any) => {
      return {
        ...fetchOptions,
        headers: async () => {
          return await getHeaders();
        },
      };
    }),
    fetchExchange,
  ],
});
