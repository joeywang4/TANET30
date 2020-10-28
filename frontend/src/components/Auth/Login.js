import React, { useState, useEffect } from 'react';
import { Grid, Form, Button, Message, Icon, Header, Divider } from 'semantic-ui-react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import QrReader from 'react-qr-reader';
import { login } from '../../actions';
import { useLogin } from '../../hooks';

const mapStateToProps = (state) => ({
  hasLoggedIn: state.user.token !== undefined
})
const mapDispatchToProps = { login };
const timeout = 1000;

const LoginForm = ({hasLoggedIn, login}) => {
  const [connection, loginAPI] = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [redirect, setRedirect] = useState(false);
  const [QRError, setQRError] = useState(false);

  useEffect(() => {
    if(connection.success && !redirect) {
      login(connection.token, connection.name, connection.email, connection.id, connection.group);
      setTimeout(() => {
        setRedirect(true);
      }, timeout)
    }
  }, [connection, redirect, login])

  const onLoad = (data) => {
    if(data === null) return;
    const [emailIdx, pwIdx] = [data.indexOf("email"), data.indexOf("password")];
    if(emailIdx === -1 || pwIdx === -1) {
      setQRError(true);
      return;
    }
    const [email, pw] = [
      data.substring(emailIdx+6, data.indexOf("&")), 
      data.substring(pwIdx+9, data.indexOf("#"))
    ]
    loginAPI(email, pw);
    setQRError(false);
  }

  const onError = () => {
    setQRError(true);
  }

  if((connection.isInit() && hasLoggedIn) || redirect) return <Redirect to="/home" />;

  return (
    <Grid textAlign="center" style={{ width: "100%", marginTop: "2vh"}}>
      <Grid.Column style={{ width: "80%", maxWidth: "30em" }}>
        <Header as='h2' icon textAlign='center'>
          <Icon name='user circle' />
          <Header.Content>Login With QR-Code</Header.Content>
        </Header>
        <QrReader
          delay={100}
          onError={onError}
          onScan={onLoad}
          style={{maxWidth: "500px", width: "100%", margin: "auto"}}
        />
        {connection.error || QRError
          ?
          <Message negative>{connection.errMsg || "QRCode Scanning Error"}</Message>
          :
          null
        }
        {connection.success
          ?
          <Message positive>Login Success!</Message>
          :
          null
        }
        <Divider horizontal>OR Manually Login</Divider>
        <Form
          onSubmit={e => {
            e.preventDefault();
            loginAPI(email, password);
          }}
        >
          <Form.Input icon='user' iconPosition='left' type="email" placeholder="Your email" required= {true} id="userEmail" onChange={e => {setEmail(e.target.value)}} />
          <Form.Input icon='lock' iconPosition='left' type="password" placeholder="Your password"   required={true} id="userPassword" onChange={e => {setPassword(e.target.value)}} />
          <Button color="green" type='submit'>Login</Button>
        </Form>
        </Grid.Column>
    </Grid>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginForm);