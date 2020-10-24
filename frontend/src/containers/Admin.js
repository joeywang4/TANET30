import React from 'react';
import { Header, Icon, Divider, Grid, Button } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import {
  RegisterForm,
  FileUpload,
  CreateEventForm,
  PriceTableHandler,
  CreateTicketForm,
  ChangeUserNameForm,
  NewUserHandler,
  ExportUserHandler,
  CreatePaperHandler,
  NewEventHandler,
  NewTicketHandler,
  UpdateMeals, 
  ViewAllMeals
} from '../components';
import { Lottery } from './';

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
              help="A CSV File with six columns: Name, Group, Email, Password, Sharing(yes/no), Sector"
              Handler={NewUserHandler}
              icon="download"
              style={{ margin: "1vh 0" }}
            />
            <br />
            <FileUpload
              name="Export User QR-Code"
              header="Upload a .csv file"
              help="A CSV File with four columns: Name, Group, Email, Password, Sharing(yes/no), Sector"
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
          <Icon name='newspaper' />
          Add Price Table / Create Papers
        </Header>
      </Divider>
      <Grid textAlign="center" verticalAlign="middle" style={{ width: "100%", marginTop: "2vh" }}>
        <Grid.Row columns={2}>
          <Grid.Column style={{ width: "80%", maxWidth: "30em" }}>
            <FileUpload
              name="Import price table from file"
              header="Upload a .csv file"
              help={
                <React.Fragment>
                  A CSV File with two columns: itemName, price<br />
                  e.g. <i>T-shirt, 2000</i><br />
                  <br />
                </React.Fragment>
              }
              Handler={PriceTableHandler}
              icon="download"
              style={{ margin: "1vh 0" }}
              />
          </Grid.Column>
          <Grid.Column>
            <FileUpload
              name="Import papers' info from file"
              header="Upload a .csv file"
              help={
                <React.Fragment>
                  A CSV File with six columns: Event Name, Paper Group, Paper Id, Paper Title, Paper Authors, Paper Content<br />
                  e.g. <i>testEvent0927, A, paperID_09272206, "paperTitle1", "author1 author2 author3 author4", "This is content for paperTitle1 in testEvent0927."</i><br />
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
      
      <Divider horizontal>
        <Header as='h4'>
          <Icon name='address card' />
          Modify User
        </Header>
      </Divider>
      <Grid textAlign="center" verticalAlign="middle" style={{ width: "100%", marginTop: "2vh" }}>
        <Grid.Row columns={2}>
          <Grid.Column style={{ width: "80%", maxWidth: "30em" }}>
            <ChangeUserNameForm />
          </Grid.Column>
          <Grid.Column>
            {null}
          </Grid.Column>
        </Grid.Row>
      </Grid>

      <Divider horizontal>
        <Header as='h4'>
          <Icon name='ticket' />
          View All Ticket Amounts
        </Header>
      </Divider>
      <Grid textAlign="center" verticalAlign="middle" style={{ width: "100%", marginTop: "2vh" }}>
        <Grid.Row>
          <Grid.Column>
            <Button as={Link} to="/viewAllMeals">Click to View</Button>
          </Grid.Column>
        </Grid.Row>
      </Grid>

    </div>
  )
}

export default Admin;
