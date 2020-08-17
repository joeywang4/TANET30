import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Loader, Menu, CardGroup, Card, Button, Icon } from 'semantic-ui-react';
import { ErrMsg } from '../components';
import { BACKEND } from '../config';
import { useAPI } from '../hooks';
import { Link } from 'react-router-dom';
import AddTicketForm from '../components/AddTicketForm';

const [AVAIL, USED] = [0, 1];

const Tickets = () => {
  const { token } = useSelector(state => state.user);
  const { id } = useSelector(state => state.user);
  const [connection, connect] = useAPI("json");
  const [editState, edit] = useAPI("text");
  const [activeItem, setActiveItem] = useState(AVAIL);

  function delTicket(ticketType, ticketDate){
    const body = { owner: id, type: ticketType, date: ticketDate };
    if(editState.isInit()){
      edit(
        BACKEND + "/ticket/delete",
        "POST",
        JSON.stringify(body),
        {'authorization': token, 'content-type': "application/json"}
      )
    }
    window.location.reload(false);
  }


  if (connection.isInit()) {
    connect(
      BACKEND + `/ticket`,
      "GET",
      null,
      { 'authorization': token, 'content-type': "application/json" }
    );
  }

  

  if (connection.error) {
    return <ErrMsg />;
  }
  else if (connection.success) {
    const tickets = connection.response;
    let display = <span>You have no ticket.</span>;
    if (tickets.length > 0) {
      display = (
        <CardGroup stackable style={{marginTop: "1em"}} >
          {tickets
            .filter(({ usedTime }) => (activeItem === AVAIL ? usedTime === 0 : usedTime !== 0))
            .map(({ _id, type, date }) => (
              <Card key={_id}>
                <Card.Content>
                  <Card.Header>
                    {type}
                  </Card.Header>
                  <Card.Meta>
                    <span className='date'>
                      {date}
                    </span>
                  </Card.Meta>
                </Card.Content>
                {activeItem === AVAIL &&
                  <Button animated='vertical' onClick={()=> delTicket(type,date)}>
                    <Button.Content visible>Delete</Button.Content>
                    <Button.Content hidden>
                    <Icon name='trash alternate' /> 
                    </Button.Content>
                  </Button>
                }
              </Card>
            ))}
        </CardGroup>
      )
    }
    return (
      <div>
        <Menu stackable widths={2}>
          <Menu.Item
            name="Available"
            active={activeItem === AVAIL}
            onClick={_ => { setActiveItem(AVAIL); }}
          />
          <Menu.Item
            name="Used"
            active={activeItem === USED}
            onClick={_ => { setActiveItem(USED); }}
          />
        </Menu>
        {display}
        <div style = {{ marginTop:"2em", marginBottom:"2em", width:"100%", display: "flex", flexDirection: "column", alignItems:"center"}}>
          <div>
            {activeItem===AVAIL && <Button as={Link} to="/userAddTicket">Add Meal</Button>}
          </div>
        </div>
      </div>
    );
  }
  else {
    return <Loader active={true} />;
  }
}

export default Tickets;
