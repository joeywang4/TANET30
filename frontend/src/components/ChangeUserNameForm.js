import React, { useState } from 'react';
import { Form, Button, Message } from 'semantic-ui-react';
import { useSelector } from 'react-redux'
import { useAPI } from '../hooks';
import { BACKEND } from '../config';

const ChangeUserNameForm = () => {
  const { token } = useSelector(state => state.user);
  const [changeUserState, changeUser ] = useAPI("text");
  const [ email, setEmail ] = useState("");
  const [ newName, setNewName ] = useState("");
  const [ newUnit, setNewUnit ] = useState("");
  const [ errMsg, setErrMsg] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    const body = { email:email, name:newName, unit: newUnit };
    if(!body.email || (!body.name && !body.unit) ) {
      setErrMsg('Invalid Submission!(at least change one!)');
      return;
    }
    if(! body.email.includes('@')) {
      setErrMsg('Invalid Email Form! ');
      return;
    }
    setErrMsg(false);
    changeUser(
      BACKEND + `/changeUser`,
      "POST",
      JSON.stringify(body),
      {'authorization': token, 'content-type': "application/json"}
    )
  }

  return (
    <Form onSubmit={e => onSubmit(e)} loading={changeUserState.loading}>
      <Form.Field required>
        <label>Email</label>
        <Form.Input type="text" required={true} placeholder="e.g. user1@test.com" id="email" onChange={e => { setEmail(e.target.value); }} />        
      </Form.Field>
      <Form.Field>
        <label>New Name</label>
        <Form.Input type="text" required={false} placeholder="e.g. 王大明 (keep it blank if no changing)" id="newName" onChange={e => { setNewName(e.target.value); }} />        
      </Form.Field>
      <Form.Field>
        <label>New Unit</label>
        <Form.Input type="text" required={false} placeholder="e.g. 台灣大學 (keep it blank if no changing)" id="newUnit" onChange={e => { setNewUnit(e.target.value); }} />        
      </Form.Field>
      {changeUserState.error || errMsg
        ?
        <Message negative>{errMsg ? errMsg : changeUserState.errMsg}</Message>
        :
        null
      }
      {changeUserState.success
        ?
        <Message positive>Change User Name/Unit Success!</Message>
        :
        null
      }
      <Button color="green" type="submit" >
        Make Change
      </Button>
    </Form>
  );
}

export default ChangeUserNameForm;