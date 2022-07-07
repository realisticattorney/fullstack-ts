import { QueryResolvers } from '../resolvers-types.generated';

const queryTwitterResolver: QueryResolvers = {
  currentUse: () => {
    return {
      id: '123',
      name: 'John Doe',
      handle: 'johndoe',
      coverUrl: '',
      avatarUrl: '',
      createdAt: '',
      updatedAt: '',
    };
  },
  suggestions: () => {
    return [];
  },
};

export default queryTwitterResolver;
