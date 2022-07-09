import { Tweet } from './resolvers-types.generated';
import { DbTweet } from './db';

export const tweetTransform = (t: DbTweet): Omit<Tweet, 'author'> => { //it takes the db representation of the tweet (that's why its type is dbTweet)
    //and it returns a modified version of Tweet, which is a type generated from the graphQL schema ()
  return {
    id: t.id,
    body: t.message,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
};

