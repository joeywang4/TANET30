import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Message, Form, Button } from 'semantic-ui-react';
import { BACKEND } from '../config';
import { useAPI } from '../hooks';

export default () => {
  const [ renameState, setRenameState ] = useState(false);
  const [ response, rename ] = useAPI('text');
  const { token } = useSelector(state => state.user);

  const onClickRename = () => {
    rename(
      BACKEND+`/event/rename`,
      "POST", 
      JSON.stringify({}), 
      {'authorization': token, 'content-type': "application/json"}
    )
    setRenameState(true);
  }

  return(
    <Form >
      <Button disabled={renameState} color="blue" onClick={()=>onClickRename()} loading={response.loading}>
        Rename
      </Button>
      {response.error
        ?
        <Message negative>{response.errMsg}</Message>
        :
        null
      }
      {response.success
        ?
        <Message positive>{`Success`}</Message>
        :
        null
      }
    </Form>
  );  
}