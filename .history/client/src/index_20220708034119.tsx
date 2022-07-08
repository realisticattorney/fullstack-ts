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

//the generation of the types is done by a libraby called graphql-codegen or something. and there's a codegen.yml which is ofc to configure the script to search for the graphql files across whole directories and specifying the output file location and what kind of output file to generate (typescript in our case).
//there's a codegen.yml file for this in the server folder. and another one for the client folder. in the servers I have a plugin for typescript-resolvers, and operations generated on the client side. \







//the DB object will be available to anywhere that we're fetching data (in the client and the server, I guess). But in the client, how?
//the schema (gql`...` //in a tag template literal) describes our types and our queries. So on one hand it has the equivalent of the set of interfaces in typescript. But it also has the type Query, which is equivalent as to state the VERBS 
//the plugin lets us wire this apollo server with express as a middleware
//we start the apollo server
//then user appliMiddleware(app) to install it into the express app
//then it returns the Apollo server into the main() function that's creating the express server

