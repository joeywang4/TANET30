import React from 'react';
import { useSelector } from 'react-redux';
import { Loader, Card } from 'semantic-ui-react';
import { ErrMsg } from '../../components';
import { FRONTEND, BACKEND } from '../../config';
import { useAPI } from '../../hooks';
import { PaperCard } from '../../containers';
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
  let papers = connection.response || [];

  if (connection.error) {
    return <ErrMsg />;
  }
  else if (connection.success) {
    return ( papers.length === 0 ? 
      <span>This event has no author.</span> : 
      <Card.Group style={{marginTop: "2em", width: "80%"}}>
        {papers.map(
          (paper, idx) => (
            <PaperCard key={idx} paperId={paper.paperId} eventId={eventId} title={paper.paperTitle} authors={paper.paperAuthors} likes={paper.totalLikes} likeState={paper.likeState} content={paper.content}>
              {paper.paperId}
            </PaperCard>
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