import React from 'react';
import { Header } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { logout } from '../actions';

const divStyle = {
  padding: "0.8em 1em",
  width: "100%",
  backgroundColor: "rgba(48, 207, 242, 10)",
  display: "flex",
  flexDirection: "row"
};

const linkStyle = {
  margin: "0.3em 0.7em",
  fontSize: "1.3em",
  color: "rgb(255, 255, 255)"
}

const welcomeStyle = {
  fontSize: "1.3em",
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center"
}

const welcomeLinkStyle = {
  color: "rgb(90, 90, 90)", 
  textDecoration: "underline"
};

const mapStateToProps = (state) => ({
  hasLoggedin: state.user.token !== undefined,
  name: state.user.name,
  id: state.user.id
})

const mapDispatchToProps = { logout };


const NavBar = ({ hasLoggedin, name, logout }) => (
  <div style={divStyle}>
    <Header style={{flexGrow: 100, margin: 0}} as='h1'>
      <Link style={{color: "black"}} to="/">TANET 30</Link>
    </Header>
    {hasLoggedin
      ?
        <div style={welcomeStyle}>
          Hello,&nbsp; 
          <Link style={welcomeLinkStyle} to={`/user`}>{name}</Link>
          &nbsp;!&nbsp;
          <Link style={{...linkStyle, fontSize: "1em"}} to="#" onClick={_ => logout()} >Logout</Link>
        </div>
      :
        <React.Fragment>
          <Link style={linkStyle} to="/login" >Login</Link>
          <Link style={linkStyle} to="/register" >Register</Link>
        </React.Fragment>
    }
    
  </div>
)

export default connect(mapStateToProps, mapDispatchToProps)(NavBar);