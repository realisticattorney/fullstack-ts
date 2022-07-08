import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import App from './App';

import {
  ApolloClient, //the vanilla JS that makes the graphQL queries
  ApolloProvider, //component that uses the React context API to make it possible to fire off queries throughout the app
  InMemoryCache, //helps us to cache the response of the exact same query needed in multiple component so that I doesn't have to make multiple queries?
} from '@apollo/client';

const client = new ApolloClient({
  uri: 'http://localhost:3000/graphql', //uri specifies the URL of our GraphQL server.
  cache: new InMemoryCache(),
});

const app = document.getElementById('app');

const ErrorFallback: React.ComponentType<FallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
};

declare global {
  interface NodeModule {
    hot: {
      accept(cb?: () => void): void;
    };
  }
}

if (module.hot) {
  module.hot.accept();
}

ReactDOM.render(
  <ErrorBoundary
    FallbackComponent={ErrorFallback}
    onReset={() => {
      // reset the state of your app so the error doesn't happen again
    }}
  >
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </ErrorBoundary>,
  app
);

//Error Boundary in React is a catch (so we don't watch the console for the error, just the rendered DOM)
//ApolloProvider is a function that takes a client as props and returns the App, Making methods from the clinet object available to the App (makeQueries etc.)
 

//In an application that uses React, Node, and GraphQL on both the front and back end, there are four separate applications: the React application, the Node application, the GraphQL server, and the ApolloClient object. 

//So the apolloClient returns an object to make those queries to the GraphQL/Apollo server. and we have a wrapper component to wrap the entire application and make those queries and responses available to the entire application.

//the generation of the types is done by a libraby called graphql-codegen or something. and there's a codegen.yml which is ofc to configure the script to re