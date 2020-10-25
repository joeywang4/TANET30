import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Form, Dropdown, Button, Message, Grid } from 'semantic-ui-react';
import { BACKEND } from '../config';
import { useAPI } from '../hooks';

const ticketTypeEnum = ['lunch', 'dinner'];

const UpdateMeals = () => {
  const { token } = useSelector(state => state.user);
  const [createState, create] = useAPI("text");
  const [ticketType, setTicketType] = useState(null);
  const [meatTicketAmount, setMeatTicketAmount] = useState(-1);
  const [veganTicketAmount, setVeganTicketAmount] = useState(-1);
  const [error, setError] = useState(false);
  // const [errMsg, setErrMsg] = useState(false);

  const onSubmit = () => {
    const body = { type: ticketType, meat: meatTicketAmount, vegan: veganTicketAmount };
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
    <Grid textAlign='center'>
      <Grid.Column>
        <Form onSubmit={onSubmit} loading={createState.loading}>
          <Form.Field required>
            <label style={{fontSize:"1.1em"}}>Meal Type</label>
            <Dropdown
              placeholder="Choose Ticket Type"
              selection
              options={ticketTypeEnum.map((ticketType) => ({ key: ticketType, text: ticketType, value: ticketType }))}
              onChange={(_, {value}) => {setTicketType(value)}}
            />
          </Form.Field>
          <Form.Field required>
            <label style={{fontSize:"1.1em"}}>Mealboxes Amount (Meat)</label>
            <input 
                type='number' 
                placeholder='Some Number...' 
                onInput={e => setMeatTicketAmount(parseInt(e.target.value))} 
              />
          </Form.Field>
          <Form.Field required>
            <label style={{fontSize:"1.1em"}}>Mealboxes Amount (Vegan)</label>
            <input 
                type='number' 
                placeholder='Some Number...' 
                onInput={e => setVeganTicketAmount(parseInt(e.target.value))} 
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
      </Grid.Column>
    </Grid>
  );
}

export default UpdateMeals;
