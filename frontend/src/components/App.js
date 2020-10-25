import React from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { NavBar, Login, AutoLogin, Welcome, ViewAllMeals } from '../components';
import { 
  UserStatus,
  Receive,
  Events,
  CreateEvent,
  Event,
  EventPage,
  PaperPage,
  Admin,
  FoodStaff,
  SeminarStaff,
  Company,
  Register,
  Poster,
  Cashier,
  UserAddTicket,
  Tickets,
  ParticipatedEvent,
  MainPage, 
  TVPage
} from '../containers';

const mapStateToProps = (state) => ({
  hasLoggedIn: state.user.token !== undefined,
  userGroup: state.user.group
})

const mustLogin = (hasLoggedIn, Tag) => {
  if(hasLoggedIn) return Tag;
  else return <Redirect to="/" />;
}

function App({hasLoggedIn, userGroup}) {
  let homeComponent = <UserStatus />;
  switch(userGroup) {
    case 'root':
      homeComponent = <Admin />;
      break;
    case 'foodStaff':
      homeComponent = <FoodStaff />;
      break;
    case 'seminarStaff':
      homeComponent = <SeminarStaff />;
      break;
    case 'company':
      homeComponent = <Company />;
      break;
    case 'poster':
      homeComponent = <Poster />;
      break;
    case 'cashier':
      homeComponent = <Cashier />;
      break;
    case 'user':
    default:
      break;
  }

  return (
    <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
      <BrowserRouter>
        <NavBar />
        <Switch>
          <Route exact path="/">
            {/*hasLoggedIn?
              <MainPage />
              :
              <Welcome />
            */}
            {hasLoggedIn?<MainPage />:<Welcome />}
          </Route>
          <Route exact path="/receive">
            {mustLogin(hasLoggedIn, <Receive />)}
          </Route>
          <Route exact path="/events">
            {mustLogin(hasLoggedIn, <Events />)}
          </Route>
          <Route exact path="/createEvent">
            {mustLogin(hasLoggedIn, <CreateEvent />)}
          </Route>
          <Route exact path="/userAddTicket">
            {mustLogin(hasLoggedIn, <UserAddTicket />)}
          </Route>
          <Route exact path="/tickets">
            {mustLogin(hasLoggedIn, <Tickets />)}
          </Route>
          <Route exact path="/participatedEvents">
            {mustLogin(hasLoggedIn, <ParticipatedEvent />)}
          </Route>
          <Route exact path="/home">
            {mustLogin(hasLoggedIn, homeComponent)}
          </Route>
          <Route exact path="/tv">
            {mustLogin(hasLoggedIn, <TVPage />)}
          </Route>
          <Route exact path="/viewAllMeals">
            {mustLogin(hasLoggedIn, <ViewAllMeals />)}
          </Route>
          <Route exact path="/event">
            {({ location }) => {
              const eventId = location.search.substring(4);
              return <Event eventId={eventId} />;
            }}
          </Route>
          <Route exact path='/event/page'>
            {({ location }) => {
              const eventId = location.search.substring(4);
              return mustLogin(hasLoggedIn, <EventPage eventId={eventId} url={location.search} id={eventId} title={eventId} />);
            }}
          </Route>
          <Route exact path='/paper/page'>
            {({ location }) => {
              const id = location.search.substring(4);
              return mustLogin(hasLoggedIn, <PaperPage id={id} info={location.state} />);
            }}
          </Route>
          <Route exact path="/login">
            {({ location }) => {
              const query = new URLSearchParams(location.search);
              const [email, password] = [query.get("email"), query.get("password")];
              if(email && password) return <AutoLogin email={email} password={password} />;
              else return <Login />;
            }}
          </Route>
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
