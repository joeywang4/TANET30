import React, { useState } from 'react';
import { Form, Button, Message } from 'semantic-ui-react';
import { useSelector } from 'react-redux'
import { useAPI, useChooseUser, useChooseEvent } from '../../hooks';
import { BACKEND } from '../../config';

const AddAuthorForm = () => {
  const [addAuthorState, addAuthor] = useAPI("text");
  const [author, userChooser] = useChooseUser();
  const [event, eventChooser] = useChooseEvent();
  // const [eventName, setEventName] = useState("");
  const [error, setError] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  // const [authorName, setAuthorName] = useState(0);
  const {token} = useSelector(state => state.user)

  const onSubmit = (e) => {
    e.preventDefault();

    const body = {};
    if(author._id) body['author'] = author._id;
    if(event._id) body['event'] = event._id;
    // addAuthor(
    //   BACKEND+"/event",
    //   "POST", 
    //   JSON.stringify(body), 
    //   {'authorization': token, 'content-type': "application/json"}
    // )
  }

  return (
    <Form onSubmit={e => onSubmit(e)} loading={addAuthorState.loading}>
      <Form.Field>
        <label>Event name</label>
        <Form.Group widths="equal">
          {eventChooser}
        </Form.Group>
      </Form.Field>

      <Form.Field>
        <label>Event name</label>
        <Form.Group widths="equal">
          {userChooser}
        </Form.Group>
      </Form.Field>
      
      {addAuthorState.error || error
        ?
        <Message negative>{error?errMsg:addAuthorState.errMsg}</Message>
        :
        null
      }
      {addAuthorState.success
        ?
        <Message positive>Add Author Success!</Message>
        :
        null
      }
      <Button color="green" type="submit" >
        Add Author
      </Button>
    </Form>
  );
}

export default AddAuthorForm;