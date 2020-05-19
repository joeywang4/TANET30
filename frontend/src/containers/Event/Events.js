import React from 'react';
import { CardGroup, Loader, Header, Icon } from 'semantic-ui-react';
import { useAPI } from '../../hooks';
import { EventLink } from '../../components';
import { BACKEND } from '../../config';

const Events = ({admin, group, timeRange, style}) => {
  let url = BACKEND+`/event?${admin?`admin=${admin}`:""}${timeRange?`&begin=${timeRange[0]}&end=${timeRange[1]}`:""}`;
  const [connection, connect] = useAPI('json');
  if(connection.isInit()) connect(url);

  let events = connection.response||[];
  if(connection.success && group) {
    events = events.filter(event => event.admin.group === group);
  }

  if(connection.error) return (
    <Header icon>
      <Icon name="bug" />
      <div style={{marginTop: "2vh"}} />
      看來出了點差錯，請您再試一次。
    </Header>
  )
  else if(connection.success && events.length === 0) return (
    <Header icon>
      <Icon name="warning sign" />
      <div style={{marginTop: "2vg"}} />
      目前還沒有任何事件
    </Header>
  )
  else if(connection.success) return (
    <div style={style}>
      <CardGroup>
        {events.map(event => {
          return (
            <EventLink name={event.name} id={event._id} time={event.begin} end={event.end} key={event._id} />
          )
        })}
      </CardGroup>
    </div>
  ) 
  else return <Loader active>Loading</Loader>;
}

export default Events;