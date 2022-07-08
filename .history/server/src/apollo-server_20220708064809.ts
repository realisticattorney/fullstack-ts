import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { ApolloServer, ExpressContext } from 'apollo-server-express';
import * as express from 'express';
import { Server } from 'http';
import Db from './db';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { loadSchemaSync } from '@graphql-tools/load';
import { addResolversToSchema } from '@graphql-tools/schema';
import { GRAPHQL_SCHEMA_PATH } from './constants'; //this is just a constant with the path to the schema
import resolvers, { TwitterResolverContext } from './resolvers'; //these are the resolvers

const SCHEMA = loadSchemaSync(GRAPHQL_SCHEMA_PATH, {
  //this loads the schema, transforms it into the right data structure
  loaders: [new GraphQLFileLoader()], //this loader is designed to parse .graphql files returning an object
});

export async function createApolloServer( ///these are the arguments for the ApolloServer constructor
  //_db: Db, //won't be using it now
  db: Db,
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

  const server = new ApolloServer({
    //apollo server

    schema: addResolversToSchema({
      schema: SCHEMA,
      resolvers, //moved resolver to addResolversToSchema
    }),
    // (): TwitterResolverContext => ({ db })//this is what that type is checking for
    context: (): TwitterResolverContext => ({
      db,
      dbTweetCache: {},
      dbTweetToFavoriteCountMap: {},
      dbUserCach: {},
    }), //context (express-concept) object always available in any of our resolvers (one of the arguments you automatically get)
    //we'll use it as a memory to store data from one method from the Query resolver to another (like finding a tweet but then use that twwet id to find its users etc)
    //but context can be either a cb function that returns an object, or an object. If it's just an object it remains the same throughout the whole server (things will be left in memory). But if it's a cb function, it will be a clean slate for every call. Useful if you want to use it for an Oauth token or something stateless so it doesn't leak between requests.
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }), //this is to wire this apollo server to the http server as middleware
    ],
  });
  await server.start(); //start the apollo server
  server.applyMiddleware({ app }); //installs this server into the main express app
  return server; //returns the apollo server object in case we might need it somewhere else
}

// query CurrentUser {
//   currentUser {
//     name
//   }
//   suggestions { //you don't need to make N requests for N resources
//     name
//   }
// }

//next step: modularize the code. Getting the schema out
//onto the root of our project. Why? Because these types will be the single source of truth for any types going over the network back and forth
//so they will be used by the client app as well.

//move the schema to a .graphql file. Import it, to this js file, compile it, load it (loadSchemaSync) returning a schema object like gql` ...`
//then add the resolvers to the schema.

//Getting the resolvers out and breaking them down into subobjects.

//Now we will add types to our resolvers
//right now, my resolvers can return whatever they want they're not restricted to what the schema says.
//For that we will generate Typescript code from our graphql schema
//as our resolvers are in... Typescript.
//cd server
//yarn codegen
//what just happened? we generated a new file called resolvers-types.ts
//these generated files are something you shouldn't touch
//we you want them to be up to date as your schema evolves, you just use the same script to generate them again
//we've got models such as User, Tweet, etc. We've have QueryResolvers
//and subscription stuff, like events. pretty advanced stuff.

//we imported the resolvers-types.generated file into our resolvers.ts file

// export interface TwitterResolverContext {
//   db: Db;
// }

//now that we have this context type, we can use it in our resolvers wiht autocompletion (it's the third argument)
//(_, __, { db: _db }) => {
//_ and __ mean unused, and typescript doesnt warn us about them.

//from what I guess, the context object interface was set on resolvers.ts, the I don't need to put a ! on TS to say hey, that's mandatory.. So when I added a thing: any[] property aside from db, I was required the context cb function to return a {db, thing}
//and I was able to use that thing array on the resolvers (again, from the third argument which is the context object) aaand, the thing, being an array, already offered me the array methods for free.
