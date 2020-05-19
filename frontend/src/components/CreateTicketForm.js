import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Form, Dropdown, Button, Message } from 'semantic-ui-react';
import { BACKEND, ticketTypeEnum } from '../config';
import { useChooseUser, useAPI } from '../hooks';

const CreateTicketForm = () => {
  const { token } = useSelector(state => state.user);
  const [user, userChooser] = useChooseUser();
  const [createState, create] = useAPI("text");
  const [date, setDate] = useState(null);
  const [ticketType, setTicketType] = useState(null);
  const [error, setError] = useState(false);
  const [errMsg, setErrMsg] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    const body = { owner: user._id, type: ticketType, date: date };
    if(!(body.owner)) {
      setErrMsg("Owner is required!");
      setError(true);
      return;
    }
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
    <Form onSubmit={e => onSubmit(e)} loading={createState.loading}>
      <Form.Field required>
        <label>Owner</label>
        <Form.Group widths="equal">
          {userChooser}
        </Form.Group>
      </Form.Field>
      <Form.Field required>
        <label>Ticket Type</label>
        <Dropdown
          placeholder="Choose Ticket Type"
          selection
          options={ticketTypeEnum.map((ticketType) => ({ key: ticketType, text: ticketType, value: ticketType }))}
          onChange={(_, {value}) => {setTicketType(value)}}
        />
      </Form.Field>
      <Form.Field required>
        <label>Date</label>
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
      <Button color="green" type="submit" >
        Create
      </Button>
    </Form>
  );
}

export default CreateTicketForm;