import React from 'react';
import { useSelector } from 'react-redux';
import { Loader, CardGroup } from 'semantic-ui-react';
import { ErrMsg, EventLink } from '../../components';
import { BACKEND } from '../../config';
import { useAPI } from '../../hooks';


const ParticipatedEvent = () => {
  let courseBar, companyBar;
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

  //get thresholds from backend and update the bar values
  const [checkBar, check] = useAPI("text");
  const checkThresholds = () => {
    if(checkBar.isInit()){
      check(
        BACKEND + "/event/thresholds",
        "GET",
        null,
        { 'authorization': token, 'content-type': "application/json", mode: 'cors' }
      )
    }
    if(checkBar.success){
      const values = JSON.parse(checkBar.response);
      courseBar = values["CourseBar"];
      companyBar = values["CompanyBar"];
    }
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
    const coursecounts = countEvents(connection.response);
    const companycounts = connection.response.length - coursecounts;
    checkThresholds();
    
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
        {connection.response.map(({name, _id, begin, reward, participant}) => (
          <EventLink key={_id} name={name} id={_id} time={participant[0].usedTime} reward={reward} />
        ))}
      </CardGroup>
      <div style={{marginTop: "1.5em"}}>
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
