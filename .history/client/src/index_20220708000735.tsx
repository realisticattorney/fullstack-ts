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
  uri: 'http://localhost:3000/graphql',
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
    <ApolloProvider client={client} > </ApolloClient>
    <App />
  </ErrorBoundary>,
  app
);

//Error Boundary in React is a catch (so we don't watch the console for the error, just the rendered DOM)
