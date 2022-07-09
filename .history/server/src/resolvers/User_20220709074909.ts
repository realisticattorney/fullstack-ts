import { TwitterResolverContext } from '../resolvers';
import { UserResolvers } from '../resolvers-types.generated';
const userTwitterResolver: UserResolvers<TwitterResolverContext> = {
  stats(user, _, { db }) { //this resolver is for UserStats type, which returns 
    return {
      followingCount: 123,
      followerCount: 456789,
      tweetCount: db.getUserTweets(user.id).length,
    };
  },
};
export default userTwitterResolver;
