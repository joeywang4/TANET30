import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, Icon, Segment, Header } from 'semantic-ui-react';

const FileUpload = ({ name, header, help, Handler, style, icon="upload", color="blue" }) => {
  const [showHelp, setShowHelp] = useState(false);
  const [content, setContent] = useState(null);
  const fileInput = useRef();

  const handleUpload = (file) => {
    const reader = new FileReader();
    reader.onload = function(evt) {
      setContent(evt.target.result);
    };
    reader.readAsText(file);
  }

  return (
    <Modal
      trigger={<Button style={style} color={color}><Icon name={icon} />{name}</Button>}
      onClose={() => setContent(null)}
      closeIcon
    >
      <Modal.Content>
        {content && Handler?<Handler content={content} />:(
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
        )}
        {showHelp?<p>{help}</p>:null}
      </Modal.Content>
      <Modal.Actions>
        {content?<Button color="red" onClick={_ => setContent(null)}>Resubmit</Button>:null}
        <Button color={showHelp?"green":"red"} onClick={_ => setShowHelp(!showHelp)}>
          {showHelp?"OK!":"Help!"}
        </Button>
      </Modal.Actions>
    </Modal>
  );
}

FileUpload.propTypes = {
  name: PropTypes.string.isRequired,
  header: PropTypes.string.isRequired,
  help: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  Handler: PropTypes.func,
  icon: PropTypes.string,
  style: PropTypes.object
}

export default FileUpload;