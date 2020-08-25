import React from 'react';
import { Form, Button, Message } from 'semantic-ui-react';
import { useSelector } from 'react-redux'
import { useAPI, useChooseUser, useChooseEvent } from '../../hooks';
import { BACKEND } from '../../config';

const AddAuthorForm = () => {
  const [addAuthorState, addAuthor] = useAPI("text");
  const [author, userChooser] = useChooseUser();
  const [event, eventChooser] = useChooseEvent();
  const {token} = useSelector(state => state.user)

  const onSubmit = (e) => {
    e.preventDefault();

    const body = {};
    if(author._id) body['authorIds'] = author._id;
    if(event._id) body['eventId'] = event._id;
    addAuthor(
      BACKEND+"/event/addAuthor",
      "POST", 
      JSON.stringify(body), 
      {'authorization': token, 'content-type': "application/json"}
    )
  }

  return (
    <Form onSubmit={e => onSubmit(e)} loading={addAuthorState.loading}>
      <Form.Field required>
        <label>Event name</label>
          {eventChooser}
      </Form.Field>

      <Form.Field required>
        <label>Author name</label>
        <Form.Group widths="equal">
          {userChooser}
        </Form.Group>
      </Form.Field>
      
      {addAuthorState.error
        ?
        <Message negative>{addAuthorState.errMsg}</Message>
        :
        null
      }
      {addAuthorState.success
        ?
        <Message positive>Add Author Success</Message>
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