import {
  faImage,
  faFilm,
  faChartBar,
  faComment,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import gql from 'graphql-tag';
import * as React from 'react';
import { useCreateTweetMutation } from './generated/graphql';
import { GET_ALL_TWEETS } from './Timeline';
import { GET_CURRENT_USER } from './App';

// const CREATE_NEW_TWEET = gql`
//   mutation CreateTweet($userId: String!, $body: String!) {
//     createTweet(userId: $userId, body: $body) {
//       id
//       body
//     }
//   }
// `;

export interface ComposePanelProps {
  currentUser: { id: string };
}
const ComposePanel: React.FC<ComposePanelProps> = ({ currentUser }) => {
  const [createNewTweet, { error }] = useCreateTweetMutation();
  if (error) return <p>Error creating new tweet: {error}</p>;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const textarea = e.currentTarget.querySelector('textarea');
    if (!textarea) throw new Error('No textarea found');
    const body = textarea.value;
    createNewTweet({
      variables: { userId: currentUser.id, body: body },
      refetchQueries: [{ query: GET_ALL_TWEETS, GET_CURRENT_USER }],
    })
      .then(() => {
        textarea.value = '';
      })
      .catch((err) => {
        console.error(err);
      });

    textarea.value = '';
  };
  //for some reason I can do this without async await, using promises?? wtf

  return (
    <div className="new-tweet">
      <form onSubmit={handleSubmit}>
        <textarea name="body" placeholder="What's happening?"></textarea>
        <div className="btns">
          <div className="btn">
            <button disabled>
              <FontAwesomeIcon icon={faImage} />
            </button>
          </div>
          <div className="btn">
            <button disabled>
              <FontAwesomeIcon icon={faFilm} />
            </button>
          </div>
          <div className="btn">
            <button disabled>
              <FontAwesomeIcon icon={faChartBar} />
            </button>
          </div>
          <div className="btn">
            <button type="submit" className="blue">
              <FontAwesomeIcon icon={faComment} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
export default ComposePanel;
