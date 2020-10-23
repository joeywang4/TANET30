import React, { useState } from 'react';
import { Dropdown, Menu, Image, Button, Sidebar, Responsive, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { logout } from '../actions';
import "../styles/Navbar.css";

const mapStateToProps = (state) => ({
  hasLoggedin: state.user.token !== undefined,
  id: state.user.id,
  name: state.user.name,
  userGroup: state.user.group
})

const mapDispatchToProps = { logout };

function NavBar({ hasLoggedin, name, userGroup, logout }) {
  const [visible, setVisible] = useState(false);
  const hide = () => setVisible(false);
  const userDesktopMenu = (
    <Menu secondary className="welcome-menu">
      <Menu.Item
        name='general'
        as={Link} to="/"
        style={{ color: 'white' }}
      >
        大會資訊
        </Menu.Item>
      <Dropdown text='My Info' className='link item' style={{ color: 'white' }}>
        <Dropdown.Menu>
          <Dropdown.Item as={Link} to="/participatedEvents">Events</Dropdown.Item>
          <Dropdown.Item as={Link} to="/tickets">Food Tickets</Dropdown.Item>
          <Dropdown.Item as={Link} to="/home">Transactions</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <Menu.Item
        name='wallet'
        as={Link} to="/receive"
        style={{ color: 'white' }}
      >
        My QRcode
      </Menu.Item>
      <Button basic inverted className="small-link" onClick={() => logout()} >Logout</Button>
    </Menu>
  )
  const sideBar = (
    <Sidebar
      as={Menu}
      animation='overlay'
      direction="right"
      inverted
      onHide={hide}
      vertical
      visible={visible}
      width='thin'
      icon='labeled'
    >
      <Menu.Item as={Link} onClick={hide} to="/home">
        <Icon name='user' />
        {name}
      </Menu.Item>
      <Menu.Item as={Link} onClick={hide} to="/participatedEvents">
        <Icon name='list' color="teal" />
        Events
      </Menu.Item>
      <Menu.Item as={Link} onClick={hide} to="/tickets">
        <Icon name='food' color="orange" />
        Food Tickets
      </Menu.Item>
      <Menu.Item as={Link} onClick={hide} to="/home">
        <Icon name='dollar' color="yellow" />
        Transactions
      </Menu.Item>
      <Menu.Item
        name='wallet'
        as={Link} to="/receive"
        onClick={hide}
      >
        <Icon name='qrcode' color="grey" />
        My QRcode
      </Menu.Item>
      <Menu.Item
        onClick={() => {hide(); logout();}}
      >
        <Icon name='sign-out' color="grey" />
        Logout
      </Menu.Item>
    </Sidebar>
  )

  const mainBar = userGroup === "user"
    ?
    <React.Fragment>
      <Responsive className="hamburger" maxWidth={767}>
        <Button icon inverted basic onClick={() => setVisible(true)}>
          <Icon name="sidebar" size="big" />
        </Button>
        {sideBar}
      </Responsive>
      <Responsive minWidth={768}>
        {userDesktopMenu}
      </Responsive>
    </React.Fragment>
    :
    (
      <div className="welcome-text">
        Hello,&nbsp;
        <Link className="welcome-link" to={'/home'}>{name}</Link>
        &nbsp;!&nbsp;
        <Button basic inverted className="small-link" onClick={_ => logout()} >Logout</Button>
      </div>
    );

  return (
    <div className="navbar">
      <Image src="logo.png" as='a' href='/' size='medium' className="logo" />
      {hasLoggedin
        ?
        mainBar
        :
        <React.Fragment>
          <Link class="link" to="/login" >Login</Link>
          <Link class="link" to="/register" >Register</Link>
        </React.Fragment>
      }
    </div>
  );
}


export default connect(mapStateToProps, mapDispatchToProps)(NavBar);