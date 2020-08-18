import React, { useState, Component } from 'react';
import { connect } from 'react-redux';
import { Form, Dropdown, Button, Message, Header, Divider } from 'semantic-ui-react';
import { BACKEND, ticketTypeEnum } from '../config';
import { useChooseUser, useAPI } from '../hooks';
import AddTicketForm from '../components/AddTicketForm';


const mapStateToProps = (state) => ({
  token: state.user.token,
  name: state.user.name,
  id: state.user.id,
  group: state.user.group
})


class UserAddTicket extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tickets: []
    }
  }

  render(){
    return(
      <div style={{marginTop:"2em", width: "80%"}}>
      <Divider horizontal>
        <Header as='h2'>
          Add Meal
        </Header>
      </Divider>
      <div style = {{ marginTop:"2em", marginBottom:"2em", display: "flex", flexDirection: "column", alignItems:"center"}}>
      <AddTicketForm/>
      </div>
      </div>
    )
  }
  
}


export default connect(mapStateToProps)(UserAddTicket);
