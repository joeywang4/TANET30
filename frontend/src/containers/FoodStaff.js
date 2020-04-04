import React, { useState } from 'react';
import { Header, Icon, Divider, Dropdown } from 'semantic-ui-react';
import QrReader from 'react-qr-reader';

const foodTypes = [
  { key: 'launch', value: 'launch', text: 'Launch' },
  { key: 'dinner', value: 'dinner', text: 'Dinner' },
]

export default () => {
  console.log("[*] Viewing Food Staff Page");
  const [type, setType] = useState(null);

  const onSelect = (_, data) => {
    setType(data.value);
  }

  const onScan = (data) => {
    if(data === null) return;
    console.log(data);
  }

  const onError = () => { console.error("QR-Code Scan Error"); }

  return (
    <div style={{marginTop: "2em", width: "80%"}}>
      <Header as='h2' icon textAlign='center'>
        <Icon name='food' circular />
        <Header.Content>Send Food</Header.Content>
      </Header>
      <Divider />
      <Dropdown
        placeholder='Select Type'
        fluid
        selection
        onChange={onSelect}
        options={foodTypes}
        style={{margin: "1em 0"}}
      />
      {type===null?null:
        <QrReader
          delay={300}
          onError={onError}
          onScan={onScan}
          style={{maxWidth: "500px", width: "100%", margin: "auto"}}
        />
      }
    </div>
  )
}