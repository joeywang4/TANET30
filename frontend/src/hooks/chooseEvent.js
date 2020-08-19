import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Dropdown } from 'semantic-ui-react';
import useAPI from './api';
import { BACKEND } from '../config';

const useChooseEvent = () => {
  const url = BACKEND + "/event";
  const [connection, connect] = useAPI("json");
  const [event, setEvent] = useState({});
  const [eventValue, setEventValue] = useState(null);
  const { token } = useSelector(state => state.user);
  if (connection.isInit()) connect(url, "GET", null, { 'authorization': token, 'content-type': "application/json" });
  let events = connection.response || [];

  return [event, (
      <Dropdown
        placeholder="Choose Event"
        selection
        options={events.map((event, idx) => ({ key: event._id, text: event.name, value: idx }))}
        value={eventValue}
        onChange={(_, data) => {
          setEventValue(data.value);
          setEvent(events[data.value]);
        }}
      />
  )]
}

export default useChooseEvent;