import React from 'react';
import { Header, Dropdown, Menu, Image, Button, Container } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { logout } from '../actions';

const divStyle = {
  padding: "0.8em 1em",
  width: "100%",
  backgroundColor: "rgb(25, 84, 138)",
  display: "flex",
  flexDirection: "row"
};

const linkStyle = {
  margin: "0.7em 0.7em",
  fontSize: "1.3em",
  color: "rgb(255, 255, 255)"
};

const welcomeStyle = {
  fontSize: "1.1em",
  color: "rgb(255, 255, 255)",
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center"
};

const welcomeLinkStyle = {
  color: "rgb(204, 229, 255)", 
  textDecoration: "underline"
};

const mapStateToProps = (state) => ({
  hasLoggedin: state.user.token !== undefined,
  id: state.user.id,
  name: state.user.name,
  userGroup: state.user.group
})

const mapDispatchToProps = { logout };

function NavBar ({hasLoggedin, name, userGroup, logout}) {
  const mainBar = userGroup === "user"
    ?
    (
      <Menu secondary style={welcomeStyle}>
        <Menu.Item 
          name='general'
          as={Link} to="/mainPage"
        >
        大會資訊
        </Menu.Item>
        <Dropdown text='My Info' className='link item'>
          <Dropdown.Menu>
            <Dropdown.Item as={Link} to="/participatedEvents">Events</Dropdown.Item>
            <Dropdown.Item as={Link} to="/tickets">Food Tickets</Dropdown.Item>
            <Dropdown.Item as={Link} to="/userStatus">Transactions</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Menu.Item
          name='wallet'
          as={Link} to="/receive"
        >
        My QRcode
        </Menu.Item>
        <Button basic inverted style={{...linkStyle, fontSize: "1em"}} onClick={_ => logout()} >Logout</Button>
      </Menu>
    )
    :
    (
      <div style={welcomeStyle}>
        Hello,&nbsp; 
        <Link style={welcomeLinkStyle} to={'/'}>{name}</Link>
        &nbsp;!&nbsp;
        <Button basic inverted style={{...linkStyle, fontSize: "1em"}} onClick={_ => logout()} >Logout</Button>
      </div>
    );
  
  return(
    <div style={divStyle}>
      <Image src="logo.png" as='a' href='/mainPage' size='medium' style={{flexGrow: 100, marginTop: "0.5em"}}/>
      {hasLoggedin
        ?
          <div>
            {mainBar}
          </div>  
        :
          <React.Fragment>
            <Link style={linkStyle} to="/login" >Login</Link>
            <Link style={linkStyle} to="/register" >Register</Link>
          </React.Fragment>
      }
    </div>
  );
}


export default connect(mapStateToProps, mapDispatchToProps)(NavBar);