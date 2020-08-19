import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Loader, Menu, CardGroup, Card, Button, Icon } from 'semantic-ui-react';
import { ErrMsg } from '../components';
import { BACKEND } from '../config';
import { useAPI } from '../hooks';
import { Link } from 'react-router-dom';
import { usedDate } from '../util';

const [AVAIL, USED] = [0, 1];

const Tickets = () => {
  const { token } = useSelector(state => state.user);
  const { id } = useSelector(state => state.user);
  const [connection, connect, initConnection] = useAPI("json");
  const loadTicket = () => {
    initConnection();
    connect(
      BACKEND + `/ticket`,
      "GET",
      null,
      { 'authorization': token, 'content-type': "application/json" }
    );
  }
  const [editState, edit] = useAPI("text", loadTicket, () => {alert("Delete ticket failed!")});
  const [activeItem, setActiveItem] = useState(AVAIL);

  const delTicket = (ticketType, ticketDate) => {
    if(!window.confirm("Are you sure to delete this food ticket?")) {
      return;
    }
    const body = { owner: id, type: ticketType, date: ticketDate };
    if (editState.isInit()) {
      edit(
        BACKEND + "/ticket/delete",
        "POST",
        JSON.stringify(body),
        { 'authorization': token, 'content-type': "application/json" }
      )
    }
  }

  if (connection.isInit()) {
    loadTicket();
  }

  if (connection.error) {
    return <ErrMsg />;
  }
  else if (connection.success) {
    const tickets = connection.response;
    let display = <span>You have no ticket.</span>;
    if (tickets.length > 0) {
      display = (
        <CardGroup stackable style={{ marginTop: "1em" }} >
          {tickets
            .filter(({ usedTime }) => (activeItem === AVAIL ? usedTime === 0 : usedTime !== 0))
            .map(({ _id, type, date, usedTime }) => (
              <Card key={_id}>
                <Card.Content>
                  <Card.Header>
                    {type}
                  </Card.Header>
                  <Card.Meta>
                    <span className='date'>
                      {usedTime===0?date:usedDate(usedTime)}
                    </span>
                  </Card.Meta>
                </Card.Content>
                {activeItem === AVAIL ?
                  <Button animated='vertical' loading={editState.loading} onClick={() => delTicket(type, date)}>
                    <Button.Content visible>Delete</Button.Content>
                    <Button.Content hidden>
                      <Icon name='trash alternate' />
                    </Button.Content>
                  </Button>
                  : null
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
        <div style={{ marginTop: "2em", marginBottom: "2em", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div>
            {activeItem === AVAIL ? <Button as={Link} to="/userAddTicket">Add Meal</Button> : null}
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
