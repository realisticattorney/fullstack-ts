import { TwitterResolverContext } from '../resolvers';
import { TweetResolvers } from '../resolvers-types.generated';
const tweetTwitterResolver: TweetResolvers<TwitterResolverContext> = {
    //NO DB.CALLS HERE AS THIS IS A PER TWEET BASIS WITHIN FOR EACH LOOPS.
    
  author(tweet, _, { dbUserCache, dbTweetCache }) {
    const dbTweet = dbTweetCache[tweet.id]; 
    if (!dbTweet)
      throw new Error(
        'Attempted to find Tweet.author, but the tweet was not found in dbTweetCache'
      );
    const dbUser = dbUserCache[dbTweet.userId];
    if (!dbUser)
      throw new Error(
        "Attempted to find Tweet.author, but the tweet's author (a User) was not found in dbUserCache"
      );
    return dbUser;
  },
  stats(tweet, _, { dbTweetToFavoriteCountMap }) {
    console.log('dbTweetToFavoriteCountMap', dbTweetToFavoriteCountMap);
    return {
      commentCount: 99,
      retweetCount: 1,
      favoriteCount: dbTweetToFavoriteCountMap[tweet.id] || 0,
    };
  },
};
export default tweetTwitterResolver;
