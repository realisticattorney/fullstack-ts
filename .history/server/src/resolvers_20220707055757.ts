const resolvers = {
  Query: {
    currentUser: () => {
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
  },
};
