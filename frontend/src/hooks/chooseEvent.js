import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Dropdown } from 'semantic-ui-react';
import useAPI from './api';
import { BACKEND } from '../config';

const useChooseEvent = () => {
  const url = BACKEND + "/events";
  const [connection, connect] = useAPI("json");
  // const [_group, setGroup] = useState(null);
  // const [user, setUser] = useState({});
  const [event, setEvent] = useState({});
  const [eventValue, setEventValue] = useState(null);
  const { token } = useSelector(state => state.user);
  if (connection.isInit()) connect(url, "GET", null, { 'authorization': token, 'content-type': "application/json" });
  let events = connection.response || [];
  // if (!group) users = users.filter(user => user.group === _group);

  // let chooseGroup = (
  //   <Dropdown
  //     placeholder="Choose Group"
  //     selection
  //     options={userGroupEnum.map(__group => ({ key: __group, text: __group, value: __group }))}
  //     onChange={(_, data) => {
  //       setGroup(data.value);
  //       setEventValue(null);
  //       setEvent({});
  //     }}
  //   />
  // );

  events = [{}, ...events];

  return [event, (
    <React.Fragment>
      {/* {group ? null : <div style={{padding: "0px 7px"}}>{chooseGroup}</div>} */}
      <div style={{ padding: "0px 7px" }}>
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
      </div>
    </React.Fragment>
  )]
}

export default useChooseEvent;