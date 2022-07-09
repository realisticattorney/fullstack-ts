import { TwitterResolverContext } from '../resolvers';
import { QueryResolvers } from '../resolvers-types.generated';
import { tweetTransform } from '../transforms';

const queryTwitterResolver: QueryResolvers<TwitterResolverContext> = {
  currentUser: (_, __, { db }) => {
    const [firstUser] = db.getAllUsers();
    if (!firstUser)
      throw new Error(
        'currentUser was requested, but there are no users in the database'
      );
    return firstUser;
  },

  //   currentUser: () => {
  // return {
  //   id: '123',
  //   name: 'John Doe',
  //   handle: 'johndoe',
  //   coverUrl: '',
  //   avatarUrl: '',
  //   createdAt: '',
  //   updatedAt: '',
  // };
  //   },
  //suggestions: (_, __, { db: _db }) => { //is gone.
  suggestions: (_, __, { db }) => {
    return db.getAllSuggestions();

    // return [ //no longer returning fixture/dummy data
    //   {
    //     name: 'TypeScript Project',
    //     handle: 'TypeScript',
    //     avatarUrl: 'http://localhost:3000/static/ts-logo.png',
    //     reason: 'Because you follow @MichaelLNorth',
    //     id: '1',
    //   },
    //   {
    //     name: 'jQuery',
    //     handle: 'jquery',
    //     avatarUrl: 'http://localhost:3000/static/jquery-logo.jpeg',
    //     reason: 'Because you follow @FrontendMasters',
    //     id: '2',
    //   },
    // ];
  },
  tweets: (
    _, //this is the parent of the resolver. It's the resolvers parent (previous to this one). We won't use this in this resolver.
    __, //this is the args of the resolver. If we accepted params here, for instance a tweet id, it'd be here.
    { db, dbTweetToFavoriteCountMap, dbUserCache, dbTweetCache } //context. This is set in the new ApolloServer constructor and it will be present in every resolver.
  ) => {
    db.getAllUsers().forEach((user) => {  //we'll getting all users and iterating them and putting them into a cache (memory cache)
      //in a realistic scenario, you'd retrieve your tweets, get the list of user ids asociated with the tweet.author of those tweets and then primer your cache with that subset of users instead of all users as we do here. But it's lot of round trips. 
      dbUserCache[user.id] = user;
    });
    db.getAllFavorites().forEach((favorite) => {
      //we haven't define a Favorites entity but think of it as a many to many relationship between tweets and users. So think of it as a join table that holds a tweet id and a user id in each record/row. 
      //we we get the list of all the favorites from our db and take the amount for each tweet and put it in a map/hashmap and cache it.
      //(the Favorites entity doesn't exist in our graphQL schema nor the types generated from it. but it does in our db json and the class / orm with methods we have)
      const count = dbTweetToFavoriteCountMap[favorite.tweetId] || 0; //it will go through {userId: number, tweetId: number} and add 1 to a hashmap with the tweetId as the key and the count as the value, which will start at 0.
      dbTweetToFavoriteCountMap[favorite.tweetId] = count + 1;
    });
    return db.getAllTweets().map((t) => {
      //finally, we'll map the tweets into a hashmap, and we will transform it using the tweetTransform function 
      dbTweetCache[t.id] = t;
      return tweetTransform(t);
    });
  },
};

export default queryTwitterResolver;
