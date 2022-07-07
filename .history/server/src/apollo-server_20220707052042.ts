import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { ApolloServer, ExpressContext, gql } from 'apollo-server-express';
import * as express from 'express';
import { Server } from 'http';
import Db from './db';
export async function createApolloServer(
  db: Db, //won't be using it now
  httpServer: Server,
  app: express.Application
): Promise<ApolloServer<ExpressContext>> {
  //graphql schema
  //Query is special. It's a type of request like GET in a REST API.
  //by default values and nullable (they can return null). You have to specify that they are not nullable.
  //so the doctors schedule it's something we want to be nullable (empty argument)
  //[Suggestion!]! outer ! means it has to return an array. inner ! means none of the elements in the array can be null.
  //so it can return an empty array. as it's returning the array, and none of the objects is null
  //Primitive types for these are: String, Boolean, Int, Float, ID
  const typeDefs = gql`
    type Query {
      currentUser: User!
      suggestions: [Suggestion!]!
    }
    type User {
      id: String!
      name: String!
      handle: String!
      coverUrl: String!
      avatarUrl: String!
      createdAt: String!
      updatedAt: String!
    }
    type Suggestion {
      name: String!
      handle: String!
      avatarUrl: String!
      reason: String!
    }
  `;

  const resolvers = {
    Query: {
      currentUser: () => {
        return {
          id: '123',
          name: 'John Doe',
          handle: 'johndoe',
          coverUrl: '',
          avatarUrl: '',
          createdAt: '',
          updatedAt: '',
        };
      },
      suggestions: () => {
        return [];
      },
    },
  };

  const server = new ApolloServer({
    //apollo server
    typeDefs,
    resolvers,
    context: () => ({ db }), //context (express-concept) object always available in any of our resolvers (one of the arguments you automatically get)
    //
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }), //this is to wire this apollo server to the http server as middleware
    ],
  });
  await server.start(); //start the apollo server
  server.applyMiddleware({ app }); //installs this server into the main express app
  return server; //returns the apollo server object in case we might need it somewhere else
}
