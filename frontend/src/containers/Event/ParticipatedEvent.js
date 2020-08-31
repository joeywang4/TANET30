import React from 'react';
import { useSelector } from 'react-redux';
import { Loader, CardGroup } from 'semantic-ui-react';
import { ErrMsg, EventLink } from '../../components';
import { BACKEND } from '../../config';
import { useAPI } from '../../hooks';
import { courseBar, companyBar } from '../Lottery.js'

const ParticipatedEvent = () => {
  const { token } = useSelector(state => state.user);
  const [connection, connect] = useAPI("json");

  if (connection.isInit()) {
    connect(
      BACKEND + `/event`,
      "GET",
      null,
      { 'authorization': token, 'content-type': "application/json" }
    );
  }

  //return the number of course events
  function countEvents(events){
    const coursecount = events.filter(event => event.admin.group === "seminarStaff" );
    return coursecount.length;
  }

  if (connection.error) {
    return <ErrMsg />;
  }
  else if (connection.success) {
    var coursecounts = countEvents(connection.response);
    var companycounts = connection.response.length - coursecounts;
    console.log(courseBar);
    console.log(companyBar);
    let display = <span>Unable to participate in the lottery!</span>
    if( coursecounts >= courseBar && companycounts >= companyBar ){
      display = <p>Qualified for the lottery!</p>
    }
    else if ( coursecounts >= courseBar && companycounts < companyBar ){
      display = <p>Require {companyBar - companycounts} more company events to participate in the lottery.</p>
    }
    else if( coursecounts < courseBar && companycounts >= companyBar ){
      display = <p>Require {courseBar - coursecounts} more course events to participate in the lottery.</p>
    }
    else{
      display = <p>Require {courseBar - coursecounts} more course events and {companyBar - companycounts} more company events to participate in the lottery.</p>
    }
    
    if(connection.response.length === 0) {
      // return <span>You have not participated in any event yet.</span>;
      return (
        <div>
          <span>You have not participated in any event yet.</span>
          {display}
        </div>
      )
    }
    return (
      <div>
      <CardGroup stackable style={{marginTop: "1em"}}>
        {connection.response.map(({name, _id, begin, reward}) => (
          <EventLink key={_id} name={name} id={_id} time={begin} reward={reward} />
        ))}
      </CardGroup>
      <div>
        {display}
      </div>
      </div>
    );
  }
  else {
    return <Loader active={true} />;
  }
}

export default ParticipatedEvent;
