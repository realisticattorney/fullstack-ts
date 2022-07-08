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
//the schema (gql`...` //in a tag template literal) describes our types and our queries. So on one hand it has the equivalent of the set of interfaces in typescript. But it also has the type Query, which is equivalent as to state the HTTP VERBS in REST APIs. So the methods inside query are the HTTP VERBS, although much more specific. And these methods, which are the types for the resolvers of the same name, here indicates the RETURN TYPE of such queries. The rest of the types (type User, type Suggestion) will tell you the properties and types of the properties of the DATABASE OBJECTS (users, suggestions).
//!!!!
//The types for entities (eg. type User) are used to create the models that will be stored in the database. The types for the properties of the type Query (currentUser: User!) are used to specify the fields that will be exposed in the GraphQL API.
// The types for entities such as type User are the types that are used to represent the data that is stored in the database. The types for the properties of the type Query are the types that are used to represent the data that is returned from the GraphQL API.
//!!!!
//the plugin lets us wire this apollo server with express as a middleware
//we start the apollo server
//then user appliMiddleware(app) to install it into the express app
//then it returns the Apollo server into the main() function that's creating the express server
//we import this function from the server/index.ts file and call it in the main() function.
//the Apollo server is a middleware that will be called on every request.
//NOW WE're in THE APOLLO SERVER GUI: we don't have any resolvers yet (nothing that will return anything for the schema used in this apollo server) but we do have a schema. The schema, at runtime (when there's an incoming request for the query currentUser I made from the apollo server gui), will check that I can't return a non nullable field and that's the error. So in this case the GraphQL infrarstructure that's part of the Apollo server will return the error. At compile time, it will be the type information that is built from the schema, and you will have typescript doing the enforcement (so the generated types that I see checking the types when I'm writing the resolvers, for instance).
//so our test query failed. Now will make the resolvers. These functions reads parts of the requests (equivalent to the /:id, for instance, and the function itself would be like GET /user, for instance). So each resolver is a small part of 







//
//
//
//
//
//
//
// When there's an incoming request to an Apollo server, where and how the type enforcement happens?
// The GraphQL schema enforces them.
//  The resolvers are responsible for ensuring that the data that is returned from the GraphQL API conforms to the types that are defined in the schema.
