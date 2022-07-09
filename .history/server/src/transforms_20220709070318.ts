import { Tweet } from './resolvers-types.generated';
import { DbTweet } from './db';

export const tweetTransform = (t: DbTweet): Omit<Tweet, 'author'> => { //it takes the db representation of the tweet (that's why its type is dbTweet)
    //and it returns a modified version of Tweet, which is a type generated from the graphQL schema. i.e., this converts from the database representation of the entity, to the graphql representation of the entity, and while 
  return {
    id: t.id,
    body: t.message,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
};

