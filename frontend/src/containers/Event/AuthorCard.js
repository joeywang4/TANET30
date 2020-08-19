import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, Button, Icon, Label } from 'semantic-ui-react';
import { BACKEND } from '../../config';

const AuthorCard = ({ authorId, eventId, name, likes, likeState }) => {
  // console.log({ authorId, eventId, name, likes, likeState });
  const { token } = useSelector(state => state.user);
  const [ totalLikes, setTotalLikes ] = useState(likes);
  const [ userLikeState, setUserLikeState ] = useState(likeState);

  const onClickLike = (newLikeState) => {
    if(newLikeState-userLikeState === 0) {
      console.log('no change');
      return;
    }
    console.log(`clicked ${newLikeState}`);
    fetch(BACKEND+"/event/like", {
      method: "POST",
      body: JSON.stringify({ eventId, authorId, likeState: newLikeState }),
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
    setTotalLikes(likes += newLikeState-likeState);
    setUserLikeState(newLikeState);
  }

  return (
    <Card fluid> 
      <Card.Content>
        <Card.Header>{name}</Card.Header>
        <Card.Meta>
          <span className='content'>{'some content'}</span>
          <br />
          <span>{authorId}</span>
        </Card.Meta>
      </Card.Content>
      <Card.Content extra>      
          <Button as='div' labelPosition='right'>
            <Button.Group>
              <Button inverted={userLikeState<=0} color='green' onClick={()=>onClickLike(1)}>
                <Icon name='thumbs up outline' />
                Like
              </Button>
              <Label>
                {totalLikes}
              </Label>
              <Button inverted={userLikeState>=0} color='red' onClick={()=>onClickLike(-1)}>
                <Icon name='thumbs down outline' />
                Dislike
              </Button>
            </Button.Group>
          </Button>
      </Card.Content>
    </Card>
  );
}

export default AuthorCard;