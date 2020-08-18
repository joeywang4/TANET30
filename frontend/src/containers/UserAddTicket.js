import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Header, Divider, Form, Dropdown, Button, Message } from 'semantic-ui-react';
import { BACKEND, ticketTypeEnum } from '../config';
import { useAPI } from '../hooks';

const AddTicketForm = () => {
  const { token } = useSelector(state => state.user);
  const { id } = useSelector(state => state.user);
  const [createState, create] = useAPI("text");
  const [date, setDate] = useState(null);
  const [ticketType, setTicketType] = useState(null);
  const [error, setError] = useState(false);
  const [errMsg, setErrMsg] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    const body = { owner: id, type: ticketType, date: date };
    if(!(ticketTypeEnum.includes(body.type))) {
      setErrMsg("Invalid Ticket Type!");
      setError(true);
      return;
    }
    if(!(body.date) || body.date.length !== 10 || !(/\d{4}-[0-1]\d{1}-[0-3]\d{1}/.test(body.date))) {
      setErrMsg("Invalid Date!");
      setError(true);
      return;
    }
    setError(false);
    create(
      BACKEND + "/ticket/give",
      "POST", 
      JSON.stringify(body), 
      {'authorization': token, 'content-type': "application/json"}
    )
  }

  return (
    <Form onSubmit={e => onSubmit(e)} loading={createState.loading} >
      <Form.Field required>
        <label style={{fontSize:"18px", marginBottom:"7px"}}>Ticket Type</label>
        <Dropdown
          placeholder="Choose Ticket Type"
          selection
          options={ticketTypeEnum.map((ticketType) => ({ key: ticketType, text: ticketType, value: ticketType }))}
          onChange={(_, {value}) => {setTicketType(value)}}
        />
      </Form.Field>
      <Form.Field required>
        <label style={{fontSize:"18px", marginBottom:"7px"}}>Date</label>
        <Form.Input type="date" required={true} id="date" onChange={e => { setDate(e.target.value); }} />
      </Form.Field>
      {createState.error || error
        ?
        <Message negative>{error ? errMsg : createState.errMsg}</Message>
        :
        null
      }
      {createState.success
        ?
        <Message positive>Create Ticket Success!</Message>
        :
        null
      }
      <Button color="green" type="submit">
        Create
      </Button>
    </Form>
  );
}

const UserAddTicket = () => (
  <div style={{ marginTop: "2em", width: "80%" }}>
    <Divider horizontal>
      <Header as='h2'>
        Add Meal
        </Header>
    </Divider>
    <div style={{ marginTop: "2em", marginBottom: "2em", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <AddTicketForm />
    </div>
  </div>
)

export default UserAddTicket;
