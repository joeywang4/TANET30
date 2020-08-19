import React from 'react';
import { Card, Button } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { epochToDate } from '../../util';

const EventLink = ({name, id, time, reward}) => {
  
  return (
    <Card as={Link} to={`/event/page/?id=${id}`} link>
      <Card.Content>
        <Card.Header>{name}</Card.Header>
        <Card.Meta>
          <span className='date'>{epochToDate(time)}</span>
          <br />
          <span>$ {reward}</span>
        </Card.Meta>
      </Card.Content>
      <Card.Content extra>      
          <Button as={Link} to={`/event/page/?id=${id}`}>
            more details
          </Button>
      </Card.Content>
    </Card>
  );
}

export default EventLink;