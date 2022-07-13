import { Tweet } from './resolvers-types.generated';
import { DbTweet } from './db';
import { DbFavorite } from './db';
import { Favorite } from './resolvers-types.generated';

export const tweetTransform = (t: DbTweet): Omit<Tweet, 'author'> => {
  //it takes the db representation of the tweet (that's why its type is dbTweet)
  //and it returns a modified version of Tweet, which is a type generated from the graphQL schema. i.e., this converts from the database representation of the entity, to the graphql representation of the entity, and while doing that mapping it will ommit the author property.
  return {
    id: t.id,
    body: t.message, //body from message mapping
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
};

//we're gonna export this into resolvers and create a tweet's resolver function

export const favoriteTransform = (
  t: DbFavorite
): Omit<Favorite, 'user' | 'tweet'> => {
  return {
    id: t.id,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
};
