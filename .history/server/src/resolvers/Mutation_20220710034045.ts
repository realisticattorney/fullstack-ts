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
    //the database has a method to create tweets, that takes care of most fields (e.g. createAt, updatedAt, and id). Usually you want your database to be in charge of creating the id. For the timestamps creates just before the tweet object is persisted, you could create a timestamp and serialize it twice (e.g. createAt and updatedAt). Idk what that even means. We're using the uuid (universal unique identifier) library to create the id.
    const dbTweetMap = (dbTweetCache ||= {});
    dbTweetMap[dbTweet.id] = dbTweet;
    return tweetTransform(dbTweet);
  },
};
export default mutationTwitterResolver;
//"Error: Attempted to find Tweet.author, but the tweet's author (a User) was not found in dbUserCache"
//OK, I know why. The tweet is sent, sure, and from this resolver we go into the Tweet resolver indeed. HOWEVER, the time I've got the authors for the tweets, I was running the tweets resolvers before the Tweet resolver, and tweets resolvers makes a call to the database to get the user and save it in the cache. So when I do a mutation like createTweet resolver, even when I go into Tweet resolvers afterwards, I don't have the 