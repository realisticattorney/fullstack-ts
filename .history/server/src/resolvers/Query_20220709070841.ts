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
    db.getAllUsers().forEach((user) => {  //we'll h
      dbUserCache[user.id] = user;
    });
    db.getAllFavorites().forEach((favorite) => {
      const count = dbTweetToFavoriteCountMap[favorite.tweetId] || 0;
      dbTweetToFavoriteCountMap[favorite.tweetId] = count + 1;
    });
    return db.getAllTweets().map((t) => {
      dbTweetCache[t.id] = t;
      return tweetTransform(t);
    });
  },
};

export default queryTwitterResolver;
