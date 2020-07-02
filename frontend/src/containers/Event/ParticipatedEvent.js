import React from 'react';
import { useSelector } from 'react-redux';
import { Loader, CardGroup } from 'semantic-ui-react';
import { ErrMsg, EventLink } from '../../components';
import { BACKEND } from '../../config';
import { useAPI } from '../../hooks';

const ParticipatedEvent = () => {
  const { token } = useSelector(state => state.user);
  const [connection, connect] = useAPI("json");

  if (connection.isInit()) {
    connect(
      BACKEND + `/event`,
      "GET",
      null,
      { 'authorization': token, 'content-type': "application/json" }
    );
  }

  if (connection.error) {
    return <ErrMsg />;
  }
  else if (connection.success) {
    if(connection.response.length === 0) {
      return <span>You have not participated in any event yet.</span>;
    }
    return (
      <CardGroup stackable style={{marginTop: "1em"}}>
        {connection.response.map(({name, _id, begin, reward}) => (
          <EventLink key={_id} name={name} id={_id} time={begin} reward={reward} />
        ))}
      </CardGroup>
    );
  }
  else {
    return <Loader active={true} />;
  }
}

export default ParticipatedEvent;