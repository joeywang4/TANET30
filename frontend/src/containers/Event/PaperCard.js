import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useWS, useAPI } from '../../hooks';
import { Link } from 'react-router-dom';
import { Card, Button, Icon } from 'semantic-ui-react';
import { BACKEND } from '../../config';

const PaperCard = ({ paperId, eventId, title, authors, likes, likeState, content }) => {
  const { token } = useSelector(state => state.user);
  const [ userLikeState, setUserLikeState ] = useState(likeState);
  const [ hoverLikeState, setHoverLikeState ] = useState(likeState);
  const [ useHoverState, setUseHoverState ] = useState(false);
  const [, updateLike] = useAPI();
  const newLikes = useWS(`new-paper-likes-${paperId}`);

  const onClickLike = (newLikeState) => {
    if(newLikeState-userLikeState === 0) newLikeState = 0;
    console.log(newLikeState ? `clicked ${newLikeState}`: `cancel ${userLikeState}`);
    updateLike(
      BACKEND+"/event/like", 
      "POST", 
      JSON.stringify({ eventId, paperId, likeState: newLikeState }), 
      {'authorization': token, 'content-type': "application/json"}
    );
    setUserLikeState(newLikeState);
    setHoverLikeState(newLikeState);
  }

  const onHover = (star) => {
    setUseHoverState(true);
    setHoverLikeState(star);
  }
  const unHover = () => {
    setUseHoverState(false);
    setHoverLikeState(0);
  }
  const totalLikes = newLikes?newLikes:likes;

  return (
    <Card fluid={content ? true : false}> 
      <Card.Content>
        <Card.Header>{title}</Card.Header>
        <Card.Meta>
          <span className='title'>{authors}</span>
        </Card.Meta>
      </Card.Content>
      <Card.Content>
        <Card.Description>
          {content ? <span className='content'>{content.split('\n').map((val, idx) => 
            <p id={idx} key={idx}>
              {val}
            </p>
          )}</span> : 
          <Link to={{
              pathname: "/paper/page/",
              search: `?id=${eventId}${paperId}`,
              state: { hasInfo: true, title: title, authors:authors, content: content, likes: totalLikes, likeState: userLikeState }
            }} >
            ...view more
          </Link>} 
        </Card.Description>
        <br />
        {/* <Button circular active icon='thumbs up' size='mini' color='blue' /> */}
        <Icon name='like' color='red'/>
        <span>{totalLikes}</span>
      </Card.Content>
      <Card.Content extra>
        <div onMouseLeave={()=>unHover()} >
          {[1, 2, 3].map( (val, idx) => 
            <Icon 
              key={idx} 
              name={
                useHoverState ? 
                (hoverLikeState>idx ? 'star' : 'star outline') :
                (userLikeState >idx ? 'star' : 'star outline') 
              } 
              size='large' 
              color='yellow' 
              onMouseEnter={()=>onHover(val)} 
              onClick={()=>onClickLike(val)} />
          )}
        </div>
        {content ? 
          <Button color='blue' floated='right' as={Link} to={`/event/page/?id=${eventId}`} link>
            <Icon name='arrow alternate circle left outline' />
            Go back
          </Button> : 
          null}
      </Card.Content>
    </Card>
  );
}

export default PaperCard;