This is an minimal example project to add [Apollos GraphQL Client](https://www.apollographql.com/apollo-client) to [Next.js](https://nextjs.org/) with easy server side rendering (SSR) and automatic data-fetching.

## Motivation

The official example [with-apollo](https://github.com/vercel/next.js/tree/canary/examples/with-apollo) shows how to enable SSR, but it requires the user to fetch all required data manually in `getServerSideProps`. While this is excellent from a performance perspective, the developer experience leaves something to be desired.

This example uses two APIs that are discouraged by the Next.js Team but are very powerful in combination:

- Next.js' [`getInitialProps`](https://nextjs.org/docs/api-reference/data-fetching/get-initial-props)
- Apollo's [`getDataFromTree`](https://www.apollographql.com/docs/react/performance/server-side-rendering/#executing-queries-with-getdatafromtree) - ([Discussion](https://github.com/vercel/next.js/issues/21984#issuecomment-781867228) about it being discouraged).

`getDataFromTree` allows your application to automatically resolve all GraphQl Queries (even nested) needed for a page without having to declare and execute them explicitly beforehand. It adds a performance penalty, but the developer experience is nice.

As the [old example](https://github.com/vercel/next.js/blob/7d038dfef15c4bba3cadc29f11e9fa0063b9d1d3/examples/with-apollo/lib/apollo.js) requires a HOC and is pretty outdated, this repository shows an modern implementation that is much simpler.

If you have any suggestions to further improve this example or encountered any issue, please don't hesitate to let me know and open an issue/PR.

## How it works

We use a [custom \_app](https://nextjs.org/docs/advanced-features/custom-app) that does several things:

- Create a ApolloClient instance for each request
- Call a page's `getInitialProps` (if defined) to fetch custom `pageProps`
- Use `getDataWithTree` to render the whole `AppTree` and resolve all GraphQL Queries
- Extract ApolloClient's cache (with all the required data) and pass it to the client
- Render the application on the server and send the result to the client
- Initialize a new ApolloClient instance on the client with the extracted cache as `initialState`
- Next.js can hydrate the application without the need to refetch any data

## Caveats

- The use of `getInitialProps` in `_app` disables Automatic Static Optimization for all pages
- You have to careful about `getInitialProps` as it may be called either on the server, or on the client. This removes the ability to use Node specific libraries/API in many cases.
- `getDataFromTree` renders the complete App multiple times, depending on the amount of nested queries. This adds a measureble performance impact for SSR
- Slow Queries in Components that aren't always obvious will cause SSR the be slow too. Use `ssr: false` to move the execution to the client.

## Future

As Next.js has just published their [Layouts RFC](https://nextjs.org/blog/layouts-rfc) and with the release of Next 13 showed a working implementation with their new [`app` directory](https://nextjs.org/blog/next-13#new-app-directory-beta) a solution like this will soon not be needed and will both have better performance and better DX. Apollo is also actively [thinking about their solution](https://github.com/apollographql/apollo-client/issues/10231) to support React 18 and Suspense. Sadly it will take some time before these solutions are production ready, but I'm very happy for all the work and development that is currently happening in this problem space.

## Additional ressource

- [next-apollo-ssr](https://github.com/shshaw/next-apollo-ssr) Similar but different solution
