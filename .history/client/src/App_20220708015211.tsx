import { isDefined } from '@full-stack-ts/shared';
import * as React from 'react';
import Header from './Header';
import LeftSidebar from './LeftSidebar';
import RightBar from './RightBar';
import Timeline from './Timeline';
import { gql } from '@apollo/client';
import { useGetCurrentUserQuery } from './generated/graphql'; //is defines what we can expect to pass in and expect back from a particular query

const CURRENT_USER = {
  name: 'Stu Dent',
  handle: 'student',
  avatarUrl: 'http://localhost:3000/static/egg.jpeg',
  coverUrl: 'http://localhost:3000/static/beach.jpeg',
  createdAt: '2022-03-23T03:55:59.612Z',
  updatedAt: '2022-03-23T03:55:59.612Z',
  id: 'user-15a37948-7712-4e0b-a554-2fef33f31697',
  favorites: [
    {
      userId: 'user-15a37948-7712-4e0b-a554-2fef33f31697',
      tweet: {
        userId: 'user-895b3d36-8bdf-4c29-be10-7a5e7ff3287f',
        message:
          '@LisaHuangNorth I just deployed a new version of the UI. Mind trying again?',
        createdAt: '2022-03-23T03:55:59.614Z',
        updatedAt: '2022-03-23T03:55:59.614Z',
        id: 'tweet-0db3e976-92cc-4846-9b96-e2a03da0b4e2',
      },
      createdAt: '2022-03-23T03:55:59.615Z',
      updatedAt: '2022-03-23T03:55:59.615Z',
      id: 'favorite-e4859379-b5ce-49d3-978c-a54b3de4ea7e',
    },
  ],
};

const TRENDS = [
  {
    topic: 'Frontend Masters',
    tweetCount: 12345,
    title: 'Frontend Masters',
    description: 'Launch of new full stack TS course',
    imageUrl: 'http://localhost:3000/static/fem_logo.png',
  },
];

const SUGGESTIONS = [
  {
    name: 'TypeScript Project',
    handle: 'TypeScript',
    avatarUrl: 'http://localhost:3000/static/ts-logo.png',
    reason: 'Because you follow @MichaelLNorth',
  },
];


export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    currentUser {
      id
      name
      handle
      avatarUrl
      createdAt
    }
    suggestions {
      name
      handle
      avatarUrl
      reason
    }
  }
`// this is the qery just as we see it in apollo GUI 




const App: React.FC = () => {
  const { favorites: rawFavorites } = CURRENT_USER;
  const favorites = (rawFavorites || [])
    .map((f) => f.tweet?.id)
    .filter(isDefined);

  return (
    <div>
      <LeftSidebar currentUser={CURRENT_USER} />
      <Header currentUser={CURRENT_USER} />

      <div id="container" className="wrapper nav-closed">
        <Timeline
          currentUserId={CURRENT_USER.id}
          currentUserFavorites={favorites}
        />
        <RightBar trends={TRENDS} suggestions={SUGGESTIONS} />
      </div>
    </div>
  );
};
export default App;





//So I've moved to the client. It has some dummy data and a layout for the twitter page. 
//imported apollo provider and apollo client. The ApolloProvider in a component based on the React.useContext API to provide the query and mutation data throughout the app, and to be able to fire off those queries from anywhere in the app.
//the ApolloClient. 

//so the generated types includes useGetCurrentUserQuery which is a function that returns the result of a query Apollo.useQuery(GetUserQuery, GetUserQueryVariables). The former is the query, and the latter is the variables (cleverly, just a [x]: string)