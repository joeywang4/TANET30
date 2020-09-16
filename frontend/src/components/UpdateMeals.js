import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Form, Dropdown, Button, Message } from 'semantic-ui-react';
import { BACKEND, ticketTypeEnum } from '../config';
import { useAPI } from '../hooks';

const UpdateMeals = () => {
  const { token } = useSelector(state => state.user);
  const [createState, create] = useAPI("text");
  const [ticketType, setTicketType] = useState(null);
  const [ticketAmount, setTicketAmount] = useState(-1);
  const [error, setError] = useState(null);

  const onSubmit = () => {
    const body = { type: ticketType, amount: ticketAmount };
    if(!(ticketTypeEnum.includes(body.type))) {
      setError("Invalid Ticket Type!");
      return;
    }
    setError(null);
    create(
      BACKEND + "/ticket/amount",
      "POST", 
      JSON.stringify(body), 
      { 'authorization': token, 'content-type': "application/json" }
    )
  }

  return (
    <Form onSubmit={onSubmit} loading={createState.loading}>
      <Form.Field required>
        <label>Meal Type</label>
        <Dropdown
          placeholder="Choose Ticket Type"
          selection
          options={ticketTypeEnum.map((ticketType) => ({ key: ticketType, text: ticketType, value: ticketType }))}
          onChange={(_, {value}) => {setTicketType(value)}}
        />
      </Form.Field>
      <Form.Field required>
        <label>Mealboxes Amount</label>
        <input 
            type='number' 
            placeholder='Some Number...' 
            onInput={e => setTicketAmount(parseInt(e.target.value))} 
          />
        </Form.Field>
      {createState.error || error
        ?
        <Message negative>{error ? error : createState.errMsg}</Message>
        :
        null
      }
      {createState.success
        ?
        <Message positive>Update Mealboxes Amount Success!</Message>
        :
        null
      }
      <Button color="green" type="submit" >
        Update
      </Button>
    </Form>
  );
}

export default UpdateMeals;
