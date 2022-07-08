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

// const SUGGESTIONS = [ //we had one suggestion of who to follow (single object in this array of objects)
//   {
//     name: 'TypeScript Project',
//     handle: 'TypeScript',
//     avatarUrl: 'http://localhost:3000/static/ts-logo.png',
//     reason: 'Because you follow @MichaelLNorth',
//   },
// ];

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
`; // this is the qery just as we see it in apollo GUI

const App: React.FC = () => {
  const { favorites: rawFavorites } = CURRENT_USER;
  const favorites = (rawFavorites || [])
    .map((f) => f.tweet?.id)
    .filter(isDefined);

  const { loading, error, data } = useGetCurrentUserQuery(); //this pregenerated hook has the right query and the right variables pre-braked in so we don't pass in anything
  if (loading) return <p>Loading...</p>; //for now we return these cursory things just in case we get loading no data or error.
  if (error) return <p>Error: {error}</p>;
  if (!data) return <p>No data.</p>;
  const { currentUser, suggestions = [] } = data; //we want to pickup data so as to not use the dummy data

  return (
    <div>
      {/* <LeftSidebar currentUser={CURRENT_USER} />   //we dont have real current user data yet */}
      <LeftSidebar currentUser={{ ...CURRENT_USER, ...currentUser }} />
      {/* I've merged these two (dummy data and the actual currentUser data as I don't have it all yet (like favorite tweets etc)) */}
      <Header currentUser={CURRENT_USER} />

      <div id="container" className="wrapper nav-closed">
        <Timeline
          currentUserId={CURRENT_USER.id}
          currentUserFavorites={favorites}
        />
        {/* <RightBar trends={TRENDS} suggestions={SUGGESTIONS} />  //actually replace it, so bye bye dummy data */}
        <RightBar trends={TRENDS} suggestions={suggestions} />
      </div>
    </div>
  );
};
export default App;

//So I've moved to the client. It has some dummy data and a layout for the twitter page.
//imported apollo provider and apollo client. The ApolloProvider in a component based on the React.useContext API to provide the query and mutation data throughout the app, and to be able to fire off those queries from anywhere in the app.
//the ApolloClient.

//so the generated types includes useGetCurrentUserQuery which is a function that returns the result of a query Apollo.useQuery(GetUserQuery, GetUserQueryVariables). The former is the query, and the latter is the variables (cleverly, just a [x]: string each attribute in the query is of type string). In a REST API the GetUserQueryVariables would be included in the URL.

//so this is how the query made from ApolloClient looks like in the network tab of our React app (PAYLOAD):
// operationName: "GetCurrentUser"
// query: "query GetCurrentUser {\n  currentUser {\n    id\n    name\n    handle\n    avatarUrl\n    createdAt\n    __typename\n  }\n  suggestions {\n    name\n    handle\n    avatarUrl\n    reason\n    __typename\n  }\n}\n"
// variables: {}

//Response (another tab):
// {"data":{"currentUser":{"id":"123","name":"John Doe","handle":"johndoe","avatarUrl":"","createdAt":"","__typename":"User"},"suggestions":[{"name":"TypeScript Project","handle":"TypeScript","avatarUrl":"http://localhost:3000/static/ts-logo.png","reason":"Because you follow @MichaelLNorth","__typename":"Suggestion"},{"name":"jQuery","handle":"jquery","avatarUrl":"http://localhost:3000/static/jquery-logo.jpeg","reason":"Because you follow @FrontendMasters","__typename":"Suggestion"}]}}

//Preview(same but parsed):
// {data: {,…}}
// data: {,…}
// currentUser: {id: "123", name: "John Doe", handle: "johndoe", avatarUrl: "", createdAt: "", __typename: "User"}
// avatarUrl: ""
// createdAt: ""
// handle: "johndoe"
// id: "123"
// name: "John Doe"
// __typename: "User"
// suggestions: [{name: "TypeScript Project", handle: "TypeScript",…},…]
// 0: {name: "TypeScript Project", handle: "TypeScript",…}
// avatarUrl: "http://localhost:3000/static/ts-logo.png"
// handle: "TypeScript"
// name: "TypeScript Project"
// reason: "Because you follow @MichaelLNorth"
// __typename: "Suggestion"
// 1: {name: "jQuery", handle: "jquery", avatarUrl: "http://localhost:3000/static/jquery-logo.jpeg",…}
// avatarUrl: "http://localhost:3000/static/jquery-logo.jpeg"
// handle: "jquery"
// name: "jQuery"
// reason: "Because you follow @FrontendMasters"
// __typename: "Suggestion


//We don't need to worry much about this as it's working between apollo client and apollo server. 
//For now all I see we need is:
//To create an apollo server, server that data. connect it to the express server.
//to create the schema, test it, and generate the types in typescript for that 