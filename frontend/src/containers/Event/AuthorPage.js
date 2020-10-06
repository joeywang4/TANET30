import React from 'react';
import { useSelector } from 'react-redux';
import { Loader, Card } from 'semantic-ui-react';
import { ErrMsg } from '../../components';
import { BACKEND } from '../../config';
import { useAPI } from '../../hooks';
import { AuthorCard } from '../../containers';
import { DiscussionEmbed } from 'disqus-react';
import { FRONTEND } from '../../config';

const AuthorPage = ({ id, info }) => {
  const { token } = useSelector(state => state.user);
  const [connection, connect] = useAPI("json");
  if (connection.isInit()) {
    connect(
      BACKEND + `/event/authorPage/?id=${id}`,
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
        <AuthorCard authorId={id.substring(24)} eventId={id.substring(0,24)} name={info.authorName} likes={info.likes} likeState={info.likeState} content={content}>
          {id}
        </AuthorCard>
        <Card fluid> 
          <Card.Content>
            <DiscussionEmbed
              shortname='tanet30'
              config={
                {
                  url: `${FRONTEND}/author/page/?id=${id}`,
                  identifier: id,
                  title: id,
                  language: 'zh_TW' //e.g. for Traditional Chinese (Taiwan)	
                }
              }
            />
          </Card.Content>
        </Card>
      </Card.Group> : 
      <span>You are not allowed to see this page.</span>
    );
  }
  else {
    return <Loader active={true} />;
  }
};

export default AuthorPage;