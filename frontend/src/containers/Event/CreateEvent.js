import React from 'react';
import { Grid, Form, Button, Message, Icon, Header } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { BACKEND } from '../../config';

const [IDLE, LOADING, ERROR, DONE] = [0, 1, 2, 3];

const mapStateToProps = (state) => ({
  token: state.user.token,
  id: state.user.id
})

class CreateEvent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      err: "",
      msg: "",
      createStatus: IDLE,
      nameStatus: IDLE,
      nameUsed: false,
      redirect: false
    }
    this.name = "";
    this.password = "";
    this.beginDate = "";
    this.beginTime = "";
    this.endDate = "";
    this.endTime = "";
  }

  checkName() {
    if(this.state.nameStatus === LOADING) return;
    this.setState({nameStatus: LOADING});
    window.setTimeout(() => {
      if(this.name === "") {
        this.setState({nameStatus: IDLE, nameUsed: false});
        return;
      }
      else this.setState({nameStatus: IDLE});
      fetch(BACKEND+`/event?name=${this.name}`)
      .then(res => {
        if(res.status === 404) {
          this.setState({nameStatus: DONE, nameUsed: false});
          return;
        }
        else if(res.status !== 200) {
          this.setState({nameStatus: ERROR});
        }
        else{
          res.json()
          .then(data => {
            if(data) this.setState({nameStatus: DONE, nameUsed: true});
            else this.setState({nameStatus: DONE, nameUsed: false});
          })
        }
      })
      .catch(err => {
        this.setState({nameStatus: ERROR});
        console.error(err);
      });
    }, 500);
  }

  async onSubmit(e) {
    this.setState({createStatus: LOADING});
    e.preventDefault();
    
    const name = this.name;
    const password = this.password;
    const begin =  Date.parse(this.beginDate + " " + this.beginTime);
    const end =  Date.parse(this.endDate + " " + this.endTime);
    if(end <= begin) {
      this.setState(state => {
        state.err = "End time should be later than begin time!"
        state.createStatus = ERROR;
        return state;
      })
      return;
    }

    const setError = (msg) => {
      this.setState(state => {
        state.createStatus = ERROR;
        state.err = (
          <React.Fragment>
            <Message.Content>
              <Message.Header>Create Event Failed!</Message.Header>
              {msg}
            </Message.Content>
          </React.Fragment>
        )
        return state;
      })
      return;
    }

    fetch(BACKEND+"/event", {
      method: "POST",
      body: JSON.stringify({name, password, begin, end}),
      headers: {'authorization': this.props.token, 'content-type': "application/json"}
    })
    .then(res => {
      if(res.status === 200) {
        const link = `/events`;
        this.setState(state => {
          state.createStatus = IDLE;
          state.msg = (
            <React.Fragment>
              <Message.Content>
                <Message.Header>Creation Success!</Message.Header>
                Check your election <Link to={link}>here</Link>
              </Message.Content>
            </React.Fragment>
          );
          return state;
        })
      }
      else {
        res.text().then(data => setError(data));
      }
    })
    .catch(error => {
      console.error(error);
      setError(error);
    })
  }

  render() {
    const nameLoading = this.state.nameStatus === LOADING;
    const formLoading = this.state.createStatus === LOADING;
    let nameMsg = null;
    if(this.state.nameStatus === DONE) {
      if(this.state.nameUsed) {
        nameMsg = (
          <span style={{color: "red"}}>Name is used!</span>
        );
      }
      else nameMsg = (
        <span style={{color: "green"}}>Name is available!</span>
      );
    }

    return (
      <Grid textAlign="center" style={{marginTop: "2vh"}}>
        <Grid.Column style={{ maxWidth: 500 }}>
          <Header as='h2' icon textAlign='center'>
            <Icon name='plus' circular />
            <Header.Content>Create Event</Header.Content>
          </Header>
          <Form onSubmit={e => this.onSubmit(e)} loading={formLoading}>
            <Form.Field required>
              <label>Name</label>
              <Form.Input type="text" required={true} placeholder="e.g. Keynote" id="name" loading={nameLoading} onChange={e => { this.name = e.target.value; this.checkName(); }} />
              {nameMsg}
            </Form.Field>
            <Form.Field>
              <label>Password</label>
              <Form.Input type="password" required={false} id="password" onChange={e => { this.password = e.target.value; }} />
            </Form.Field>
            <Form.Field required>
              <label>Time Range</label>
              <Form.Group widths="equal">
                <Form.Input type="date" required={true} id="dateBegin" onChange={e => { this.beginDate = e.target.value }} />
                <Form.Input type="time" required={true} id="timeBegin" onChange={e => { this.beginTime = e.target.value }} />
              </Form.Group>
              <label style={{textDecoration: "none", marginBottom: "1em"}}>to</label>
              <Form.Group widths="equal">
                <Form.Input type="date" required={true} id="dateEnd" onChange={e => { this.endDate = e.target.value }} />
                <Form.Input type="time" required={true} id="timeEnd" onChange={e => { this.endTime = e.target.value }} />
              </Form.Group>
            </Form.Field>
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
            <Button color="green" type="submit">
              Create
            </Button>
          </Form>
        </Grid.Column>
      </Grid>
    );
  }
}

export default connect(mapStateToProps)(CreateEvent);