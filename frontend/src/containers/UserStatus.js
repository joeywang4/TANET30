import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Status } from '../components';
import { BACKEND } from '../config';

const mapStateToProps = (state) => ({
  name: state.user.name,
  id: state.user.id
})

class UserStatus extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true
    }
    this.TXs = [];
    this.getTX();
  }

  async getTX() {
    const TXs = await fetch(BACKEND+`/TX?id=${this.props.id}`)
    .then(res => res.json())
    .then(data => data);
    this.TXs = TXs;
    this.setState({loading: false});
  }

  render() {
    let balance = 0;
    for(let TX of this.TXs) {
      if(TX.from === this.props.id) balance -= parseInt(TX.amount);
      else balance += parseInt(TX.amount);
    }
    return <Status loading={this.state.loading} balance={balance} name={this.props.name} TXs={this.TXs} />
  }
}


export default connect(mapStateToProps)(UserStatus);