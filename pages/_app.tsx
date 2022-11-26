import {
  ApolloClient,
  ApolloProvider,
  NormalizedCacheObject,
} from "@apollo/client";
import { initializeApollo } from "../lib/apolloClient";
import type { AppContext, AppInitialProps, AppProps } from "next/app";
import type { NextPageContext } from "next/types";

interface CustomAppProps {
  identifier?: number;
  apolloClient?: ApolloClient<NormalizedCacheObject>;
  apolloState?: {};
}

export interface CustomPageContext extends NextPageContext {
  apolloClient: ApolloClient<NormalizedCacheObject>;
}
export interface CustomAppContext extends AppContext {
  ctx: CustomPageContext;
}

const CustomApp = ({
  Component,
  apolloClient,
  apolloState,
  pageProps,
}: AppProps & CustomAppProps) => {
  /** Three options:
   * - rendered in `getDataFromTree` and SSR - existing apolloClient is used to cache all data
   * - rendered in CSR - initialize new client with cache and reuse this client subsequently
   *
   * this client is provided via React Context to all Components and will be used for `useQuery` and `useApolloClient`
   */
  const client = apolloClient ?? initializeApollo(apolloState);

  return (
    <ApolloProvider client={client}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
};

/**
 * This method is called before rendering a page and allows us to collect all the required data in an apolloClient
 */
CustomApp.getInitialProps = async (
  context: CustomAppContext
): Promise<CustomAppProps & AppInitialProps> => {
  const { AppTree, Component, ctx } = context;

  // Initialize ApolloClient, add it to the ctx object so
  // we can use it in `PageComponent.getInitialProp`.
  const apolloClient = (ctx.apolloClient = initializeApollo());

  let pageProps = {};
  if (Component.getInitialProps) {
    // Pass the current client instance to `getInitialProps` of a Component (more specifically a Next.js page)
    pageProps = await Component.getInitialProps(ctx);
  }

  // Only on the server:
  if (typeof window === "undefined") {
    // When redirecting, the response is finished.
    // No point in continuing to render
    if (ctx.res && ctx.res.writableEnded) {
      return { pageProps };
    }

    // Render the complete AppTree and run all GraphQL Queries. This
    // This renders multiple times to resolve even nested query.
    const { getDataFromTree } = await import("@apollo/client/react/ssr");
    try {
      await getDataFromTree(
        <AppTree
          Component={Component}
          apolloClient={apolloClient}
          pageProps={pageProps}
        />,
        apolloClient.cache.extract()
      );
    } catch (error) {
      // Prevent Apollo Client GraphQL errors from crashing SSR.
      // Handle them in components via the data.error prop:
      // https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-query-data-error
      console.error("Error while running `getDataFromTree`", error);
    }
  }

  // Extract query data from the Apollo store
  const apolloState = apolloClient.cache.extract();

  // We send the Apollo Client as a prop to the App to avoid calling initializeApollo() twice in the server.
  // Additionally, we can reuse the established httpLink with the correct headers.
  // The following code will make sure we send the prop as `null` to the browser.
  // @ts-ignore
  apolloClient.toJSON = () => null;

  return {
    pageProps,
    apolloState,
    apolloClient,
  };
};

export default CustomApp;
