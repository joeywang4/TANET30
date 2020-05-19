import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useAPI } from '../../hooks';
import Papa from 'papaparse';
import { Icon, Segment, Header, Loader, Dimmer } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import QRCode from 'qrcode';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { BACKEND, loginURL } from '../../config';

const [INIT, PARSING, QUERYING, GENERATING, DONE, ERROR] = [0, 1, 2, 3, 4, 5];

const ExportUserHandler = ({ content }) => {
  const [status, setStatus] = useState(INIT);
  const [errMsg, setErrMsg] = useState("");
  const [users, setUsers] = useState([]);
  const [invalidUsers, setInvalidUsers] = useState([]);
  const { token } = useSelector(state => state.user);
  const [conn, connect] = useAPI('json');

  const genQRCode = async (text) => {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'H',
      type: 'image/jpeg',
      quality: 1
    });
  }

  const generate = async () => {
    const usersWithID = [];
    const newInvalidUsers = [];
    for(let user of users) {
      let found = conn.response.find(someUser => someUser.email === user.email);
      if(found === undefined) {
        console.error("Non-exist User:", user.name);
        newInvalidUsers.push(user);
      }
      else usersWithID.push({...user, id: found._id});
    }
    setInvalidUsers([...invalidUsers, ...newInvalidUsers]);
    setUsers(usersWithID);
    const qrcodes = await Promise.all(
      usersWithID.map(
        user => genQRCode(loginURL+`?email=${user.email}&password=${user.pw}#${user.id}`)
      )
    );
    let zip = new JSZip();
    let dir = zip.folder("qrcodes");
    for(let i = 0;i < usersWithID.length;i++) {
      let idx = qrcodes[i].indexOf('base64,') + 'base64,'.length;
      dir.file(`${usersWithID[i].name}.jpg`, qrcodes[i].substring(idx), {base64: true});
    }
    zip.generateAsync({type:"blob"}).then(function(content) {
      saveAs(content, "qrcodes.zip");
      setStatus(DONE);
    });
  }

  if (status === INIT) {
    setStatus(PARSING);
    // Parse the csv string using Papa Parser
    Papa.parse(content, {
      complete: (results) => {
        if (results.errors.length > 0) {
          console.error(results.errors);
          setStatus(ERROR);
          setErrMsg("Parsing Error! See console for more info.")
        }
        else {
          setStatus(QUERYING);
          const newUsers = [];
          const newInvalidUsers = [];
          for (let i = 0; i < results.data.length; i++) {
            const user = results.data[i];
            if (i === 0) {
              // Skip header
              const check = ["name", "group", "email", "password"];
              const lowerArr = user.map(field => field.toLowerCase());
              let same = true;
              for (let field = 0; field < 4; field++) {
                same = same && lowerArr[field].trim() === check[field];
              }
              if (same) continue;
            }
            // Check invalid row (except empty row)
            if (user.length !== 4) {
              if (user.length === 1 && user[0] === "") continue;
              console.error("Invalid user:", user);
              newInvalidUsers.push(user);
              continue;
            }
            // Remove spaces, then push to toAdd list
            newUsers.push({
              name: user[0].trim(),
              email: user[2].trim(),
              pw: user[3].trim()
            });
          }
          setInvalidUsers([...invalidUsers, ...newInvalidUsers]);
          setUsers([...users, ...newUsers]);
          // Start Query User IDs
          connect(BACKEND + "/user", "GET", null, { 'authorization': token })
        }
      }
    })
  }

  if (status === QUERYING && conn.loading === false) {
    if (conn.success) {
      setStatus(GENERATING);
      generate();
    }
    else if (conn.error) {
      setStatus(ERROR);
      setErrMsg(conn.errMsg);
    }
  }

  let node = null;
  switch (status) {
    default:
    case ERROR:
      node = (
        <React.Fragment>
          <Header icon>
            <Icon name='warning sign' />
            Error!
          </Header>
          <p>{errMsg}</p>
        </React.Fragment>
      )
      break;
    case INIT:
    case PARSING:
      node = (
        <Dimmer active><Loader inverted active>Parsing File...</Loader></Dimmer>
      );
      break;
    case QUERYING:
      node = (
        <Dimmer active><Loader active>Getting User Info...</Loader></Dimmer>
      )
      break;
    case GENERATING:
      node = (
        <Dimmer active><Loader active>Creating QR-Code...</Loader></Dimmer>
      )
      break;
    case DONE:
      node = (
        <React.Fragment>
          <Header icon>
            <Icon name="check" />
            Exported {users.length} users!
          </Header>
          {
            invalidUsers.length > 0
              ? <p>Failed user(s): {`${invalidUsers.map(user => user[0]).join(", ")}`}</p>
              : null
          }
        </React.Fragment>
      )
  }

  return (
    <Segment placeholder>
      {node}
    </Segment>
  )
}

ExportUserHandler.propTypes = {
  content: PropTypes.string.isRequired
}

export default ExportUserHandler;