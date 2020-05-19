import React from 'react';
import { Header, Icon } from 'semantic-ui-react';

export default ({ msg, icon }) => (
  <Header as='h2' icon textAlign='center'>
    <Icon name={icon?icon:'bug'} />
    <Header.Content>{msg?msg:"There is some error..."}</Header.Content>
  </Header>
)