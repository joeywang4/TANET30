import React from 'react';
import { useSelector } from 'react-redux';
import { Loader, Card } from 'semantic-ui-react';
import { ErrMsg } from '../../components';
import { FRONTEND, BACKEND } from '../../config';
import { useAPI } from '../../hooks';
import { AuthorCard } from '../../containers';
import { DiscussionEmbed } from 'disqus-react';


const EventPage = ({ eventId, url, id, title }) => {
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
            <AuthorCard key={idx} authorId={author.authorId} eventId={eventId} name={author.authorName} likes={author.totalLikes} likeState={author.likeState} content={author.content}>
              {author.authorId}
            </AuthorCard>
          )
        )}
        <Card fluid> 
          <Card.Content>
            <DiscussionEmbed
              shortname='tanet30'
              config={
                {
                  url: `${FRONTEND}/event/page/${url}`,
                  identifier: id,
                  title: title,
                  language: 'zh_TW' //e.g. for Traditional Chinese (Taiwan)	
                }
              }
            />
          </Card.Content>
        </Card>
      </Card.Group>
    );
  }
  else {
    return <Loader active={true} />;
  }
};

export default EventPage;