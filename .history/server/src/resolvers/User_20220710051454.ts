import { favoriteTransform, tweetTransform } from '../transforms';
import { TwitterResolverContext } from '../resolvers';
import { UserResolvers } from '../resolvers-types.generated';
const userTwitterResolver: UserResolvers<TwitterResolverContext> = {
  //this resolver is for UserStats type, which returns following, follows and tweet count of a user. We got it separately from User because we only need it for the user's own profile.
  stats(user, _, { db }) {
    //the first argument is the parent. what's happening in terms of the flow of what's calling into what here, when you make that top level query for current user, if someone has requested stats, currentUser will get called first, when it gets to this stats resolver, you'll have whatever the top level resolver returned.
    return {
      followingCount: 123,
      followerCount: 456789,
      tweetCount: db.getUserTweets(user.id).length, //length of array === number of tweets of the user passed in. this is a hacky way to get the number of tweets of the user but not a problem as we only need it for the user's own profile (aka just once)
    };
  },
  favorites(user, _, { db }) {
    const faves = db.getUserFavorites(user.id);
    return faves.map((f) => {
      return Object.assign({{favoriteTransform(f)},
        {user},
       { tweet: tweetTransform(db.getTweetById(f.tweetId))},
      })
    };
  };
export default userTwitterResolver;

///
//Performance based on real outcomes
//Javascript: 7.5/10 (challenges, theoretical questions, etc.)
//React: {
//projects: 3/10  (I've completed the projects. I haven't passed any of them)
//live coding challenges: 7/10
//theorical questions: 5/10
//}
//Biggest mistake so far has been not to record and study my performances on interviews.

//Don't like the camera on the side, like ignoring the interviewer.
//Think of the interviewer as a friend. Be more relatable than educated. Warm and relatable wins over educated and distant.

//CSS and how to structure it in a large project.
//Major difference between promises and async/await.
