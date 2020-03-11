import React, { Component } from 'react';
import { Menu, CardGroup, Card, Loader, Header, Icon, Message } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import QrReader from 'react-qr-reader';
import { MyQRCode } from '../../components';
import { BACKEND } from '../../config';

const [ERROR, SUCCESS, LOADING] = [0, 1, 2];

const mapStateToProps = (state) => ({
  token: state.user.token,
  id: state.user.id
})

const inArray = (array, data) => array.find(element => element === data) !== undefined;
const prefixZero = (num, len = 2) => {
  const raw = String(num);
  return raw.length < len ? "0".repeat(len-raw.length)+raw : raw;
}
const epochToTime = (_begin, _end) => {
  const begin = new Date(_begin);
  const end = new Date(_end);
  const year = begin.getFullYear();
  const beginMonth = begin.getMonth()+1;
  const endMonth = end.getMonth()+1;
  const beginDate = begin.getDate();
  const endDate = end.getDate();
  const beginHour = prefixZero(begin.getHours());
  const beginMinute = prefixZero(begin.getMinutes());
  const endHour = prefixZero(end.getHours());
  const endMinute = prefixZero(end.getMinutes());
  return `${year} ${beginMonth}/${beginDate} ${beginHour}:${beginMinute} ~ ${endMonth}/${endDate} ${endHour}:${endMinute}`;
}

class Event extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeItem: 'Participant',
      status: LOADING,
      scanBusy: false,
      msg: "",
      err: ""
    }
    this.event = null;
    this.scannedUsers = [];
    this.getEvent(this.props.eventId);
  }

  handleItemClick = (_, { name }) => this.setState({ activeItem: name, msg: "", err: "", scanBusy: false });

  getEvent = async (id) => {
    await fetch(BACKEND+`/event?id=${id}`, {
      method: "GET",
      headers: {'authorization': this.props.token}
    })
    .then(res => {
      if(res.status !== 200) {
        this.setState({status: ERROR});
      }
      else{
        return res.json();
      }
    })
    .then(data => {
      this.event = data;
      this.setState({status: SUCCESS});
    })
    .catch(err => {
      this.setState({status: ERROR});
      console.error(err);
    });
  }

  setError = (msg) => {
    this.setState(state => {
      state.err = (
        <React.Fragment>
          <Message.Content>
            <Message.Header>Scanning Failed!</Message.Header>
            {msg}
          </Message.Content>
        </React.Fragment>
      )
      return state;
    })
    return;
  }

  checkinEvent = (password) => {
    if(password === null || this.state.scanBusy) return;
    this.setState({scanBusy: true});
    fetch(BACKEND+"/join", {
      method: "POST",
      body: JSON.stringify({eventId: this.props.eventId, password}),
      headers: {'authorization': this.props.token, 'content-type': "application/json"}
    })
    .then(res => {
      if(res.status === 200) {
        this.setState(state => {
          state.scanBusy = false;
          state.msg = (
            <React.Fragment>
              <Message.Content>
                <Message.Header>Checkin Success!</Message.Header>
              </Message.Content>
            </React.Fragment>
          );
          return state;
        })
      }
      else {
        res.text().then(data => this.setError(data));
      }
    })
    .catch(error => {
      console.error(error);
      this.setError(error);
    })
  }

  checkinUser = (userId) => {
    if(userId === null || inArray(this.scannedUsers, userId) || this.state.scanBusy) return;
    console.log("checkinUser:", userId);
    this.setState({scanBusy: true});
    fetch(BACKEND+"/addParticipant", {
      method: "POST",
      body: JSON.stringify({eventId: this.props.eventId, userId}),
      headers: {'authorization': this.props.token, 'content-type': "application/json"}
    })
    .then(res => {
      if(res.status === 200) {
        res.json().then(user => {
          this.scannedUsers.push(userId);
          this.event.participant.push(userId);
          this.setState(state => {
            state.scanBusy = false;
            state.msg = (
              <React.Fragment>
                <Message.Content>
                  <Message.Header>
                    <Link to={`/user?id=${user.id}`}>{user.name}</Link>
                    &nbsp;checkin success!
                  </Message.Header>
                </Message.Content>
              </React.Fragment>
            );
            return state;
          })
        })
      }
      else {
        res.text().then(data => this.setError(data));
      }
    })
    .catch(error => {
      console.error(error);
      this.setError(error);
    })
  }

  handleError = () => {
    this.setState({err: "Scan QRCode Error"});
  }

  render() {
    const { activeItem } = this.state;
    const { id } = this.props;
    let functions = ["Participant"];
    let display = null;

    if(this.state.status === LOADING) {
      return (
        <Loader active>Loading</Loader>
      );
    }
    else if(this.state.status === ERROR) {
      return (
        <Header icon>
          <Icon name="bug" />
          <div style={{marginTop: "2vh"}} />
          看來出了點差錯，請您再試一次。
        </Header>
      );
    }
    else {
      const now = Date.now();
      const running = this.event.begin <= now && this.event.end >= now;
      if(this.event.admin === id && running) {
        functions = functions.concat(["Show checkin QRCode", "Checkin user"]);
      }
      else if(!inArray(this.event.participant, id) && running) {
        functions = functions.concat(["Show user QRCode", "Scan checkin QRCode"]);
      }

      const participants = (
        <CardGroup>
          {this.event.participant.map(participant => (
            <Card as={Link} to={`/user?id=${participant._id}`} key={participant._id} link>
              <Card.Content>
                <Card.Header>{participant.name}</Card.Header>
              </Card.Content>
            </Card>
          ))}
        </CardGroup>
      )

      switch(this.state.activeItem) {
        case 'Show checkin QRCode':
          if(this.event.password !== "") {
            display = <MyQRCode data={this.event.password} />
          }
          else display = <span>Checkin QRCode is not available</span>
          break;
        case 'Checkin user':
          display = (
            <QrReader
              delay={300}
              onError={this.handleError}
              onScan={this.checkinUser}
              style={{maxWidth: "500px", width: "100%"}}
            />
          )
          break;
        case 'Show user QRCode':
          display = <MyQRCode data={this.props.id} />
          break;
        case 'Scan checkin QRCode':
          display = (
            <QrReader
              delay={300}
              onError={this.handleError}
              onScan={this.checkinEvent}
              style={{maxWidth: "500px", width: "100%"}}
            />
          )
          break;
        case 'Participant':
        default:
          display = participants;
          break;
      }
    }
    return (
      <div>
        <Header textAlign='center' as="h1">{this.event.name}</Header>
        <Header textAlign='center' as="h5">{epochToTime(this.event.begin, this.event.end)}</Header>
        <Menu stackable>
          {functions.map(_func => (
            <Menu.Item
              name={_func}
              active={activeItem === _func}
              onClick={this.handleItemClick}
              key={_func}
            />
          ))}
        </Menu>

        <div>
          {display}
        </div>
        {this.state.err
          ?
          <Message negative>{this.state.err}</Message>
          :
          null
        }
        {this.state.msg
          ?
          <Message positive>{this.state.msg}</Message>
          :
          null
        }
      </div>
    )
  }
}

export default connect(mapStateToProps)(Event);