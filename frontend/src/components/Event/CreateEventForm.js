import React, { useState } from 'react';
import { Form, Button, Message } from 'semantic-ui-react';
import { useSelector } from 'react-redux'
import { useAPI, useChooseUser } from '../../hooks';
import { BACKEND } from '../../config';

const CreateEventForm = () => {
  const [createState, create] = useAPI("text");
  const [admin, userChooser] = useChooseUser();
  const [name, setName] = useState("");
  const [error, setError] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [beginDate, setBeginDate] = useState("");
  const [beginTime, setBeginTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reward, setReward] = useState(0);
  const {token} = useSelector(state => state.user)

  const onSubmit = (e) => {
    e.preventDefault();

    const begin =  Date.parse(beginDate + " " + beginTime);
    const end =  Date.parse(endDate + " " + endTime);
    if(end <= begin) {
      setError(true);
      setErrMsg("End time should be later than begin time!");
      return;
    }

    const body = {name, begin, end, reward};
    if(admin._id) body['admin'] = admin._id;
    create(
      BACKEND+"/event",
      "POST", 
      JSON.stringify(body), 
      {'authorization': token, 'content-type': "application/json"}
    )
  }

  return (
    <Form onSubmit={e => onSubmit(e)} loading={createState.loading}>
      <Form.Field required>
        <label>Name</label>
        <Form.Input type="text" required={true} placeholder="e.g. Keynote" id="name" onChange={e => { setName(e.target.value); }} />        
      </Form.Field>
      <Form.Field>
        <label>Admin</label>
        <Form.Group widths="equal">
          {userChooser}
        </Form.Group>
      </Form.Field>
      <Form.Field required>
        <label>Time Range</label>
        <Form.Group widths="equal">
          <Form.Input type="date" required={true} id="dateBegin" onChange={e => { setBeginDate(e.target.value); }} />
          <Form.Input type="time" required={true} id="timeBegin" onChange={e => { setBeginTime(e.target.value); }} />
        </Form.Group>
        <label style={{ textDecoration: "none", marginBottom: "1em" }}>to</label>
        <Form.Group widths="equal">
          <Form.Input type="date" required={true} id="dateEnd" onChange={e => { setEndDate(e.target.value) }} />
          <Form.Input type="time" required={true} id="timeEnd" onChange={e => { setEndTime(e.target.value) }} />
        </Form.Group>
      </Form.Field>
      <Form.Field required>
        <label>Reward</label>
        <Form.Input type="number" required={true} placeholder="e.g. 100" id="reward" onChange={e => { setReward(e.target.value); }} />        
      </Form.Field>
      {createState.error || error
        ?
        <Message negative>{error?errMsg:createState.errMsg}</Message>
        :
        null
      }
      {createState.success
        ?
        <Message positive>Create Event Success!</Message>
        :
        null
      }
      <Button color="green" type="submit" >
        Create
      </Button>
    </Form>
  );
}

export default CreateEventForm;