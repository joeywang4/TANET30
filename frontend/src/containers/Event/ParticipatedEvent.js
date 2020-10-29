import React from 'react';
import { useSelector } from 'react-redux';
import { Loader, CardGroup, Header, Icon, Divider } from 'semantic-ui-react';
import { ErrMsg, EventLink } from '../../components';
import { BACKEND } from '../../config';
import { useAPI } from '../../hooks';
import { today } from '../../util';
import { UserHead } from '../index';


const messageStyle = {
  fontFamily: "Verdana",
  fontSize: "1em"
}

const ParticipatedEvent = () => {
  const { token } = useSelector(state => state.user);
  const [connection, connect] = useAPI("json");
  const [checkBar, check] = useAPI("text");

  if (connection.isInit()) {
    connect(
      BACKEND + `/event`,
      "GET",
      null,
      { 'authorization': token, 'content-type': "application/json" }
    );
  }
  // get thresholds from backend and update the bar values
  if(checkBar.isInit()){
    check(
      BACKEND + "/event/thresholds",
      "GET",
      null,
      { 'authorization': token, 'content-type': "application/json" }
    )
  }

  //return the number of course events
  // const countCourses = events => events.filter(event => event.admin.group === "seminarStaff").length;
  const countSemCourses = (events) => {
    let ret = 0;
    const semevents = events.filter(event => event.admin.group === "seminarStaff");
    let period = [0,0,0,0,0,0,0,0];
    for (let event of semevents) {
      if (!period[event.period]) {
        ret += 1;
        period[event.period] = 1;
      }
    }
    return ret;
  }

  const countComCourses = events => events.filter(event => event.admin.group === "company").length;

  if (connection.error || checkBar.error) {
    return <ErrMsg />;
  }
  else if (connection.success && checkBar.success) {
    const todayevents = connection.response.filter(event => event.date === today());
    const courseCounts = countSemCourses(todayevents);
    const companyCounts = countComCourses(todayevents);
    const { CourseBar: courseBar, CompanyBar: companyBar } = JSON.parse(checkBar.response);
    
    let display = <span>Unable to participate in the lottery today!</span>
    if( courseCounts >= courseBar && companyCounts >= companyBar ){
      display = <p>Qualified for the lottery!</p>
    }
    else if ( courseCounts >= courseBar && companyCounts < companyBar ){
      display = <p>Require {companyBar - companyCounts} more company events to participate in the lottery today.</p>
    }
    else if( courseCounts < courseBar && companyCounts >= companyBar ){
      display = <p>Require {courseBar - courseCounts} more course events to participate in the lottery today.</p>
    }
    else{
      display = <p>Require {courseBar - courseCounts} more course events and {companyBar - companyCounts} more company events to participate in the lottery today.</p>
    }
    
    if(connection.response.length === 0) {
      return (
        <div style={{marginTop: "2em", width: "80%"}}>
          <UserHead />
          <Divider horizontal>
            <Header as='h3'>
              <Icon name='calendar' />
              Participated Events
            </Header>
          </Divider>
          <div style={messageStyle}>
            <span>You have not participated in any event yet.</span>
            {display}
          </div>
        </div>
      )
    }
    return (
      <div style={{marginTop: "2em", width: "80%"}}>
        <UserHead />
        <Divider horizontal>
          <Header as='h3'>
            <Icon name='calendar' />
            Participated Events
          </Header>
        </Divider>
        <div>
          <CardGroup stackable style={{marginTop: "1em"}}>
            {connection.response.map(({name, _id, reward, participant}) => (
              <EventLink key={_id} name={name} id={_id} time={participant[0].usedTime} reward={reward} />
            ))}
          </CardGroup>
          <div style={{...messageStyle, marginTop: "1.5em"}}>
            {display}
          </div>
        </div>
      </div>
    );
  }
  else {
    return <Loader active={true} />;
  }
}

export default ParticipatedEvent;
