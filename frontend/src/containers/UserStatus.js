import React from 'react';
import { useSelector } from 'react-redux';
import { Header, Button, Icon, Divider, Segment, Grid } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { History, UserHead } from './index';
import { BACKEND } from '../config';
import { useAPI } from '../hooks';

const UserStatus = () => {
  const { id } = useSelector(state => state.user);
  const [connection, connect] = useAPI("json");

  if(connection.isInit()) connect(BACKEND+`/TX?id=${id}`);
  let balance = 0;
  let maxmoney = 0;
  if(connection.response) {
    for(let TX of connection.response) {
      if(TX.to._id === id) {
        balance += parseInt(TX.amount);
        maxmoney += parseInt(TX.amount);
      } 
      else {
        balance -= parseInt(TX.amount);
      }
    }
  }

  return (
    <div style={{marginTop: "2em", width: "80%"}}>
      <UserHead />
      <Divider horizontal>
        <Header as='h3'>
          <Icon name='dollar' />
          Money
        </Header>
      </Divider>
      <Grid celled='internally' stackable style={{paddingBottom:"2em"}}>
        <Grid.Row textAlign='center'>
        <Grid.Column width={11} style={{fontFamily:"Verdana", paddingBottom:"3em", paddingTop:"3em"}}>
            <Header as='h2'>Your Balance:</Header>
            <p style={{fontSize:"1.65em"}}>${balance}</p>
          </Grid.Column>
          <Grid.Column width={4} style={{fontFamily:"Verdana", paddingLeft:"1.5em", paddingBottom:"3em", paddingTop:"3em"}}>
            <Header as='h2' style={{fontSize:"1.4em"}}>Maximum Balance:</Header>
            <p style={{fontSize:"1.55em"}}>${maxmoney}</p>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row textAlign="center">
          <Grid.Column width="100%" style={{paddingTop:"1.5em"}}>
            {/* <div>
            <Button as={Link} to="/receive">My QRcode</Button>
            <Button as={Link} to="/send">Send</Button>
            </div> */}
            <div style={{paddingTop:"0.8em"}}>
              <History/>
            </div>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </div>
  )
}

export default UserStatus;