import React from 'react'
import { Grid, Form, Button, Message, Icon, Header } from 'semantic-ui-react'
import { Redirect } from 'react-router-dom'
import { BACKEND } from '../config';

class RegisterForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      err: "",
      msg: "",
      redirect: false
    }
    this.name = "";
    this.email = "";
    this.pwd = "";
  }

  render() {
    if(this.state.redirect) return <Redirect to="/login" />;
    
    return (
      <Grid textAlign="center" style={{width: "100%", marginTop: "2vh"}}>
        <Grid.Column style={{ width: "80%", maxWidth: "30em" }}>
          <Header as='h2' icon textAlign='center'>
            <Icon name='user plus'/>
            <Header.Content>Register</Header.Content>
          </Header>
          <Form
            onSubmit={e => {
              e.preventDefault();
              fetch(BACKEND+"/auth/register", {
                method: "POST",
                body: JSON.stringify({name: this.name, email: this.email, pwd: this.pwd}),
                headers: {'content-type': "application/json"}
              })
              .then(res => {
                if(res.status === 400 || res.status === 401 || res.status === 404){
                  res.text()
                  .then(text => {
                    console.error(text);
                    this.setState(state => {
                      state.err = text;
                      return state
                    });
                  })
                }
                else if(res.status === 200) {
                  window.setTimeout((() => {
                    this.setState(state => {
                      state.redirect = true;
                      return state;
                    })
                  }), 1000);
                  this.setState(state => {
                    state.msg = "Register success! Redirect in one second.";
                    return state
                  })
                }
              })
              .catch(err => {
                console.error(err);
              })
            }}
          >
            <Form.Field>
              <Form.Input icon='user' iconPosition='left' placeholder="Name" type="text" required={true} id="userName" onChange={e => { this.name = e.target.value }} />
            </Form.Field>
            <Form.Field>
              <Form.Input icon='mail' iconPosition='left' placeholder="Email" type="email" required={true} id="userEmail" onChange={e => { this.email = e.target.value }} />
            </Form.Field>
            <Form.Field>
              <Form.Input icon='lock' iconPosition='left' placeholder="Password" type="password" required={true} id="userPassword" onChange={e => { this.pwd = e.target.value }} />
            </Form.Field>
            <Button color="green" type="submit">
              Register
            </Button>
            {this.state.err
              ?
              <Message negative>{this.state.err}</Message>
              :
              null
            }
            {this.state.msg
              ?
              <Message positive>{this.state.msg}</Message>
              :
              null
            }
          </Form>
        </Grid.Column>
      </Grid>
    );
  }
}

export default RegisterForm;