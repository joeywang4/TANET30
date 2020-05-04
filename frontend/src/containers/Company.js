import React, { useState } from 'react';
import { Header, Icon, Divider, Menu, Message, CardGroup, Card, Loader } from 'semantic-ui-react';
import QrReader from 'react-qr-reader';
import { useSelector } from 'react-redux';
import { BACKEND } from '../config';
import ok from './Event/ok.mp3';
import warning from './Event/warning.mp3';
import { useAPI, useAudio } from '../hooks';
import { todayRange, parseQRCode } from '../util';

const functions = ["Scan QR-Code", "Participants"];

export default () => {
  console.log("[*] Viewing Company Page");
  const [activeItem, setActiveItem] = useState(functions[0]);
  const [getEventState, getEvent] = useAPI("json");
  const [okAudioTag, playOK] = useAudio(ok);
  const [warningAudioTag, playWarning] = useAudio(warning);
  const onSuccess = () => {
    playOK();
    setTimeout(() => {
      setFreeze(0);
    }, 5000);
  }
  const onAPIError = (errMsg) => {
    playWarning();
    setTimeout(() => {
      setFreeze(0);
    }, 5000);
    alert(errMsg); 
  }
  const [signinState, signin, initSignin] = useAPI("json", onSuccess, onAPIError);
  const [error, setError] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [freeze, setFreeze] = useState(0);
  const { token, id } = useSelector(state => state.user)
  const event = (getEventState.success&&getEventState.response.length > 0)?getEventState.response[0]:{};
  const participants = event.participant || [];

  const init = () => {
    setError(false);
    setErrMsg("");
    initSignin();
    const [begin, end] = todayRange();
    getEvent(BACKEND+`/event?admin=${id}&begin=${begin}&end=${end}&populate=1`, "GET", null, { 'authorization': token });
  }

  if(getEventState.isInit()) {
    init();
  }

  const onScan = (data) => {
    if (data === null || data === freeze) return;
    if (error === true) {
      setError(false);
      setErrMsg("");
    }
    setFreeze(data);
    const id = parseQRCode(data);
    signin(
      BACKEND + "/event/addParticipant",
      "POST",
      JSON.stringify({ eventId: event._id, userId: id }),
      { 'authorization': token, 'content-type': "application/json" }
    )
  }

  const onError = () => {
    setError(true);
    setErrMsg("Scan QR-Code Error!");
  }

  let display = null;
  switch (activeItem) {
    default:
    case functions[0]: // Scan QR-Code
      display = (
        <React.Fragment>
          <QrReader
            delay={300}
            onError={onError}
            onScan={onScan}
            style={{ maxWidth: "500px", width: "100%", margin: "auto" }}
          />
          {signinState.error || error
            ?
            <Message negative>{error ? errMsg : signinState.errMsg}</Message>
            :
            null
          }
          {signinState.success
            ?
            <Message positive>
              <Message.Header>
                {signinState.response.name}
              </Message.Header>
              <Message.Content>
                checkin success!
              </Message.Content>
            </Message>
            :
            null
          }
        </React.Fragment>
      )
      break;
    case functions[1]: // Participants
      display = (
        <CardGroup stackable>
          {participants.map((participant) => (
            <Card key={participant._id} link>
              <Card.Header as='h3'>{participant.name}</Card.Header>
              <Card.Meta>{participant.email}</Card.Meta>
            </Card>
          ))}
        </CardGroup>
      )
      break;
  }


  return (
    <div style={{marginTop: "2em", width: "80%"}}>
      <Header as='h2' icon textAlign='center'>
        <Icon name='add user' circular />
        <Header.Content>Stall Checkin</Header.Content>
      </Header>
      <Divider />
      <Menu stackable widths={2}>
        {functions.map(_func => (
          <Menu.Item
            name={_func}
            active={activeItem === _func}
            onClick={(_, { name }) => {setActiveItem(name); init();}}
            key={_func}
          />
        ))}
      </Menu>
      {getEventState.loading?<Loader active={true} />:null}
      {(getEventState.success&&getEventState.response.length > 0)?display:null}
      {getEventState.error?
        <Header as='h2' icon textAlign='center'>
          <Icon name='bug' />
          <Header.Content>Some error occurred!</Header.Content>
        </Header>
      :null}
      {(getEventState.success&&getEventState.response.length===0)?
        <Header as='h2' icon textAlign='center'>
          <Icon name='warning' circular />
          <Header.Content>Event does not exist!</Header.Content>
        </Header>
      :null}
      {okAudioTag}
      {warningAudioTag}
    </div>
  )
}