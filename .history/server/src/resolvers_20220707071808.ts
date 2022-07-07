import Query from './resolvers/Query';
import { Resolvers } from './resolvers-types.generated';
import Db from './db';
export interface TwitterResolverContext {
  db: Db;
}

const resolvers: Resolvers = {
  Query,
};

export default resolvers;

// const resolvers: Resolvers = {
//   Query,
// }; this stills let me do what I want with Query.ts
