import React from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { NavBar, Welcome } from '../components';
import { UserStatus, Login, Register, Receive, Send } from '../containers';

const mapStateToProps = (state) => ({
  hasLoggedIn: state.user.token !== undefined
})

const mustLogin = (hasLoggedIn, Tag) => {
  if(hasLoggedIn) return <Tag />
  else return <Redirect to="/" />;
}

function App({hasLoggedIn}) {
  return (
    <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
      <BrowserRouter>
        <NavBar />
        <Switch>
          <Route exact path="/">
            {hasLoggedIn?
              <UserStatus />
              :
              <Welcome />
            }
          </Route>
          <Route exact path="/receive">
            {mustLogin(hasLoggedIn, Receive)}
          </Route>
          <Route exact path="/send">
            {mustLogin(hasLoggedIn, Send)}
          </Route>
          <Route exact path="/login"><Login /></Route>
          <Route exact path="/register"><Register /></Route>
          <Route path="/:unknown">
            {({ match }) => {
              return <strong>{`${match.params.unknown} Not Found!`}</strong>;
            }}
          </Route>
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default connect(mapStateToProps)(App);