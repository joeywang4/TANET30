import { useState, useEffect } from 'react';
import webSocket from 'socket.io-client';
import { BACKEND } from '../config';

const ws = webSocket(BACKEND);
if(ws) console.log("Websocket connected!");

export default (nameSpace, callback=null) => {
  const [recv, setRecv] = useState(undefined);

  useEffect(() => {
    const wsCallback = (message) => {
      setRecv(message);
      if(callback !== null) callback(message);
    }
    if (ws) ws.on(nameSpace, wsCallback);
    // Dirty but effective approach, remove and create a new listener
    // on renders, this may take a lot of efforts on useless listener
    // `replacing`. Probably will fix this later.
    return () => ws.off(nameSpace, wsCallback);
  }, [nameSpace, callback])

  return recv;
}