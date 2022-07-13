import Query from './resolvers/Query';
import Mutation from './resolvers/Mutation';
import { Resolvers } from './resolvers-types.generated';
import Db, { DbTweet, DbUser } from './db';
import tweetTwitterResolver from './resolvers/Tweet';
import userTwitterResolver from './resolvers/User';
export interface TwitterResolverContext {
  db: Db;
  //Why do we use these caches in our context?
  //let's talk about the n + 1 query problem.
  //say we need a list of 100 tweets and in order to get it we need first to fetch the authors of each of those 100 tweets.
  //and let's say all the tweets we need are from the same author. In a naive way we'd get the id of the author (first fetch)
  //then we'd go to our database to get each of the tweets (+ 100 retrieves)
  //kind of like when you trade time complexity for some space complexity to avoid quadratic time, getting linear time and complexity instead.
  dbTweetCache: Record<string, DbTweet>; //Record is a utility that can be used to map the properties of a type to another type.
  dbUserCache: Record<string, DbUser>;
  dbTweetToFavoriteCountMap: Record<string, number>;
  db
   //this one, when iterating once over the tweets array, will create a hashmap with the favorite count for each tweet.
  //we need a context object per relationship
  
}

const resolvers: Resolvers<TwitterResolverContext> = {
  Query,
  Tweet: tweetTwitterResolver,
  User: userTwitterResolver,
  Mutation,
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

//Query.tweets: [Tweet!]!
//Tweet entity has a stats prop
//so stats is Tweet.stats: TweetStats (entity)
