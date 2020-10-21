import React from 'react';
import { Grid, Message, Icon, Header, Loader } from 'semantic-ui-react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { login } from '../../actions';
import { useLogin } from '../../hooks';

const mapStateToProps = () => ({})
const mapDispatchToProps = { login };

const AutoLogin = ({email, password, login}) => {
  const [connection, loginAPI] = useLogin();

  if(connection.success) {
    login(connection.token, connection.name, connection.email, connection.id, connection.group);
    return <Redirect to="/home" />;
  }
  if(connection.isInit()) {
    loginAPI(email, password);
  }

  return (
    <Grid textAlign="center" style={{ width: "100%", marginTop: "2vh"}}>
      <Grid.Column style={{ width: "80%", maxWidth: "30em" }}>
        <Header as='h2' icon textAlign='center'>
          <Icon name='user circle' />
          <Header.Content>Login With QR-Code</Header.Content>
        </Header>
        {connection.error
          ?
          <Message negative>{connection.errMsg}</Message>
          :
          null
        }
        {connection.loading
          ?
          <Loader active inline='centered' />
          :
          null
        }
        </Grid.Column>
    </Grid>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(AutoLogin);