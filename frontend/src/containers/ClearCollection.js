import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Message, Form, Button } from 'semantic-ui-react';
import { BACKEND } from '../config';
import { useAPI } from '../hooks';

export default () => {
  const [ clearEventState, setClearEventState ] = useState(false);
  const [ clearLikeState, setClearLikeState ] = useState(false);
  const [ clearCollectionState, clearCollection ] = useAPI('text');
  const { token } = useSelector(state => state.user);

  const onClickClearCollection = (collection) => {
    clearCollection(
      BACKEND+`/event/clear${collection}`,
      "POST", 
      JSON.stringify({}), 
      {'authorization': token, 'content-type': "application/json"}
    )
    if(collection === 'Event')  setClearEventState(true);
    if(collection === 'Like') setClearLikeState(true);
  }

  return(
    <Form >
      <Button disabled={clearEventState} color="red" onClick={()=>onClickClearCollection('Event')} loading={clearCollectionState.loading}>
        Clear Collection: Event
      </Button>
      <Button disabled={clearLikeState} color="red" onClick={()=>onClickClearCollection('Like')} loading={clearCollectionState.loading}>
        Clear Collection: Like
      </Button>
      {clearCollectionState.error
        ?
        <Message negative>{clearCollectionState.errMsg}</Message>
        :
        null
      }
      {clearCollectionState.success
        ?
        <Message positive>{`You deleted ${clearCollectionState.response} document(s)`}</Message>
        :
        null
      }
    </Form>
  );  
}