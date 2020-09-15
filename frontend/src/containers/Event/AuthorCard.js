import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Card, Button, Icon } from 'semantic-ui-react';
import { BACKEND } from '../../config';

const AuthorCard = ({ authorId, eventId, name, likes, likeState, content }) => {
  const initLikeState = likeState;
  const { token } = useSelector(state => state.user);
  const [ totalLikes, setTotalLikes ] = useState(likes);
  const [ userLikeState, setUserLikeState ] = useState(likeState);

  const onClickLike = (newLikeState) => {
    if(newLikeState-userLikeState === 0) {
      console.log(`cancel ${userLikeState>0 ? 'like' : 'dislike'}`);
      fetch(BACKEND+"/event/like", {
        method: "POST",
        body: JSON.stringify({ eventId, authorId, likeState: 0 }),
        headers: { authorization: token, 'content-type': "application/json" }
      })
      .then(res => {
        if(res.status === 200) {
          console.log(`cancel ${userLikeState>0 ? 'like' : 'dislike'} success`);
        }
        else {
          console.log(`cancel ${userLikeState>0 ? 'like' : 'dislike'} failed`);
        }
      })
      setTotalLikes(likes -= initLikeState);
      setUserLikeState(0);
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

  const hasOutline = content.outline ? true : false;

  return (
    <Card fluid={hasOutline ? true : false}> 
      <Card.Content>
        <Card.Header>{name}</Card.Header>
        <Card.Meta>
          <span className='title'>{content.title}</span>
        </Card.Meta>
      </Card.Content>
      <Card.Content>
        <Card.Description>
          {hasOutline ? <span className='content'>{content.outline.split('\n').map((val, idx) => 
            <p id={idx}>
              {val}
            </p>
          )}</span> : 
          <Link to={{
              pathname: "/author/page/",
              search: `?id=${eventId}${authorId}`,
              state: { hasInfo: true, authorName: name, content: content, likes: totalLikes, likeState: userLikeState }
            }} >
            ...view more
          </Link>} 
        </Card.Description>
        <br />
        {/* <Button circular active icon='thumbs up' size='mini' color='blue' /> */}
        <Icon name='thumbs up outline' color='blue' />
        <span>{` ${totalLikes}`}</span>
      </Card.Content>
      <Card.Content extra>
      <Button.Group fluid={hasOutline ? false : true}>
        <Button 
          content='  Like  ' size='tiny' labelPosition='left' color='green' 
          icon={userLikeState<=0 ? 'thumbs up outline' : 'thumbs up'} 
          basic={userLikeState<=0} compact onClick={()=>onClickLike(1)} 
        />
        <Button 
          content='Dislike' size='tiny' labelPosition='right' color='red'
          icon={userLikeState>=0 ? 'thumbs down outline' : 'thumbs down'} 
          basic={userLikeState>=0} compact onClick={()=>onClickLike(-1)} 
        />
      </Button.Group> 
        {/* <Button
          color='green'
          content='Like'
          basic={userLikeState<=0}
          icon={userLikeState<=0 ? 'thumbs up outline' : 'thumbs up'}
          onClick={()=>onClickLike(1)}
          // attached='left'
          label={{ basic: true, color: 'green', pointing: 'left', content: `${totalLikes}` }}
        /> */}
        {hasOutline ? 
          <Button color='blue' floated='right' as={Link} to={`/event/page/?id=${eventId}`} link>
            <Icon name='arrow alternate circle left outline' />
            Go back
          </Button> : 
          null}
      </Card.Content>
    </Card>
  );
}

export default AuthorCard;