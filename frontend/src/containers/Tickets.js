import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Loader, Menu, CardGroup, Card } from 'semantic-ui-react';
import { ErrMsg } from '../components';
import { BACKEND } from '../config';
import { useAPI } from '../hooks';
import { usedDate } from '../util';
const [AVAIL, USED] = [0, 1];

const Tickets = () => {
  const { token } = useSelector(state => state.user);
  const [connection, connect] = useAPI("json");
  const [activeItem, setActiveItem] = useState(AVAIL);
  
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
            .map(({ _id, type, date, usedTime}) => (
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
      </div>
    );
  }
  else {
    return <Loader active={true} />;
  }
}

export default Tickets;