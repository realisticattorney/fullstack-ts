import Query from './resolvers/Query';
import { Resolvers } from './resolvers-types.generated';
import Db, { DbTweet, DbUser } from './db';
export interface TwitterResolverContext {
  db: Db;
  dbTweetCache: Record<string, DbTweet>; //Record is a utility can be used to map the properties of a type to another type.
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
