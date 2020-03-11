import React from 'react';
import { Header, Button } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

const Status = ({ loading, name, balance, TXs }) => {
  return (
    <div style={{
      backgroundColor: "rgb(250, 250, 250)", 
      width: "90%",
      maxWidth: "800px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>
      <Header as='h2'>{`Your Balance: ${balance}`}</Header>
      <div>
        <Button as={Link} to="/receive">Receive</Button>
        <Button as={Link} to="/send">Send</Button>
      </div>
      <div style={{marginTop: "2em"}}>
        <Button as={Link} to="/events">View Events</Button>
        <Button as={Link} to="/createEvent">Craete Event</Button>
      </div>
    </div>
  )
}

export default Status;