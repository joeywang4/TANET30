import React from 'react';
import { Header, Icon, Divider } from 'semantic-ui-react';
import { Tickets } from './index';

export default () => {
  return (
    <div style={{marginTop: "2em", width: "80%"}}>
      <Header as='h2' icon textAlign='center'>
        <Icon name='user circle' circular />
        <Header.Content>Your Profile</Header.Content>
      </Header>  
      <Divider horizontal>
        <Header as='h4'>
          <Icon name='dollar' />
          Receive
        </Header>
      </Divider>
      <Tickets />
    </div>
  )
}
