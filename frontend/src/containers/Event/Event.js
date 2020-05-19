import React, { useState } from 'react';
import { Menu, CardGroup, Card, Loader, Header, Icon, Message } from 'semantic-ui-react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import QrReader from 'react-qr-reader';
import ok from './ok.mp3';
import { BACKEND } from '../../config';
import { epochToTime, parseQRCode } from '../../util';
import { useAPI, useAudio } from '../../hooks';

const Event = ({ eventId, style }) => {
  const [activeItem, setActiveItem] = useState("Checkin user");
  const [freeze, setFreeze] = useState(0);
  const { token } = useSelector(state => state.user);
  const [getEventState, getEvent] = useAPI('json');
  const [audioTag, play] = useAudio(ok);
  const onSuccess = () => {
    play(); 
    //alert("Success!");
  }
  const [checkinUserState, checkinUser] = useAPI(BACKEND + "/addParticipant", "json", onSuccess);

  let functions = ["Checkin user", "Participant"];
  let display = null;

  if(getEventState.isInit()) getEvent(BACKEND + `/event?id=${eventId}`);
  if (getEventState.isInit() || getEventState.loading) return <Loader active>Loading</Loader>;
  if (getEventState.error) {
    return (
      <Header icon>
        <Icon name="bug" />
        <div style={{ marginTop: "2vh" }} />
          看來出了點差錯，請您再試一次。
      </Header>
    );
  }
  const event = getEventState.response;
  const participants = (
    <CardGroup>
      {event.participant.map(participant => (
        <Card as={Link} to={`/user?id=${participant._id}`} key={participant._id} link>
          <Card.Content>
            <Card.Header>{participant.name}</Card.Header>
          </Card.Content>
        </Card>
      ))}
    </CardGroup>
  )

  const onScan = (data) => {
    if (data === null || freeze === data || checkinUserState.loading) return;
    const userId = parseQRCode(data);
    setFreeze(data);
    checkinUser("POST", JSON.stringify({ eventId, userId }), { 'authorization': token, 'content-type': "application/json" });
  }
  const onError = () => {
    console.error("Scan QR-Code Error");
  }

  switch (activeItem) {
    case 'Checkin user':
      display = (
        <QrReader
          delay={300}
          onError={onError}
          onScan={onScan}
          style={{ maxWidth: "500px", width: "100%", margin: "auto" }}
        />
      )
      break;
    case 'Participant':
    default:
      display = participants;
      break;
  }
  return (
    <div
      style={style}
    >
      {audioTag}
      <Header textAlign='center' as="h1">{event.name}</Header>
      <Header textAlign='center' as="h5">{epochToTime(event.begin, event.end)}</Header>
      <Menu stackable>
        {functions.map(_func => (
          <Menu.Item
            name={_func}
            active={activeItem === _func}
            onClick={(_, { name }) => setActiveItem(name)}
            key={_func}
          />
        ))}
      </Menu>
      <div>
        {display}
      </div>
      {checkinUserState.error
        ?
        <Message negative>Checkin Error!</Message>
        :
        null
      }
      {checkinUserState.success
        ?
        <Message positive>
          <React.Fragment>
            <Message.Content>
              <Message.Header>
                <Link to={`/user?id=${checkinUserState.id}`}>
                  {checkinUserState.name}
                </Link>
                &nbsp;checkin success!
              </Message.Header>
            </Message.Content>
          </React.Fragment>
        </Message>
        :
        null
      }
    </div>
  )
}


export default Event;