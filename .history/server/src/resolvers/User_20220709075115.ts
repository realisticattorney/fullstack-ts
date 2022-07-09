import { TwitterResolverContext } from '../resolvers';
import { UserResolvers } from '../resolvers-types.generated';
const userTwitterResolver: UserResolvers<TwitterResolverContext> = {
  //this resolver is for UserStats type, which returns following, follows and tweet count of a user. We got it separately from User because we only need it for the user's own profile.
  stats(user, _, { db }) { //the first argument is the parent. what's happening in terms of the flow of what's calling into what here, when you make that top level query for current user., 
    return {
      followingCount: 123,
      followerCount: 456789,
      tweetCount: db.getUserTweets(user.id).length, //length of array === number of tweets
    };
  },
};
export default userTwitterResolver;
