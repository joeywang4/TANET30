import React from 'react';
import { Header, Icon, Divider, Grid } from 'semantic-ui-react';
import {
  RegisterForm,
  FileUpload,
  CreateEventForm,
  AddAuthorForm,
  CreateTicketForm,
  NewUserHandler,
  ExportUserHandler,
  AddAuthorHandler,
  CreatePaperHandler,
  NewEventHandler,
  NewTicketHandler,
  UpdateMeals
} from '../components';
import { Lottery, RenameButton } from './';

const Admin = () => {
  return (
    <div style={{ marginTop: "2em", width: "80%" }}>
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
      <Grid textAlign="center" verticalAlign='middle' style={{ width: "100%", marginTop: "2vh" }}>
        <Grid.Row columns={2}>
          <Grid.Column style={{ width: "80%", maxWidth: "30em" }}>
            <RegisterForm />
          </Grid.Column>
          <Grid.Column>
            <FileUpload
              name="Import Users from File"
              header="Upload a .csv file"
              help="A CSV File with four columns: Name, Group, Email, Password"
              Handler={NewUserHandler}
              icon="download"
              style={{ margin: "1vh 0" }}
            />
            <br />
            <FileUpload
              name="Export User QR-Code"
              header="Upload a .csv file"
              help="A CSV File with four columns: Name, Group, Email, Password"
              Handler={ExportUserHandler}
              icon="upload"
              style={{ margin: "1vh 0" }}
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>
      <Divider horizontal>
        <Header as='h4'>
          <Icon name='calendar' />
          Create Event
        </Header>
      </Divider>
      <Grid textAlign="center" verticalAlign="middle" style={{ width: "100%", marginTop: "2vh" }}>
        <Grid.Row columns={2}>
          <Grid.Column style={{ width: "80%", maxWidth: "30em" }}>
            <CreateEventForm />
          </Grid.Column>
          <Grid.Column>
            <FileUpload
              name="Import Events from File"
              header="Upload a .csv file"
              help={
                <React.Fragment>
                  A CSV File with four columns: Name, Admin Email, Date, Reward<br/>
                  e.g. <i>My First Event,foo@test.com,2020-04-01,100</i><br />
                  Note that the time string should be ISO 8601 formated.
                </React.Fragment>
              }
              Handler={NewEventHandler}
              icon="download"
              style={{ margin: "1vh 0" }}
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>

      <Divider horizontal>
        <Header as='h4'>
          <Icon name='pencil' />
          Add author
        </Header>
      </Divider>
      <Grid textAlign="center" verticalAlign="middle" style={{ width: "100%", marginTop: "2vh" }}>
        <Grid.Row columns={2}>
          <Grid.Column style={{ width: "80%", maxWidth: "30em" }}>
            <AddAuthorForm />
          </Grid.Column>
          <Grid.Column>
            <FileUpload
              name="Import authors from File"
              header="Upload a .csv file"
              help={
                <React.Fragment>
                  A CSV File with multiple columns: Event Name, 1st Author Email, 2nd Author Name, 3rd Author Name, ...(in order)<br/>
                  e.g. <i>testEvent0821,author1@test.com,author2@test.com,author3@test.com</i><br />
                </React.Fragment>
              }
              Handler={AddAuthorHandler}
              icon="download"
              style={{ margin: "1vh 0" }}
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>

      <Divider horizontal>
        <Header as='h4'>
          <Icon name='food' />
          Give Food Ticket
        </Header>
      </Divider>
      <Grid textAlign="center" verticalAlign="middle" style={{ width: "100%", marginTop: "2vh" }}>
        <Grid.Row columns={2}>
          <Grid.Column style={{ width: "80%", maxWidth: "30em" }}>
            <CreateTicketForm />
          </Grid.Column>
          <Grid.Column>
            <FileUpload
              name="Import Tickets from File"
              header="Upload a .csv file"
              help={
                <React.Fragment>
                  A CSV File with three columns: Owner Email, Ticket Type, Date<br />
                  e.g. <i>foo@test.com,lunch,2020-04-20</i><br />
                  Ticket Type can be lunch or dinner<br />
                  Note that the time string should be ISO 8601 formated.
                </React.Fragment>
              }
              Handler={NewTicketHandler}
              icon="download"
              style={{ margin: "1vh 0" }}
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>
     <Divider horizontal>
        <Header as='h4'>
          <Icon name = 'cart plus' />
          Update Mealboxes Amount
        </Header>
      </Divider>
      <Grid textAlign="center" verticalAlign="middle" style={{ width: "100%", marginTop: "2vh" }}>
        <Grid.Row columns={2}>
          <Grid.Column style={{ width: "80%", maxWidth: "30em" }}>
            <UpdateMeals />
          </Grid.Column>
          <Grid.Column>
          </Grid.Column>
        </Grid.Row>
      </Grid>
      <Divider horizontal>
        <Header as='h4'>
          <Icon name='gift' />
          Lottery
        </Header>
      </Divider>
      <Lottery />

      <Divider horizontal>
        <Header as='h4'>
          <Icon name='address card' />
          Add Author Infos
        </Header>
      </Divider>
      <Grid textAlign="center" verticalAlign="middle" style={{ width: "100%", marginTop: "2vh" }}>
        <Grid.Row columns={2}>
          <Grid.Column style={{ width: "80%", maxWidth: "30em" }}>
            <RenameButton />
            
          </Grid.Column>
          <Grid.Column>
            <FileUpload
              name="Import papers' info from file"
              header="Upload a .csv file"
              help={
                <React.Fragment>
                  A CSV File with three columns: Event Name, Paper Id, Paper Title, Paper Authors, Paper Group, Paper Content<br />
                  e.g. <i>testEvent0927, paperID_09272206, "paperTitle1", "author1 author2 author3 author4", "This is content for paperTitle1 in testEvent0927."</i><br />
                  <br />
                </React.Fragment>
              }
              Handler={CreatePaperHandler}
              icon="download"
              style={{ margin: "1vh 0" }}
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>

    </div>
  )
}

export default Admin;
