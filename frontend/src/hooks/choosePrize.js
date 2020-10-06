import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Dropdown } from 'semantic-ui-react';
import useAPI from './api';
import { BACKEND } from '../config';

const useChoosePrize = () => {
  const url = BACKEND + "/prize";
  const [connection, connect] = useAPI("json");
  const [prize, setPrize] = useState(null);
  const [prizeValue, setPrizeValue] = useState(null);
  const { token } = useSelector(state => state.user);
  if (connection.isInit()) connect(url, "GET", null, { 'authorization': token, 'content-type': "application/json" });
  let prizes = connection.response || [];

  return [prize, (
      <Dropdown
        placeholder="Choose Prize"
        selection
        options={prizes.map((prize, idx) => ({ key: prize.item, text: `${prize.item} $${prize.price}`, value: idx }))}
        value={prizeValue}
        onChange={(_, data) => {
          setPrizeValue(data.value);
          setPrize(prizes[data.value]);
        }}
      />
  )]
}

export default useChoosePrize;