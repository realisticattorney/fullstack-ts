import Query from './resolvers/Query';
import { Resolvers } from './resolvers-types.generated';
import Db, { DbTweet, DbUser } from './db';
export interface TwitterResolverContext {
  db: Db;
  //Why do we use these caches in our context?
  //let's talk about the n + 1 query problem.
  //say we need a list of 100 tweets and in order to get it we need first to fetch the authors of each of those 1
  dbTweetCache: Record<string, DbTweet>; //Record is a utility that can be used to map the properties of a type to another type.
  dbUserCache: Record<string, DbUser>;
  dbTweetToFavoriteCountMap: Record<string, number>;
}

const resolvers: Resolvers<TwitterResolverContext> = {
  Query,
};

export default resolvers;

// const resolvers: Resolvers = {
//   Query,
// }; this stills let me do what I want with Query.ts

//Record:

// interface CatInfo {
//   age: number;
//   breed: string;
// }

// type CatName = "miffy" | "boris" | "mordred";

// const cats: Record<CatName, CatInfo> = {
//   miffy: { age: 10, breed: "Persian" },    //miffy is the key (a CatName type) and the value is the CatInfo
//   boris: { age: 5, breed: "Maine Coon" },
//   mordred: { age: 16, breed: "British Shorthair" },
// };
