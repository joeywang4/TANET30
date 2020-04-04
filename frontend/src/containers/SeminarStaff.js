import React from 'react';
import { Header, Icon, Divider } from 'semantic-ui-react';

export default () => {
  console.log("[*] Viewing Seminar Staff Page");

  return (
    <div style={{marginTop: "2em", width: "80%"}}>
      <Header as='h2' icon textAlign='center'>
        <Icon name='bullhorn' circular />
        <Header.Content>Seminar</Header.Content>
      </Header>
      <Divider horizontal>
        <Header as='h4'>
          <Icon name='calendar alternate outline' />
          Today's Event
        </Header>
      </Divider>
    </div>
  )
}