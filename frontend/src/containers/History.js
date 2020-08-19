import React from 'react';
import { useSelector } from 'react-redux';
import { Loader,  Accordion, Icon, CardGroup, Card } from 'semantic-ui-react';
import { ErrMsg } from '../components';
import { BACKEND } from '../config';
import { useAPI } from '../hooks';
import { usedDate } from '../util';




const History = () => {
  const { id } = useSelector(state => state.user);
  const [connection, connect] = useAPI("json");
  if (connection.isInit()) {
    connect(
      BACKEND + `/TX?id=${id}`
    );
  }

  if (connection.error) {
    return <ErrMsg />;
  }
  else if (connection.success) {
    const history = connection.response;
    let display = <span>no history</span>;
    if (history.length > 0) {
      display = (
        <CardGroup stackable style={{marginTop: "1em"}} >
          {history
            .map(({ _id, from , to  , amount , timestamp}) => (
              <Card key={_id} color={id===to._id?"green":"red"}>
                <Card.Content>
                  <Card.Header >
                    {id===to._id?<Icon color='green' name='plus' size='big' />:<Icon color='red' name='minus' size='big'/>} 
                    {id===to._id?" $"+amount:" $"+amount} 
                  </Card.Header>
                  <Card.Meta>
                    <span >
                      {id===to._id?"from "+(from?from.name:'Faucet'):"to "+to.name}
                      <br/>
                      {usedDate(timestamp)}
                    </span>
                  </Card.Meta>
                </Card.Content>
              </Card>
            ))}
        </CardGroup>
      )
      
    }
    const panels = [
      {
        key:'history',
        title: {
          content: 'history',
        },
        content: {
          content:(display)
        }
      },
    ]
    return (
      <div>
        {<Accordion  panels={panels} />}
      </div>
    );
  }
  else {
    return <Loader active={true} />;
  }
}

export default History;