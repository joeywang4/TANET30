import React, { useState } from 'react';
import { Header, Icon, Divider, Dropdown, Menu, Message, CardGroup, Card, Loader } from 'semantic-ui-react';
import QrReader from 'react-qr-reader';
import { useSelector } from 'react-redux';
import { BACKEND } from '../config';
import ok from './Event/ok.mp3';
import warning from './Event/warning.mp3';
import { useAPI, useAudio } from '../hooks';
import { todayRange, parseQRCode } from '../util';

const functions = ["Scan QR-Code", "Participant"];

export default () => {
  console.log("[*] Viewing Seminar Staff Page");
  const [dropdownValue, setDropdownValue] = useState(null);
  const [activeItem, setActiveItem] = useState(functions[0]);
  const [getSeminarNameState, getSeminarName] = useAPI("json");
  const [getSeminarState, getSeminar, initGetSeminar] = useAPI("json");
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
    //alert(errMsg); 
  }
  const [signinState, signin, initSignin] = useAPI("json", onSuccess, onAPIError);
  const [error, setError] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [freeze, setFreeze] = useState(0);
  const { token } = useSelector(state => state.user)

  if(getSeminarNameState.isInit()) {
    const [begin, end] = todayRange();
    getSeminarName(BACKEND+`/event?group=seminarStaff&begin=${begin}&end=${end}`, "GET", null, { 'authorization': token });
  }
  const seminars = getSeminarNameState.response || [];
  const seminarNames = seminars.map(seminar => ({ key: seminar.name, value: seminar.name, text: seminar.name }));
  const seminar = getSeminarState.response || null;

  const init = (seminarName) => {
    setError(false);
    setErrMsg("");
    initSignin();
    if(seminarName || dropdownValue !== null) {
      initGetSeminar();
      getSeminar(BACKEND+`/event?name=${encodeURIComponent(seminarName || dropdownValue)}`, "GET", null, { 'authorization': token });
    }
  }

  const onSelect = (_, { value: seminarName }) => {
    const choosedSeminar = seminars.find(seminar => seminar.name === seminarName);
    if(choosedSeminar !== undefined) {
      setDropdownValue(seminarName);
    }
    init(seminarName);
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
      JSON.stringify({ eventId: seminar._id, userId: id }),
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
          <Dropdown
            placeholder='Select Event'
            fluid
            selection
            onChange={onSelect}
            options={seminarNames}
            value={dropdownValue}
            style={{ margin: "1em 0" }}
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
          {!(getSeminarState.success) || seminar === null ? null :
            <QrReader
              delay={300}
              onError={onError}
              onScan={onScan}
              style={{ maxWidth: "500px", width: "100%", margin: "auto" }}
            />
          }
        </React.Fragment>
      )
      break;
    case functions[1]: // Participant
      if(!seminar || !(seminar.participant)) {
        display = null;
        break;
      }
      display = (
        <CardGroup stackable>
          {seminar.participant.map((participant) => (
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
        <Icon name='bullhorn' circular />
        <Header.Content>Seminar</Header.Content>
      </Header>
      <Divider horizontal>
        <Header as='h4'>
          <Icon name='calendar alternate outline' />
          Today's Event
        </Header>
      </Divider>
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
      {getSeminarNameState.loading || getSeminarState.loading?<Loader active={true} />:null}
      {getSeminarNameState.error || getSeminarState.error?
        <Header as = 'h4'>
          <Icon name='bug' />
          Some error occurred.
        </Header>
      :null}
      {getSeminarNameState.success?display:null}
      {okAudioTag}
      {warningAudioTag}
    </div>
  )
}