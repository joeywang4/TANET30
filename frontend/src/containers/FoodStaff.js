import React, { useState } from 'react';
import { Header, Icon, Divider, Dropdown, Menu, Message, CardGroup, Card, Loader } from 'semantic-ui-react';
import QrReader from 'react-qr-reader';
import { useSelector } from 'react-redux';
import { ticketTypeEnum, BACKEND } from '../config';
import ok from './Event/ok.mp3';
import warning from './Event/warning.mp3';
import noFood from './Event/no_food.wav';
import { useAPI, useAudio } from '../hooks';
import { today, parseQRCode } from '../util';
import { usedDate } from '../util';
const foodTypes = ticketTypeEnum.map(type => ({ key: type, value: type, text: type }));
const functions = ["Scan QR-Code", "Available Tickets", "Used Tickets"];

export default () => {
  console.log("[*] Viewing Food Staff Page");
  const [type, setType] = useState(null);
  const [activeItem, setActiveItem] = useState(functions[0]);
  const [getTicketState, getTicket] = useAPI("json");
  const [okAudioTag, playOK] = useAudio(ok);
  const [warningAudioTag, playWarning] = useAudio(warning);
  const [noFoodAudioTag, playNoFood] = useAudio(noFood);
  const onSuccess = () => {
    playOK();
    setTimeout(() => {
      setFreeze(0);
    }, 5000);
  }
  const onAPIError = (errMsg) => {
    if(errMsg === "No Ticket!") playNoFood();
    else playWarning();
    setTimeout(() => {
      setFreeze(0);
    }, 5000);
    // alert(errMsg);
  }
  const [spendTicketState, spendTicket, initSpendTicket] = useAPI("json", onSuccess, onAPIError);
  const [error, setError] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [freeze, setFreeze] = useState(0);
  const { token } = useSelector(state => state.user)

  const tickets = getTicketState.response || [];
  const availTickets = tickets.filter(ticket => ticket.usedTime === 0);
  const usedTickets = tickets.filter(ticket => ticket.usedTime !== 0);

  const init = (_type=type) => {
    setError(false);
    setErrMsg("");
    initSpendTicket();
    if(_type !== null) {
      getTicket(
        BACKEND + `/ticket?date=${today()}&type=${_type}&populate=true`,
        "GET",
        null,
        { 'authorization': token }
      );
    }
  }

  const onSelect = (_, { value: type }) => {
    setType(type);
    init(type);
  }

  const onScan = (data) => {
    if (data === null || data === freeze) return;
    if (error === true) {
      setError(false);
      setErrMsg("");
    }
    setFreeze(data);
    const id = parseQRCode(data);
    spendTicket(
      BACKEND + "/ticket/use",
      "POST",
      JSON.stringify({ owner: id, type }),
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
            placeholder='Select Type'
            fluid
            selection
            onChange={onSelect}
            options={foodTypes}
            value={type}
            style={{ margin: "1em 0" }}
          />
          {spendTicketState.error || error
            ?
            <Message negative>{error ? errMsg : spendTicketState.errMsg}</Message>
            :
            null
          }
          {spendTicketState.success
            ?
            <Message positive>
              <Message.Header>
                {spendTicketState.response.name}
              </Message.Header>
              <Message.Content>
                checkin success!
              </Message.Content>
            </Message>
            :
            null
          }
          {type === null ? null :
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
    case functions[1]: // Available Tickets
      display = getTicketState.loading?<Loader active={true} />:(
        <CardGroup stackable>
          {availTickets.map(({owner}) => (
            <Card key={owner._id} link>
              <Card.Header as='h3'>{owner.name}</Card.Header>
              <Card.Meta>{owner.email}</Card.Meta>
            </Card>
          ))}
        </CardGroup>
      )
      break;
    case functions[2]: // Used Tickets
      display = getTicketState.loading?<Loader active={true} />:(
        <CardGroup stackable>
          {usedTickets.map(({owner, usedTime}) => (
            <Card key={owner._id} link>
              <Card.Header as='h3'>{owner.name}</Card.Header>
              <Card.Meta>
                {usedDate(usedTime)}
                <br />
                {owner.email}
              </Card.Meta>
            </Card>
          ))}
        </CardGroup>
      )
      break;
  }

  return (
    <div style={{ marginTop: "2em", width: "80%" }}>
      <Header as='h2' icon textAlign='center'>
        <Icon name='food' circular />
        <Header.Content>Send Food</Header.Content>
      </Header>
      <Divider />
      <Menu stackable widths={3}>
        {functions.map(_func => (
          <Menu.Item
            name={_func}
            active={activeItem === _func}
            onClick={(_, { name }) => {setActiveItem(name); init();}}
            key={_func}
          />
        ))}
      </Menu>
      {display}
      {okAudioTag}
      {warningAudioTag}
      {noFoodAudioTag}
    </div>
  )
}