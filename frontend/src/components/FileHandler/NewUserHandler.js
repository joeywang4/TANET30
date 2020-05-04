import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Papa from 'papaparse';
import { Icon, Segment, Header, Loader, Dimmer } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { BACKEND } from '../../config';

const [INIT, PARSING, CREATING, DONE, ERROR] = [0,1,2,3,4];

const NewUserHandler = ({content}) => {
  const [status, setStatus] = useState(INIT);
  const [count, setCount] = useState(0);
  const [errMsg, setErrMsg] = useState("");
  const [invalidUsers, setInvalidUsers] = useState([]);
  const {token} = useSelector(state => state.user);

  const register = async (user) => {
    const _user = {
      name: user[0],
      group: user[1],
      email: user[2],
      pwd: user[3]
    }
    return await fetch(
      BACKEND+"/auth/register",
      { 
        method: "POST", 
        body: JSON.stringify(_user),
        headers: {'authorization': token, 'content-type': "application/json"}
      }
    )
    .then(res => {
      if(res.status !== 200){
        console.error(`Got ${res.status} for user:`, _user)
        return false;
      }
      else {
        setCount(count+1);
        return true;
      }
    })
    .catch(err => {
      console.error(err);
      return false;
    })
  }

  const registerAll = (users, newInvalidUsers = []) => {
    if(count !== 0) setCount(0);
    Promise.all(users.map(user => register(user)))
    .then(result => {
      setStatus(DONE);
      setCount(result.reduce((prevValue, success) => prevValue + (success?1:0)));
      let errUsers = result.reduce((errUsers, success, idx) => {
        if(!success) return [...errUsers, idx];
        else return errUsers;
      }, []).map(userIdx => users[userIdx]);
      setInvalidUsers([...invalidUsers, ...newInvalidUsers, ...errUsers]);
    })
  }

  if (status === INIT) {
    setStatus(PARSING);
    // Parse the csv string using Papa Parser
    Papa.parse(content, {
      complete: (results) => {
        console.log("Parse result:", results);
        if(results.errors.length > 0) {
          console.error(results.errors);
          setStatus(ERROR);
          setErrMsg("Parsing Error! See console for more info.")
        }
        else {
          setStatus(CREATING);
          const users = [];
          const newInvalidUsers = [];
          for(let i = 0;i < results.data.length;i++) {
            const user = results.data[i];
            if(i === 0) {
              const check = ["name", "group", "email", "password"];
              const lowerArr = user.map(field => field.toLowerCase());
              let same = true;
              for(let field = 0;field < 4;field++) {
                same = same && lowerArr[field].trim() === check[field];
              }
              if(same) continue;
            }
            // Check invalid row (except empty row)
            if(user.length !== 4) {
              if(user.length === 1 && user[0] === "") continue;
              console.error("Invalid user:", user);
              newInvalidUsers.push(user);
              continue;
            }
            // Remove spaces, then push to toAdd list
            users.push(user.map(field => field.trim()));
          }
          // Start Registration
          registerAll(users, newInvalidUsers);
        }
      }
    })
  }

  let node = null;
  switch(status) {
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
    case CREATING:
      node = (
        <Dimmer active><Loader active>Creating Users...</Loader></Dimmer>
      )
      break;
    case DONE:
      node = (
        <React.Fragment>
          <Header icon>
            <Icon name="check" />
            Added {count} users!
          </Header>
          {
            invalidUsers.length>0
            ?<p>Failed user(s): {`${invalidUsers.map(user => user[0]).join(", ")}`}</p>
            :null
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

NewUserHandler.propTypes = {
  content: PropTypes.string.isRequired
}

export default NewUserHandler;