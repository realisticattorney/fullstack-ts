import { TwitterResolverContext } from '../resolvers';
import { UserResolvers } from '../resolvers-types.generated';
const userTwitterResolver: UserResolvers<TwitterResolverContext> = {
  stats(user, _, { db }) { //this resolver is for UserStats type, which returns following, follows and tweet count of a user. We got it separately from User because we only need it for the user's own profile.
    return {
      followingCount: 123,
      followerCount: 456789,
      tweetCount: db.getUserTweets(user.id).length, //
    };
  },
};
export default userTwitterResolver;
