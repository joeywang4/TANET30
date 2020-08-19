import React from 'react';
import { useSelector } from 'react-redux';
import { Header, Button, Icon, Divider } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { ParticipatedEvent, Tickets, History } from './index';
import { BACKEND } from '../config';
import { useAPI } from '../hooks';

const UserStatus = () => {
  const {id} = useSelector(state => state.user);
  const [connection, connect] = useAPI("json");

  if(connection.isInit()) connect(BACKEND+`/TX?id=${id}`);
  let balance = 0;
  if(connection.response) {
    for(let TX of connection.response) {
      if(TX.to._id === id) balance += parseInt(TX.amount);
      else balance -= parseInt(TX.amount);
    }
  }

  return (
    <div style={{marginTop: "2em", width: "80%"}}>
      <Header as='h2' icon textAlign='center'>
        <Icon name='user circle' circular />
        <Header.Content>Your Profile</Header.Content>
      </Header>
      <Divider horizontal>
        <Header as='h4'>
          <Icon name='dollar' />
          Money
        </Header>
      </Divider>
      <div style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        <Header as='h2'>{`Your Balance: ${balance}`}</Header>
        <div>
          <Button as={Link} to="/receive">Receive</Button>
          <Button as={Link} to="/send">Send</Button>
        </div>
        <div>
          <History/>
        </div>
      </div>
      <Divider horizontal>
        <Header as='h4'>
          <Icon name='calendar' />
          Participated Events
        </Header>
      </Divider>
      <ParticipatedEvent />
      <Divider horizontal>
        <Header as='h4'>
          <Icon name='food' />
          Food Tickets
        </Header>
      </Divider>
      <Tickets />
    </div>
  )
}

export default UserStatus;