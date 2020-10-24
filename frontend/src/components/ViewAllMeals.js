import React from 'react';
import { useSelector } from 'react-redux';
import { Grid, Table } from 'semantic-ui-react';
import { BACKEND } from '../config';
import { useAPI } from '../hooks';

const ViewAllMeals = () => {
  const { token } = useSelector(state => state.user);
  const [getTicketState, getTicket] = useAPI("json");
  let date_to_ticket = {};


  const ticketType = (type) => {
    if(type == 'lunch') return 0;
    else if(type == 'dinner') return 1;
    else if(type == 'lunch(vegan)') return 2;
    return 3;
  }

  if(getTicketState.isInit()){
    getTicket(
      BACKEND + `/ticket`,
      "GET",
      null,
      { 'authorization': token }
    );
  }

  if(getTicketState.success){
    for(let ticket of getTicketState.response) {
      const date = ticket.date;
      if(date_to_ticket[date] === undefined) {
        date_to_ticket[date] = [0,0,0,0];
      }
      date_to_ticket[date][ticketType(ticket.type)] += 1;
      console.log(date_to_ticket);
    }
  }

  return (
    <Grid textAlign='center' style={{  width: "40em",marginTop: "2vh"}}>
      <Grid.Column>
        <Table striped basic='very'>
          <Table.Header>
            <Table.Row>
              <Table.Cell>日期</Table.Cell>
              <Table.Cell>餐點</Table.Cell>
              <Table.Cell>數量</Table.Cell>
            </Table.Row>
          </Table.Header>
          
            {
              Object.keys(date_to_ticket).map(date => (
              <Table.Body>
                <Table.Row key={date}>
                  <Table.Cell rowSpan='4'>{date}</Table.Cell>
                  {/* <Table.Cell>{["L", "L(v)", "D", "D(v)"].join(", ")}</Table.Cell>
                  <Table.Cell>{date_to_ticket[date].join(", ")}</Table.Cell> */}
                  <Table.Cell>Lunch</Table.Cell>
                  <Table.Cell>{date_to_ticket[date][0]}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>Dinner</Table.Cell>
                  <Table.Cell>{date_to_ticket[date][1]}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>Lunch(Vegan)</Table.Cell>
                  <Table.Cell>{date_to_ticket[date][2]}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>Dinner(Vegan)</Table.Cell>
                  <Table.Cell>{date_to_ticket[date][3]}</Table.Cell>
                </Table.Row>
              </Table.Body>  
              ))
            }
        </Table>
      </Grid.Column>
    </Grid>
  );
}

export default ViewAllMeals;
