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

const CREATE_TWEET_MUTATION = gql`
  mutation CreateTweet($userId: String!, $body: String!) {
    createTweet(userId: $userId, body: $body) {
      id
      body
    }
  }
`;

export interface ComposePanelProps {
  currentUser: { id: string };
}
const ComposePanel: React.FC<ComposePanelProps> = ({ currentUser }) => {
  const [createTweetMutation] = useCreateTweetMutation();

  const handleSubmit =  (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const textarea = e.currentTarget.querySelector('textarea');
    if (!textarea) throw new Error('No textarea found');
    const body = textarea.value;
    try {
      await createTweetMutation({
        variables: { userId: currentUser.id, body: body },
      });
    } catch {
      console.error('Error creating tweet');
    }
    textarea.value = '';
  }; 
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
