import React from 'react';
import { Grid, Icon, Header } from 'semantic-ui-react';
import { RegisterForm } from '../components';

const Register = () => {
  return (
    <Grid textAlign="center" style={{width: "100%", marginTop: "2vh"}}>
      <Grid.Column style={{ width: "80%", maxWidth: "30em" }}>
        <Header as='h2' icon textAlign='center'>
          <Icon name='user plus'/>
          <Header.Content>Register</Header.Content>
        </Header>
        <RegisterForm />
      </Grid.Column>
    </Grid>
  );
}

export default Register;