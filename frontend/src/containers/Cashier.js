import React, { useState } from 'react';
import { Header, Icon, Divider, Menu } from 'semantic-ui-react';
import { Purchase, History } from './index';

const [SCAN, REC] = [0,1];

export default () => {
  const [activeItem, setActiveItem] = useState(SCAN);

  let display = null;
  switch (activeItem) {
    default:
    case SCAN:
      display = <Purchase />;
      break;
    case REC:
      display = <History />;
      break;
  }

  return (
    <div style={{marginTop: "2em", width: "80%"}}>
      <Header as='h2' icon textAlign='center'>
        <Icon name='user circle' circular />
        <Header.Content>Cashier</Header.Content>
      </Header>  
      <Divider />
      <Menu stackable widths = {2}>
        <Menu.Item 
          name = "Scan"
          active = {activeItem === SCAN}
          onClick = {_ => { setActiveItem(SCAN); }}
        />
        <Menu.Item 
          name = "Record"
          active = {activeItem === REC}
          onClick = {_ => { setActiveItem(REC); }}
        />
      </Menu>
      {display}
    </div>
  )
}
