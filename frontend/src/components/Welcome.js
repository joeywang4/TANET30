import React from 'react';
import { Link } from 'react-router-dom';
import { Icon, Header } from 'semantic-ui-react';

const divStyle = {
  marginTop: "2em",
  width: "50%",
  maxWidth: "800px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center"
}

const WelcomeMsg = () => {
  return (
    <div style={divStyle}>
      <Icon name="warning sign" size="huge" />
      <Header as='h2'>
        Please&nbsp;
        <Link to="login">login</Link>
        &nbsp;or&nbsp;
        <Link to="register">create your account</Link>.
      </Header>
    </div>
  )
}

export default WelcomeMsg;