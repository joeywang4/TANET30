import React from 'react';
import { useSelector } from 'react-redux';
import { Loader, Card } from 'semantic-ui-react';
import { ErrMsg } from '../../components';
import { BACKEND } from '../../config';
import { useAPI } from '../../hooks';
import { PaperCard } from '..';
import { DiscussionEmbed } from 'disqus-react';
import { FRONTEND } from '../../config';

const PaperPage = ({ id, info }) => {
  const { token } = useSelector(state => state.user);
  const [connection, connect] = useAPI("text");
  if (connection.isInit()) {
    connect(
      BACKEND + `/event/paperPage/?id=${id}`,
      "GET",
      null,
      { 'authorization': token, 'content-type': "application/json" }
    );
  }
  let content = connection.response || false;

  if (connection.error) {
    return <ErrMsg />;
  }
  else if (connection.success) {
    return ( content&&info&&info.hasInfo ? 
      <Card.Group style={{marginTop: "2em", width: "80%"}}>
        <PaperCard paperId={id.substring(24)} eventId={id.substring(0,24)} title={info.title} authors={info.authors} likes={info.likes} likeState={info.likeState} content={content} />
        <Card fluid> 
          <Card.Content>
            <DiscussionEmbed
              shortname='tanet30'
              config={
                {
                  url: `${FRONTEND}/paper/page/?id=${id}`,
                  identifier: id,
                  title: id,
                  language: 'zh_TW' //e.g. for Traditional Chinese (Taiwan)	
                }
              }
            />
          </Card.Content>
        </Card>
      </Card.Group> : 
      <span>{`You are not allowed to see this page.${content&&info&&info.hasInfo}`}</span>
    );
  }
  else {
    return <Loader active={true} />;
  }
};

export default PaperPage;