import React from 'react';
//import { useSelector } from 'react-redux';
import { Header, Icon, Divider } from 'semantic-ui-react';
//import { Link } from 'react-router-dom';
import { Tickets } from './index';
//import { BACKEND } from '../config';
//import { useAPI } from '../hooks';

export default () => {
  return (
    <div style={{marginTop: "2em", width: "80%"}}>
      <Header as='h2' icon textAlign='center'>
        <Icon name='user circle' circular />
        <Header.Content>Your Profile</Header.Content>
      </Header>  
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

