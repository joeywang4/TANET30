import React from 'react';
import { Card } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { epochToDate } from '../../util';

const EventLink = ({name, id, time}) => (
  <Card as={Link} to={`/event?id=${id}`} link>
    <Card.Content>
      <Card.Header>{name}</Card.Header>
      <Card.Meta>
        <span className='date'>{epochToDate(time)}</span>
      </Card.Meta>
    </Card.Content>
  </Card>
)

export default EventLink;