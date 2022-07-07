import { ApolloServerPluginDrainHttpServer } from "apollo-server-core"
import {
  ApolloServer,
  ExpressContext,
  gql,
} from "apollo-server-express"
import * as express from "express"
import { Server } from "http"
import Db from "./db"
export async function createApolloServer(
  _db: Db, //won't be using it now
  httpServer: Server,
  app: express.Application
): Promise<ApolloServer<ExpressContext>> {
  //graphql schema
  //Query is special. It's a type of request like GET in 
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
  `
  const server = new ApolloServer({ //apollo server
    typeDefs,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }), //this is to wire this apollo server to the http server as middleware
    ],
  })
  await server.start() //start the apollo server
  server.applyMiddleware({ app }) //installs this server into the main express app 
  return server //returns the apollo server object in case we might need it somewhere else
}