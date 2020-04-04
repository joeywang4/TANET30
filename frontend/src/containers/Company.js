import React from 'react';
import { Header, Icon, Divider } from 'semantic-ui-react';

export default () => {
  console.log("[*] Viewing Company Page");

  return (
    <div style={{marginTop: "2em", width: "80%"}}>
      <Header as='h2' icon textAlign='center'>
        <Icon name='add user' circular />
        <Header.Content>Stall Checkin</Header.Content>
      </Header>
      <Divider />
    </div>
  )
}