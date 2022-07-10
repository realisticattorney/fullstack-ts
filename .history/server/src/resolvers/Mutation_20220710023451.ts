import { tweetTransform } from '../transforms';
import { TwitterResolverContext } from '../resolvers';
import { MutationResolvers } from '../resolvers-types.generated';
const mutationTwitterResolver: MutationResolvers<TwitterResolverContext> = {
  //we're using async here for the first tie as we're writing on the database. It's not quite clear to me how is that we don't we async when fetching from the database.
  async createTweet(_parent, args, { dbTweetCache, db }) {
    const { body, userId } = args;
    const dbTweet = await db.createTweet({
      message: body,
      userId,
    });
    //the database is being written to, so we need to update the cache.
    const dbTweetMap = (dbTweetCache ||= {});
    dbTweetMap[dbTweet.id] = dbTweet;
    return tweetTransform(dbTweet);
  },
};
export default mutationTwitterResolver;
