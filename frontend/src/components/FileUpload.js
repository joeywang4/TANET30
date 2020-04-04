import React, { useState, useRef } from 'react';
import { Button, Modal, Icon, Segment, Header } from 'semantic-ui-react';

const FileUpload = ({ name, icon="upload", color="blue", header, help, style }) => {
  const [showHelp, setShowHelp] = useState(false);
  const fileInput = useRef();

  const handleUpload = (e) => {
    console.log(e);

  }

  return (
    <Modal
      trigger={<Button style={style} color={color}><Icon name={icon} />{name}</Button>}
      closeIcon
    >
      <Modal.Content>
        <Segment placeholder>
          <Header icon>
            <Icon name='file excel outline' />
            {header}
          </Header>
          <Button primary onClick={() => fileInput.current.click()}>
            Add Document
            <input ref={fileInput} onInput={(_) => handleUpload(fileInput.current.files[0])} type="file" hidden />
          </Button>
        </Segment>
        {showHelp?<p>{help}</p>:null}
      </Modal.Content>
      <Modal.Actions>
        <Button color={showHelp?"green":"red"} onClick={_ => setShowHelp(!showHelp)}>
          {showHelp?"OK!":"Help!"}
        </Button>
      </Modal.Actions>
    </Modal>
  );
}

export default FileUpload;