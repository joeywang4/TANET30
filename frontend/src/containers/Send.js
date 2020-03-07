import React, { Component } from 'react';
import { Loader, Input, Button, Message } from 'semantic-ui-react';
import { connect } from 'react-redux';
import QrReader from 'react-qr-reader'
import { BACKEND } from '../config';

const mapStateToProps = (state) => ({
  token: state.user.token
})

class Send extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scanLoading: false,
      sendLoading: false,
      toUser: null,
      success: "",
      err: ""
    }
    this.qrcodeURL = "";
    this.amount = 0;
  }

  handleScan = async (data) => {
    if(!data || this.state.scanLoading) return
    const failed = () => {
      this.setState({scanLoading: false});
      return;
    }

    this.setState({scanLoading: true});
    const toUser = await fetch(BACKEND+`/user?id=${data}`)
    .then(res => {
      if(res.status !== 200) return failed();
      else return res.json();
    })
    .then(data => data);
    this.setState({scanLoading: false, toUser});
  }

  handleError = err => {
    console.error(err)
  }

  send = () => {
    if(!this.state.toUser) return;
    this.setState({sendLoading: true});
    fetch(BACKEND+"/TX", {
      method: "POST",
      body: JSON.stringify({ to: this.state.toUser.id, amount: this.amount }),
      headers: { authorization: this.props.token, 'content-type': "application/json" }
    })
    .then(res => {
      if(res.status === 200) {
        this.setState(state => {
          state.sendLoading = false;
          state.success = "Transaction success!";
          state.err = "";
          return state;
        })
      }
      else {
        this.setState(state => {
          state.sendLoading = false;
          state.err = "Transaction failed!";
          state.success = "";
          return state;
        })
      }
    })
  }

  render() {
    return (
      <div style={{ 
        width: "50%",
        maxWidth: "800px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        <QrReader
          delay={300}
          onError={this.handleError}
          onScan={this.handleScan}
          style={{maxWidth: "500px", width: "100%"}}
        />
        {this.state.scanLoading?<Loader active>Loading...</Loader>:null}
        <h3>{this.state.toUser?`Give ${this.state.toUser.name}`:""}</h3>
        <div>
          <Input
            icon="dollar sign"
            iconPosition='left'
            type="number"
            onChange={e => {this.amount = e.target.value}}
          />
          <Button color="green" onClick={_ => this.send()} >ok!</Button> 
        </div>
        {this.state.success===""?null:<Message success content={this.state.success} />}
        {this.state.err===""?null:<Message error content={this.state.err} />}
      </div>
    )
  }
}


export default connect(mapStateToProps)(Send);