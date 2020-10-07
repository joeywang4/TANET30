import React, { useState } from 'react';
import { Loader, Form, Button, Message } from 'semantic-ui-react';
import QrReader from 'react-qr-reader'
import { BACKEND } from '../config';
import { parseQRCode } from '../util';
import { useSelector } from 'react-redux';
import { useChoosePrize } from '../hooks'

const Purchase = () => {
  // const [ purchaseState, purchase ] = useAPI("text");
  const [ prize, prizeChooser ] = useChoosePrize({});
  const [ state, setState ] = useState({
    scanLoading: false,
    sendLoading: false,
    fromUser: null,
    success: "",
    err: ""
  });
  const {token} = useSelector(state => state.user);

  const onSubmit = (e) => {
    e.preventDefault();
    if(!state.fromUser || !prize) return;
    setState({...state, sendLoading: true});
    fetch( BACKEND+"/purchase",{
      method: "POST", 
      body: JSON.stringify({from: state.fromUser.id, prize: prize}), 
      headers: {'authorization': token, 'content-type': "application/json"}
    })
    .then( res => {
      if(res.status === 200) {
        setState({
          ...state,
          sendLoading: false,
          success: "Transaction success",
          err: ""
        });
      }
      else {
        res.text()
        .then(errMsg => 
          setState({
            ...state,
            sendLoading: false,
            err: `Transaction failed: ${errMsg}`,
            success: ""
          })
        )
        .catch( err => console.error(err));
      }
    })
  }
  const handleScan = async (data) => {
    if(!data || state.scanLoading) return
    const failed = () => {
      setState({...state, scanLoading: false});
      return;
    }
    setState({...state, scanLoading: true});
    const id = parseQRCode(data);
    const fromUser = await fetch(BACKEND+`/user?id=${id}`)
    .then(res => {
      if(res.status !== 200) return failed();
      else return res.json();
    })
    .then(data => data);
    setState({...state, scanLoading: false, fromUser});
  }

  const handleError = err => {
    console.error(err);
  }

  return (
    <div style={{ 
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>
      <QrReader
        delay={300}
        onError={handleError}
        onScan={handleScan}
        style={{maxWidth: "500px", width: "100%"}}
      />
      {state.scanLoading?<Loader active>Loading...</Loader>:null}
      <h3>{state.fromUser?`Receive from ${state.fromUser.name}`:""}</h3>
      <Form onSubmit={e => onSubmit(e)} loading={state.sendLoading}>
        <Form.Field required>
          <label>Choose prize to purchase!</label>
          {prizeChooser}
        </Form.Field>
        <Button color="green" type="submit" >
          buy
        </Button>
      </Form>
      {state.err !== ""
        ?
        <Message negative>{state.err}</Message>
        :
        null
      }
      {state.success !==  ""
        ?
        <Message positive>{`purchase ${prize.item} Success`}</Message>
        :
        null
      }
    </div>
  )
}

export default Purchase;