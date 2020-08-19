import React from 'react';
import { useSelector } from 'react-redux';
import { Loader, Card } from 'semantic-ui-react';
import { ErrMsg } from '../../components';
import { BACKEND } from '../../config';
import { useAPI } from '../../hooks';
import { AuthorCard } from '../../containers';


const EventPage = ({ eventId }) => {
  const { token } = useSelector(state => state.user);
  const [connection, connect] = useAPI("json");
  // console.log(token);
  if (connection.isInit()) {
    connect(
      BACKEND + `/event/page?id=${eventId}`,
      "GET",
      null,
      { 'authorization': token, 'content-type': "application/json" }
    );
  }
  let authors = connection.response || [];

  if (connection.error) {
    return <ErrMsg />;
  }
  else if (connection.success) {
    return ( authors.length === 0 ? 
      <span>This event has no author.</span> : 
      <Card.Group style={{marginTop: "2em", width: "80%"}}>
        {authors.map(
          (author, idx) => (
            <AuthorCard key={idx} authorId={author.authorId} eventId={eventId} name={author.authorName} likes={author.totalLikes} likeState={author.likeState}>
              {author.authorId}
            </AuthorCard>
          )
        )}
      </Card.Group>
    );
  }
  else {
    return <Loader active={true} />;
  }
};

export default EventPage;