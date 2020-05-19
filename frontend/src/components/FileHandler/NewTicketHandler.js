import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Papa from 'papaparse';
import { Icon, Segment, Header, Loader, Dimmer } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { BACKEND } from '../../config';

const [INIT, PARSING, CREATING, DONE, ERROR] = [0,1,2,3,4];

const NewTicketHandler = ({content}) => {
  const [status, setStatus] = useState(INIT);
  const [count, setCount] = useState(0);
  const [errMsg, setErrMsg] = useState("");
  const [invalidTickets, setInvalidTickets] = useState([]);
  const {token} = useSelector(state => state.user);

  const create = async (ticket) => {
    const _ticket = {
      owner: ticket[0],
      type: ticket[1],
      date: ticket[2]
    }
    return await fetch(
      BACKEND+"/ticket/give/",
      { 
        method: "POST", 
        body: JSON.stringify(_ticket),
        headers: {'authorization': token, 'content-type': "application/json"}
      }
    )
    .then(res => {
      if(res.status !== 200){
        console.error(`Got ${res.status} for ticket:`, _ticket)
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

  const createAll = (tickets, newInvalidTickets = []) => {
    if(count !== 0) setCount(0);
    Promise.all(tickets.map(ticket => create(ticket)))
    .then(result => {
      setStatus(DONE);
      setCount(result.reduce((prevValue, success) => prevValue + (success?1:0)));
      let errTickets = result.reduce((errTickets, success, idx) => {
        if(!success) return [...errTickets, idx];
        else return errTickets;
      }, []).map(ticketIdx => tickets[ticketIdx]);
      setInvalidTickets([...invalidTickets, ...newInvalidTickets, ...errTickets]);
    })
  }

  if (status === INIT) {
    setStatus(PARSING);
    // Parse the csv string using Papa Parser
    Papa.parse(content, {
      complete: (results) => {
        if(results.errors.length > 0) {
          console.error(results.errors);
          setStatus(ERROR);
          setErrMsg("Parsing Error! See console for more info.")
        }
        else {
          setStatus(CREATING);
          const tickets = [];
          const newInvalidTickets = [];
          for(let i = 0;i < results.data.length;i++) {
            const ticket = results.data[i];
            if(i === 0) {
              const check = ["owner email", "ticket type", "date"];
              const lowerArr = ticket.map(field => field.toLowerCase());
              let same = true;
              for(let field = 0;field < 3;field++) {
                same = same && lowerArr[field].trim() === check[field];
              }
              if(same) continue;
            }
            // Check invalid row (except empty row)
            if(ticket.length !== 3) {
              if(ticket.length === 1 && ticket[0] === "") continue;
              console.error("Invalid ticket:", ticket);
              newInvalidTickets.push(ticket);
              continue;
            }
            // Remove spaces, then push to toAdd list
            tickets.push(ticket.map(field => field.trim()));
          }
          // Start Creation
          createAll(tickets, newInvalidTickets);
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
        <Dimmer active><Loader active>Creating Tickets...</Loader></Dimmer>
      )
      break;
    case DONE:
      node = (
        <React.Fragment>
          <Header icon>
            <Icon name="check" />
            Added {count} tickets!
          </Header>
          {
            invalidTickets.length>0
            ?<p>Failed ticket(s): {`${invalidTickets.map(ticket => ticket[0]).join(", ")}`}</p>
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

NewTicketHandler.propTypes = {
  content: PropTypes.string.isRequired
}

export default NewTicketHandler;