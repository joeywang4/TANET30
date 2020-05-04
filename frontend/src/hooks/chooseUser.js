import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Dropdown } from 'semantic-ui-react';
import useAPI from './api';
import { BACKEND, userGroupEnum } from '../config';

const useChooseUser = (group = null) => {
  const url = BACKEND + "/user" + (group ? `?group=${group}` : "");
  const [connection, connect] = useAPI("json");
  const [_group, setGroup] = useState(null);
  const [user, setUser] = useState({});
  const [userValue, setUserValue] = useState(null);
  const { token } = useSelector(state => state.user);
  if (connection.isInit()) connect(url, "GET", null, { 'authorization': token, 'content-type': "application/json" });
  let users = connection.response || [];
  if (!group) users = users.filter(user => user.group === _group);

  let chooseGroup = (
    <Dropdown
      placeholder="Choose Group"
      selection
      options={userGroupEnum.map(__group => ({ key: __group, text: __group, value: __group }))}
      onChange={(_, data) => {
        setGroup(data.value);
        setUserValue(null);
        setUser({});
      }}
    />
  );

  users = [{}, ...users];

  return [user, (
    <React.Fragment>
      {group ? null : <div style={{padding: "0px 7px"}}>{chooseGroup}</div>}
      <div style={{ padding: "0px 7px" }}>
        <Dropdown
          placeholder="Choose User"
          selection
          options={users.map((user, idx) => ({ key: user._id, text: user.name, value: idx }))}
          value={userValue}
          onChange={(_, data) => {
            setUserValue(data.value);
            setUser(users[data.value]);
          }}
        />
      </div>
    </React.Fragment>
  )]
}

export default useChooseUser;