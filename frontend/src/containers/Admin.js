import React from 'react';
import { Header, Icon, Divider, Grid } from 'semantic-ui-react';
import { RegisterForm, FileUpload, CreateEventForm, CreateTicketForm } from '../components';

const Admin = () => {
  console.log("[*] Viewing Admin Page");

  return (
    <div style={{marginTop: "2em", width: "80%"}}>
      <Header as='h2' icon textAlign='center'>
        <Icon name='user' circular />
        <Header.Content>Admin Page</Header.Content>
      </Header>
      <Divider horizontal>
        <Header as='h4'>
          <Icon name='user plus' />
          Add User
        </Header>
      </Divider>
      <Grid textAlign="center" style={{width: "100%", marginTop: "2vh"}}>
        <Grid.Column style={{ width: "80%", maxWidth: "30em" }}>
          <RegisterForm />
          <FileUpload 
            name="Import Users from File"
            header="Upload a .csv file"
            help="A CSV File with four columns: Name, Group, Email, Password"
            style={{margin: "1vh 0"}}
          />
        </Grid.Column>
      </Grid>
      <Divider horizontal>
        <Header as='h4'>
          <Icon name='qrcode' />
          Export User QR Code
        </Header>
      </Divider>
      <Divider horizontal>
        <Header as='h4'>
          <Icon name='calendar' />
          Create Event
        </Header>
      </Divider>
      <Grid textAlign="center" style={{width: "100%", marginTop: "2vh"}}>
        <Grid.Column style={{ width: "80%", maxWidth: "30em" }}>
          <CreateEventForm />
          <FileUpload 
            name="Import Events from File"
            header="Upload a .csv file"
            help="A CSV File with four columns: Name, Admin Email, Time Begin, Time End"
            style={{margin: "1vh 0"}}
          />
        </Grid.Column>
      </Grid>
      <Divider horizontal>
        <Header as='h4'>
          <Icon name='food' />
          Give Food Ticket
        </Header>
      </Divider>
      <Grid textAlign="center" style={{width: "100%", marginTop: "2vh"}}>
        <Grid.Column style={{ width: "80%", maxWidth: "30em" }}>
          <CreateTicketForm />
          <FileUpload 
            name="Import Tickets from File"
            header="Upload a .csv file"
            help="A CSV File with three columns: Owner, Ticket Type, Date"
            style={{margin: "1vh 0"}}
          />
        </Grid.Column>
      </Grid>
      <Divider horizontal>
        <Header as='h4'>
          <Icon name='gift' />
          Lottery
        </Header>
      </Divider>
    </div>
  )
}

export default Admin;