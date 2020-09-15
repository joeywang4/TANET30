import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Loader, Grid, Form, Button, Message } from 'semantic-ui-react';
import { ErrMsg } from '../components';
import { BACKEND } from '../config';
import { useAPI } from '../hooks';


export default () => {
  const { token } = useSelector(state => state.user);
  const [connection, connect] = useAPI("json");
  const [courseThreshold, setCourseThreshold] = useState(-1);
  const [companyThreshold, setCompanyThreshold] = useState(-1);
  const [list, setList] = useState(null);
  const [editState, edit] = useAPI("text");
  const [errMsg, setErrMsg] = useState(false);
  const [error, setError] = useState(false);

  let display = null;

  const updateThresholds = (courseBar, companyBar) => {
    if(courseBar < 0 || companyBar < 0){
      setErrMsg("Invalid Threshold!");
      setError(true);
      return;
    }
    setError(false);
    const body = { course: courseBar, company: companyBar };
    edit(
      BACKEND + "/event/lottery",
      "POST",
      JSON.stringify(body),
      {'authorization': token, 'content-type': "application/json"}
    )
  }

  const onFilter = () => {
    updateThresholds(courseThreshold, companyThreshold);
    let id_to_user = {};
    let id_to_count = {}; // id -> [courseCount, companyCount]
    for(let event of connection.response) {
      const isCourse = event.admin.group === "seminarStaff";
      for(let participant of event.participant) {
        if(id_to_user[participant._id] === undefined) {
          id_to_user[participant._id] = participant;
          id_to_count[participant._id] = [0,0];
        }
        let count = id_to_count[participant._id];
        if(isCourse) count[0] = count[0] += 1;
        else count[1] = count[1] += 1;
        id_to_count[participant._id] = count;
      }
    }
    let userList = [];
    for(const [id, count] of Object.entries(id_to_count)) {
      if(count[0] >= courseThreshold && count[1] >= companyThreshold) {
        userList.push(id_to_user[id]);
      }
    }
    setList(userList);
  }

  if (connection.isInit()) {
    connect(
      BACKEND + `/event?populate=1`,
      "GET",
      null,
      { 'authorization': token, 'content-type': "application/json" }
    );
  }

  if (connection.error) {
    display = <ErrMsg />;
  }
  else if (connection.success) {
    display = <div>Set filter first.</div>;
    if(list !== null) {
      const text = "Username,Email\n" + list.map(user => `${user.name},${user.email}`).join("\n");
      const data = new Blob([text], {type: 'text/plain'});
      const url = window.URL.createObjectURL(data);
      display = (
        <div>
          <span>There are {list.length} users qualified.</span><br />
          <Button color="blue" as="a" href={url} download="list.csv" style={{marginTop: "2vh"}}>Download List</Button>
        </div>
      )
    }
  }
  else {
    display = <Loader active={true} />;
  }
  return (
    <Grid textAlign="center" verticalAlign='middle' style={{ width: "100%", marginTop: "2vh" }}>
      <Grid.Row columns={2}>
        <Grid.Column style={{ width: "80%", maxWidth: "30em" }}>
          <Form>
            <Form.Field>
              <label>Course Threshold</label>
              <input 
                type='number' 
                placeholder='Some Number...' 
                onInput={e => setCourseThreshold(parseInt(e.target.value))} 
              />
            </Form.Field>
            <Form.Field>
              <label>Company Threshold</label>
              <input
                type='number'
                placeholder='Some Number...'
                onInput={e => setCompanyThreshold(parseInt(e.target.value))}
              />
            </Form.Field>
            <Button onClick={_ => onFilter()}>Filter</Button>
          </Form>
          {
            editState.error || error
            ?
            <Message negative>{error ? errMsg : editState.errMsg}</Message>
            :
            null
          }
          {
            editState.success
            ?
            <Message positive>Update Thresholds Success!</Message>
            :
            null
          }
        </Grid.Column>
        <Grid.Column>
          {display}
        </Grid.Column>
      </Grid.Row>
    </Grid>
  )
}

