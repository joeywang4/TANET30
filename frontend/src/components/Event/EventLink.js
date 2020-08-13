import React, { useState }  from 'react';
import { useSelector } from 'react-redux';
import { Card, Button, Icon, Label } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { epochToDate } from '../../util';
import { useAPI } from '../../hooks';
import { BACKEND } from '../../config';

const EventLink = ({name, id, time, reward}) => {
  
  const { token } = useSelector(state => state.user);
  const [ getLikeState, getLike ] = useAPI("json");
  // console.log(typeof(token));
  if(getLikeState.isInit()) getLike(BACKEND+`/event?page=${id}`);
  let likes = 0;
  let userLikeState = null;
  if(getLikeState.response) {
    for(let like of getLikeState.response) {
      if(like.user === token){
        console.log(`liked event id=${id}`);
        userLikeState = like.state;
      }
      likes += like.state;
    }
  }
  // console.log(userLikeState);


  const onClickLike = (likeState) => {
    console.log(`clicked ${likeState}`);
    fetch(BACKEND+"/event/like", {
      method: "POST",
      body: JSON.stringify({ eventId: id, likeState: likeState }),
      headers: { authorization: token, 'content-type': "application/json" }
    })
    .then(res => {
      if(res.status === 200) {
        console.log('like success');
      }
      else {
        console.log('like failed');
      }
    })
  }

  return (
    // <Card as={Link} to={`/event?id=${id}`} link>
    <Card>
      <Card.Content>
        <Card.Header>{name}</Card.Header>
        <Card.Meta>
          <span className='date'>{epochToDate(time)}</span>
          <br />
          <span>$ {reward}</span>
        </Card.Meta>
      </Card.Content>
      <Card.Content extra>      
          <Button as='div' labelPosition='right'>
            <Button.Group>
              <Button inverted color='green' onClick={()=>onClickLike(1)}>
                <Icon name='thumbs up outline' />
                Like
              </Button>
              <Label>
                {likes}
              </Label>
              <Button inverted color='red' onClick={()=>onClickLike(-1)}>
                <Icon name='thumbs down outline' />
                Dislike
              </Button>
            </Button.Group>
            
          </Button>
      </Card.Content>
    </Card>
  );
}

export default EventLink;